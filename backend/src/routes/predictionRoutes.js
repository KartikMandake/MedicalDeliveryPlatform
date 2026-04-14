const express = require('express');
const router = express.Router();
const predictStock = require('../utils/predictStock');
const { protect, authorize } = require('../middleware/auth');
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');

let manualSimulation = null;

const normalizeWeatherCondition = (condition) => {
  if (!condition) return 'Clear';
  if (condition === 'Heatwave') return 'Clear';
  return condition;
};

async function getRetailerId(userId) {
  let rows = await sequelize.query(
    `SELECT id FROM retailers WHERE user_id = :userId LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { userId } }
  );
  return rows[0]?.id || null;
}

// GET /api/predictions
router.get('/', protect, authorize('retailer'), async (req, res) => {
    try {
        const retailerId = await getRetailerId(req.user.id);
        if (!retailerId) return res.status(404).json({ error: "Retailer not found" });

        // Ensure the view exists (Step 1.2) - Robust for both Meds and E-commerce
        // Ensure the view exists (Step 1.2) - Robust for both Meds and E-commerce
        await sequelize.query(`
          DROP VIEW IF EXISTS avg_daily_sales;
          CREATE VIEW avg_daily_sales AS
          SELECT 
            COALESCE(medicine_id, ecommerce_product_id) as item_id,
            SUM(quantity) / 30.0 as avg_daily
          FROM order_items
          GROUP BY COALESCE(medicine_id, ecommerce_product_id);
        `);

        // Use manual simulation if set, otherwise fetch latest from DB
        let weather = manualSimulation;
        if (!weather) {
            const weatherRows = await sequelize.query(
                `SELECT condition, temperature FROM weather_data ORDER BY "timestamp" DESC LIMIT 1`,
                { type: QueryTypes.SELECT }
            );
            weather = weatherRows[0] || { condition: 'Clear', temperature: 25 };
        }

        const data = await predictStock(retailerId, weather);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Prediction failed" });
    }
});

// POST /api/weather/simulate
router.post('/simulate', protect, async (req, res) => {
    const { condition, temp } = req.body;
    const normalizedCondition = normalizeWeatherCondition(condition);
    const normalizedTemp = Number(temp);
    const temperature = Number.isFinite(normalizedTemp) ? normalizedTemp : 25;
    manualSimulation = { condition: normalizedCondition, temperature };
  
    try {
        await sequelize.query(
            `
            INSERT INTO weather_data (condition, temperature, humidity, timestamp)
            VALUES (:condition, :temperature, :humidity, NOW())
            `,
            {
              replacements: {
                condition: normalizedCondition,
                temperature,
                humidity: 50,
              },
              type: QueryTypes.INSERT,
            }
        );
        res.json({ message: "Weather simulated successfully", simulation: manualSimulation });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
