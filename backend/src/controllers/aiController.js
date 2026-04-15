const { GoogleGenerativeAI } = require('@google/generative-ai');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db');
const { buildRetailerDemandForecast } = require('../utils/businessForecast');
const { enhanceDemandForecastWithModel } = require('../utils/demandForecastEnhancer');

function getGeminiKey() {
  return process.env.GEMINI_API_KEY || '';
}

function getAIModel() {
  return process.env.AI_MODEL || 'gemini-1.5-flash';
}

async function callAI(systemPrompt, userPrompt, { temperature = 0.2, maxTokens = 2000 } = {}) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY not configured'), { statusCode: 503 });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: getAIModel(),
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const raw = response.text();
    
    return JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
  } catch (err) {
    if (err.message.includes('429')) {
      console.error('Gemini Rate Limit Exceeded (429)');
      throw Object.assign(new Error('AI is currently busy (Rate Limit). Please wait 30 seconds and try again.'), { statusCode: 429 });
    }
    console.error('Gemini call error:', err.message, err.stack);
    return null;
  }
}

// ─── Feature 1: MediGuard Drug Interaction Analysis ───
// Acts as a silent safety guardrail checking cart items for interactions.
exports.analyzeCartInteractions = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await sequelize.query(
      `
      SELECT
        COALESCE(m.name, ep.name) AS name,
        COALESCE(m.salt_name, '') AS "saltName",
        ci.quantity,
        COALESCE(m.type::text, 'product') AS type
      FROM cart_items ci
      JOIN carts c ON c.id = ci.cart_id AND c.user_id = :userId AND c.is_active = TRUE
      LEFT JOIN medicines m ON m.id = ci.medicine_id
      LEFT JOIN ecommerce_products ep ON ep.id = ci.ecommerce_product_id
      `,
      { type: QueryTypes.SELECT, replacements: { userId } }
    );

    if (items.length < 2) {
      return res.json({ hasCritical: false, warnings: [], message: 'Need at least 2 items for interaction analysis.' });
    }

    const medicineList = items
      .map((item, i) => `${i + 1}. ${item.name}${item.saltName ? ` (Salt: ${item.saltName})` : ''} — Qty: ${item.quantity}`)
      .join('\n');

    const systemPrompt = `You are MediGuard, a clinical pharmacology AI safety system for a medical delivery platform.
You analyze medicine combinations for dangerous interactions. You do NOT recommend new medicines. Your sole purpose is preventing adverse drug events.

Return ONLY valid JSON:
{
  "hasCritical": boolean,
  "warnings": [
    {
      "severity": "critical" | "moderate" | "informational",
      "medicines": ["Medicine A", "Medicine B"],
      "interaction": "Short description of the interaction",
      "risk": "What could happen",
      "recommendation": "What the patient should do (e.g., consult doctor, take 2 hours apart)"
    }
  ],
  "safetyScore": number (0-100, where 100 is fully safe),
  "summary": "One sentence overall safety summary"
}

Rules:
- Only flag REAL, clinically documented interactions
- "critical" = life-threatening risk
- "moderate" = requires monitoring
- "informational" = dietary or timing notes
- Detect duplicate therapies (same salt, different brands)
- Be concise.`;

    const userPrompt = `Analyze these medicines in my cart for interactions:\n\n${medicineList}`;

    const analysis = await callAI(systemPrompt, userPrompt, { temperature: 0.1, maxTokens: 1200 });

    if (!analysis) {
      return res.json({ hasCritical: false, warnings: [], message: 'Analysis unavailable.' });
    }

    res.json({
      hasCritical: Boolean(analysis.hasCritical),
      warnings: Array.isArray(analysis.warnings) ? analysis.warnings.slice(0, 10) : [],
      safetyScore: Number(analysis.safetyScore) || 100,
      summary: String(analysis.summary || 'No significant interactions detected.'),
      analyzedCount: items.length,
    });
  } catch (err) {
    console.error('MediGuard error:', err.message);
    res.status(500).json({ message: 'Drug interaction analysis failed.' });
  }
};

