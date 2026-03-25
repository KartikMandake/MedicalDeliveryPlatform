const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('../db.js');
const predictStock = async (retailerId, weatherData) => {
    try {
        if (!retailerId) throw new Error("retailerId is required for predictions");

        const results = await db.query(`
      SELECT 
        i.medicine_id,
        i.ecommerce_product_id,
        COALESCE(m.name, ep.name) AS medicine_name,
        COALESCE(mc.name, ec.name) AS category_name,
        i.stock_quantity,
        i.reserved_quantity,
        (i.stock_quantity - i.reserved_quantity) AS available_stock,
        COALESCE(a.avg_daily, 0) AS avg_daily
      FROM inventory i
      LEFT JOIN avg_daily_sales a ON COALESCE(i.medicine_id, i.ecommerce_product_id) = a.item_id
      LEFT JOIN medicines m ON i.medicine_id = m.id
      LEFT JOIN categories mc ON m.category_id = mc.id
      LEFT JOIN ecommerce_products ep ON i.ecommerce_product_id = ep.id
      LEFT JOIN categories ec ON ep.category_id = ec.id
      WHERE i.retailer_id = :retailerId
    `, {
            type: db.QueryTypes ? db.QueryTypes.SELECT : undefined,
            replacements: { retailerId }
        });

        // Sequelize .query might return an array of results directly or [results, metadata]
        const rows = Array.isArray(results[0]) ? results[0] : results;

        let latestWeather = weatherData;
        
        if (!latestWeather) {
            // Fetch advanced 5-Day forecast from weather_data ONLY if not provided
            const weatherRes = await db.query(
                `SELECT condition, temperature FROM weather_data ORDER BY timestamp DESC LIMIT 1`,
                { type: db.QueryTypes ? db.QueryTypes.SELECT : undefined }
            );
            latestWeather = weatherRes[0] || { condition: 'Clear', temperature: 25 };
        }

        const { condition, temperature: temp_val } = latestWeather;
        const temp_val_safe = temp_val || latestWeather.temp_max || 25;
        console.log(`[PREDICT] Using Weather: ${condition}, Temp: ${temp_val_safe}`);
        
        // Convert K to C if necessary
        const temp_max = temp_val_safe > 100 ? temp_val_safe - 273.15 : temp_val_safe;

        // STEP 2: Refined Heuristic Helper
        const getDemandContext = (category, weather) => {
            let multiplier = 1.0;
            let reason = null;
            const cat = (category || '').toLowerCase();
            const cond = weather.condition;
            const temp = weather.temp_max;
            
            if (cond === 'Rain') {
                if (cat.includes('antibiotic') || cat.includes('infection')) {
                    multiplier = 5.0;
                    reason = 'Heavy Rain: Critical surge in bacterial infections & water-borne diseases';
                } else if (cat.includes('cold') || cat.includes('cough') || cat.includes('flu')) {
                    multiplier = 8.0;
                    reason = 'Monsoon Crisis: Severe spike in viral respiratory cases across the region';
                } else if (cat.includes('pain') || cat.includes('fever')) {
                    multiplier = 3.5;
                    reason = 'Flood/Damp conditions trigger chronic pain & seasonal fevers';
                } else if (cat.includes('allergy')) {
                    multiplier = 2.0;
                    reason = 'Increased humidity and mold/pollen triggers allergies';
                } else if (cat.includes('helmintic')) {
                    multiplier = 2.8;
                    reason = 'Rain increases exposure to soil/water-borne parasites';
                }
            } else if (temp > 35) {
                if (cat.includes('hydration') || cat.includes('energy')) {
                    multiplier = 3.0;
                    reason = 'Heatwave: Critical risk of dehydration and exhaustion';
                } else if (cat.includes('skin') || cat.includes('rash')) {
                    multiplier = 2.2;
                    reason = 'Intense heat increases instances of heat rashes and fungal infections';
                } else if (cat.includes('blood pressure') || cat.includes('hypertens')) {
                    multiplier = 1.6;
                    reason = 'Severe heat affects cardiovascular stability and blood pressure';
                } else if (cat.includes('diabet') || cat.includes('sugar')) {
                    multiplier = 1.4;
                    reason = 'Heat impacts insulin sensitivity and glucose regulation';
                } else if (cat.includes('digestive') || cat.includes('stomach')) {
                    multiplier = 1.5;
                    reason = 'High temp increases food spoilage and gastrointestinal issues';
                }
            }
            
            return { multiplier, reason };
        };

        const predictions = rows.map(item => {
            const avg = Math.max(Number(item.avg_daily || 0), 0.1); // Ensure float and non-zero
            
            const { multiplier, reason } = getDemandContext(item.category_name, { condition, temp_max });
            if (multiplier !== 1) {
                console.log(`[PREDICT] Item: ${item.medicine_name}, Category: ${item.category_name}, Match: ${multiplier}x (${reason})`);
            }
            const adjusted_avg = avg * multiplier;
            
            const available = item.available_stock;

            // STEP 4: Before vs After (Smart Forecasting)
            const base_days = available / avg;
            const smart_days = available / adjusted_avg;

            let status = "SAFE";

            // STEP 7: Zero Stock Handling
            if (available === 0) {
                status = "OUT_OF_STOCK";
            } else if (smart_days < 3) {
                status = "CRITICAL";
            } else if (smart_days < 7) {
                status = "LOW";
            }

            const restock_quantity = Math.ceil(adjusted_avg * 10 - available);

            return {
                medicine_id: item.medicine_id,
                medicine_name: item.medicine_name,
                category: item.category_name,
                available_stock: available,
                avg_daily: avg,
                base_days: Math.round(base_days),
                smart_days: Math.round(smart_days),
                days_left: Math.round(smart_days), // used for sorting/status
                multiplier,
                reason,
                status,
                restock_quantity: restock_quantity > 0 ? restock_quantity : 0
            };
        });

        // STEP 6: Prioritize critical items
        predictions.sort((a, b) => a.smart_days - b.smart_days);

        return predictions;

    } catch (err) {
        console.error("Prediction error:", err.message);
    }
};

module.exports = predictStock;