// ─── Feature 2: Smart AI Dispatch Engine (Admin) ───
// Optimizes courier routing by mapping pending orders to available agents using operations research patterns.
exports.runDispatchOptimization = async (req, res) => {
  try {
    // 1. Get all unassigned pending orders
    const pendingOrders = await sequelize.query(
      `
      SELECT
        o.id, o.total_amount, o.order_status,
        JSON_UNQUOTE(JSON_EXTRACT(o.delivery_address, '$.lat')) AS lat,
        JSON_UNQUOTE(JSON_EXTRACT(o.delivery_address, '$.lng')) AS lng,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
      FROM orders o
      WHERE o.order_status = 'pending' AND o.agent_id IS NULL
      LIMIT 15
      `,
      { type: QueryTypes.SELECT }
    );

    // 2. Get active agents and their current active workload
    const activeAgents = await sequelize.query(
      `
      SELECT
        a.id, a.name, a.status,
        (SELECT COUNT(*) FROM orders WHERE agent_id = a.id AND order_status IN ('assigned', 'picked_up')) as active_tasks
      FROM users a
      WHERE a.role = 'agent' AND a.status = 'active'
      `,
      { type: QueryTypes.SELECT }
    );

    if (!pendingOrders.length) {
      return res.json({ message: 'No pending orders to route.', success: false, assignments: [] });
    }
    if (!activeAgents.length) {
      return res.status(400).json({ message: 'No active agents available for dispatch.', success: false });
    }

    const systemPrompt = `You are an enterprise AI Logistics and Dispatch Router.
Your job is to assign a list of pending delivery orders to a list of active delivery agents.

Optimize for:
1. Load Balancing: Prevent giving one agent 5 orders while another has 0.
2. Fair Distribution: Respect the 'active_tasks' count. Give fewer new tasks to agents already busy.
3. Capacity: An agent should ideally have no more than 3 total active tasks concurrently.

Return ONLY valid JSON in this exact structure:
{
  "assignments": [
    {
      "orderId": 123,
      "agentId": 456,
      "reasoning": "Agent has lowest current workload"
    }
  ],
  "unassignedOrderIds": [789],
  "clusterSummary": "Brief operational summary of the routing plan"
}`;

    const userPrompt = `
PENDING ORDERS (${pendingOrders.length}):
${JSON.stringify(pendingOrders, null, 2)}

ACTIVE AGENTS (${activeAgents.length}):
${JSON.stringify(activeAgents, null, 2)}

Provide the optimal dispatch mapping.`;

    const plan = await callAI(systemPrompt, userPrompt, { temperature: 0.1, maxTokens: 1500 });

    if (!plan || !Array.isArray(plan.assignments)) {
      return res.status(500).json({ message: 'AI failed to generate a routing plan.' });
    }

    // Enhance response with agent names and order details for the UI preview
    const enrichedAssignments = plan.assignments.map(a => {
      const agent = activeAgents.find(ag => ag.id === a.agentId);
      const order = pendingOrders.find(o => o.id === a.orderId);
      return {
        ...a,
        agentName: agent ? agent.name : 'Unknown Agent',
        orderAmount: order ? order.total_amount : 0,
        itemCount: order ? order.item_count : 0
      };
    }).filter(a => a.agentName !== 'Unknown Agent' && a.orderAmount > 0);

    res.json({
      success: true,
      assignments: enrichedAssignments,
      unassignedOrderIds: plan.unassignedOrderIds || [],
      clusterSummary: plan.clusterSummary || 'Optimization complete.',
      metrics: {
        totalRouted: enrichedAssignments.length,
        agentsUtilized: new Set(enrichedAssignments.map(a => a.agentId)).size
      }
    });

  } catch (err) {
    console.error('Dispatch AI error:', err.message);
    res.status(500).json({ message: 'Routing optimization failed.' });
  }
};

// ─── Feature 3: Predictive AI Inventory Analytics (Retailer) ───
// Predicts low stock and potential dead stock based on recent ordering patterns and seasonal shifts.
exports.getInventoryPredictions = async (req, res) => {
  try {
    const userId = req.user.id;
    const retailerResult = await sequelize.query(
      'SELECT id FROM retailers WHERE user_id = :userId LIMIT 1',
      { type: QueryTypes.SELECT, replacements: { userId } }
    );

    if (!retailerResult.length) {
      return res.status(403).json({ message: 'Retailer profile not found.' });
    }
    const retailerId = retailerResult[0].id;

    // Fetch the retailer's current inventory state
    const currentInventory = await sequelize.query(
      `
      SELECT
        i.id AS inventoryId,
        COALESCE(m.name, ep.name) AS productName,
        COALESCE(m.salt_name, '') AS composition,
        i.stock_quantity AS currentStock,
        (i.stock_quantity * COALESCE(m.selling_price, ep.selling_price, 0))::float AS totalValue,
        i.last_updated AS lastUpdated
      FROM inventory i
      LEFT JOIN medicines m ON i.medicine_id = m.id
      LEFT JOIN ecommerce_products ep ON i.ecommerce_product_id = ep.id
      WHERE i.retailer_id = :retailerId AND i.stock_quantity > 0
      ORDER BY i.stock_quantity ASC
      LIMIT 30
      `,
      { type: QueryTypes.SELECT, replacements: { retailerId } }
    );

    if (currentInventory.length === 0) {
      return res.json({ predictions: [], summary: "Insufficient inventory data for AI analysis." });
    }

    const systemPrompt = `You are a B2B Predictive Supply Chain AI for a pharmaceutical aggregator.
Analyze this pharmacy's current stock levels and composition.

Identify:
1. "Risk of Stockout": High-demand or essential items (like basic painkillers, antacids, or chronic meds) with dangerously low stock (< 15 units).
2. "Dead Stock Warning": Niche or specialized items tying up capital (high 'totalValue') with high stock levels.
3. "Seasonal Predictor": Identify if any items in stock are relevant to current seasonal trends (e.g. anti-allergics, cold meds) and advise accordingly.

Return ONLY valid JSON:
{
  "summary": "High-level inventory health overview (2-3 sentences)",
  "insights": [
    {
      "type": "stockout_risk" | "dead_stock_warning" | "seasonal_opportunity" | "general_advice",
      "productName": "Name of the product",
      "currentStock": number,
      "severity": "high" | "medium" | "low",
      "recommendation": "Specific, actionable business advice (e.g., 'Restock 50 units immediately')"
    }
  ]
}`;

    const userPrompt = `Current Inventory Data:\n${JSON.stringify(currentInventory, null, 2)}`;

    let analytics;
    try {
      analytics = await callAI(systemPrompt, userPrompt, { temperature: 0.2, maxTokens: 1000 });
    } catch (aiErr) {
      console.log('API Error thrown:', aiErr.message);
    }

    if (!analytics || !Array.isArray(analytics.insights) || analytics.insights.length === 0) {
      console.log('[AI FALLBACK] Using local rule engine due to empty or null AI response.');
      
      const insights = [];
      let criticalCount = 0;
      
      for (const item of currentInventory) {
        const stock = item.currentStock !== undefined ? item.currentStock : item.currentstock;
        const name = item.productName !== undefined ? item.productName : item.productname;
        
        if (stock <= 15) {
          insights.push({
            type: "stockout_risk",
            productName: name,
            currentStock: stock,
            severity: "high",
            recommendation: `Restock immediately. Critical stock warning for ${name}.`
          });
          criticalCount++;
        } else if (stock >= 100) {
          insights.push({
            type: "dead_stock_warning",
            productName: name,
            currentStock: stock,
            severity: "medium",
            recommendation: "Consider launching a discount campaign to rotate excess inventory."
          });
        }
      }
      
      return res.json({ 
        success: true,
        insights, 
        summary: criticalCount > 0 ? `Action Required: Detected ${criticalCount} critical stockout risks.` : 'Inventory is within stable parameters.'
      });
    }

    res.json({
      success: true,
      summary: analytics.summary || 'Inventory analyzed successfully.',
      insights: analytics.insights
    });

  } catch (err) {
    console.error('Inventory AI error:', err.message);
    res.status(500).json({ message: 'Predictive analytics failed.' });
  }
};

// ─── Feature 4: Demand Forecasting (Retailer) ───
// Analyzes historical order trends spanning the last 12 months to predict future 30-day demand.
exports.getDemandForecast = async (req, res) => {
  try {
    const { category = 'General' } = req.body;
    const baseForecast = await buildRetailerDemandForecast(req.user.id, category);
    const enhanced = await enhanceDemandForecastWithModel(baseForecast);

    if (!enhanced.applied) {
      const fallbackWarnings = Array.isArray(baseForecast.warnings)
        ? [...baseForecast.warnings]
        : [];

      if (enhanced.reason) {
        fallbackWarnings.push(`ML demand model fallback: ${enhanced.reason}`);
      }

      return res.json({
        ...baseForecast,
        warnings: fallbackWarnings,
      });
    }

    return res.json(enhanced.forecast);
  } catch (err) {
    console.error('Demand forecast error:', err.message);
    res.status(err.statusCode || 500).json({ message: err.message || 'Forecasting engine unavailable.' });
  }
};
