const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('../db.js');
const { QueryTypes } = require('sequelize');
const { buildModelFeatureRow, normalizeWeatherCondition } = require('./modelFeatureBuilder');
const { predictDemandFromModel } = require('./modelInferenceClient');

const toNumber = (value, fallback = 0) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : fallback;
};

const roundTo = (value, digits = 2) => {
        if (!Number.isFinite(value)) return 0;
        const factor = 10 ** digits;
        return Math.round(value * factor) / factor;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const predictStock = async (retailerId, weatherData) => {
    try {
        if (!retailerId) throw new Error("retailerId is required for predictions");

        const results = await db.query(`
      SELECT 
                COALESCE(i.medicine_id, i.ecommerce_product_id) AS item_id,
        i.medicine_id,
        i.ecommerce_product_id,
        COALESCE(m.name, ep.name) AS medicine_name,
        COALESCE(mc.name, ec.name) AS category_name,
                COALESCE(m.type::text, 'product') AS medicine_type,
                COALESCE(m.requires_rx, FALSE) AS requires_rx,
                COALESCE(m.mrp, ep.mrp, 0)::float AS mrp,
                COALESCE(m.selling_price, ep.selling_price, m.mrp, ep.mrp, 0)::float AS selling_price,
        i.stock_quantity,
        i.reserved_quantity,
                COALESCE(i.reorder_level, 10)::float AS reorder_level,
                COALESCE(i.max_capacity, GREATEST(i.stock_quantity * 2, 80))::float AS max_capacity,
                GREATEST(i.stock_quantity - i.reserved_quantity, 0) AS available_stock,
                COALESCE(a.avg_daily, 0)::float AS avg_daily
      FROM inventory i
      LEFT JOIN avg_daily_sales a ON COALESCE(i.medicine_id, i.ecommerce_product_id) = a.item_id
      LEFT JOIN medicines m ON i.medicine_id = m.id
      LEFT JOIN categories mc ON m.category_id = mc.id
      LEFT JOIN ecommerce_products ep ON i.ecommerce_product_id = ep.id
      LEFT JOIN categories ec ON ep.category_id = ec.id
      WHERE i.retailer_id = :retailerId
    `, {
            type: QueryTypes.SELECT,
            replacements: { retailerId }
        });

        // Sequelize .query might return an array of results directly or [results, metadata]
        const rows = Array.isArray(results[0]) ? results[0] : results;

        let latestWeather = weatherData;
        
        if (!latestWeather) {
            // Fetch advanced 5-Day forecast from weather_data ONLY if not provided
            const weatherRes = await db.query(
                `SELECT condition, temperature, humidity FROM weather_data ORDER BY timestamp DESC LIMIT 1`,
                { type: QueryTypes.SELECT }
            );
            latestWeather = weatherRes[0] || { condition: 'Clear', temperature: 25 };
        }

        const rawCondition = latestWeather.condition;
        const normalizedCondition = normalizeWeatherCondition(rawCondition);
        const tempVal = toNumber(latestWeather.temperature, toNumber(latestWeather.temp_max, 25));
        console.log(`[PREDICT] Using Weather: ${normalizedCondition}, Temp: ${tempVal}`);
        
        // Convert K to C if necessary
        const tempMax = tempVal > 100 ? tempVal - 273.15 : tempVal;
        const weatherContext = {
            condition: normalizedCondition,
            temperature: roundTo(tempMax, 2),
            humidity: toNumber(latestWeather.humidity, normalizedCondition === 'Rain' ? 85 : 58),
        };

        // STEP 2: Refined Heuristic Helper
        const getDemandContext = (category, weather) => {
            let multiplier = 1.0;
            let reason = null;
            const cat = (category || '').toLowerCase();
            const cond = weather.condition;
            const temp = weather.temp_max;
            
            if (cond === 'Rain' || cond === 'Heavy Rain') {
                if (cat.includes('antibiotic') || cat.includes('infection')) {
                    multiplier = 2.1;
                    reason = 'Heavy Rain: Critical surge in bacterial infections & water-borne diseases';
                } else if (cat.includes('cold') || cat.includes('cough') || cat.includes('flu')) {
                    multiplier = 2.4;
                    reason = 'Monsoon Crisis: Severe spike in viral respiratory cases across the region';
                } else if (cat.includes('pain') || cat.includes('fever')) {
                    multiplier = 1.8;
                    reason = 'Flood/Damp conditions trigger chronic pain & seasonal fevers';
                } else if (cat.includes('allergy')) {
                    multiplier = 1.45;
                    reason = 'Increased humidity and mold/pollen triggers allergies';
                } else if (cat.includes('helmintic')) {
                    multiplier = 1.6;
                    reason = 'Rain increases exposure to soil/water-borne parasites';
                }
            } else if (temp > 35) {
                if (cat.includes('hydration') || cat.includes('energy')) {
                    multiplier = 1.8;
                    reason = 'Heatwave: Critical risk of dehydration and exhaustion';
                } else if (cat.includes('skin') || cat.includes('rash')) {
                    multiplier = 1.45;
                    reason = 'Intense heat increases instances of heat rashes and fungal infections';
                } else if (cat.includes('blood pressure') || cat.includes('hypertens')) {
                    multiplier = 1.25;
                    reason = 'Severe heat affects cardiovascular stability and blood pressure';
                } else if (cat.includes('diabet') || cat.includes('sugar')) {
                    multiplier = 1.18;
                    reason = 'Heat impacts insulin sensitivity and glucose regulation';
                } else if (cat.includes('digestive') || cat.includes('stomach')) {
                    multiplier = 1.2;
                    reason = 'High temp increases food spoilage and gastrointestinal issues';
                }
            }
            
            return { multiplier, reason };
        };

        const modelFeatureRows = rows.map((item) => buildModelFeatureRow({
            item: {
                category_name: item.category_name,
                categoryName: item.category_name,
                type: item.medicine_type,
                requires_rx: item.requires_rx,
                mrp: item.mrp,
                selling_price: item.selling_price,
                available_stock: item.available_stock,
                reorder_level: item.reorder_level,
                max_capacity: item.max_capacity,
                avg_daily: item.avg_daily,
                local30Days: Math.max(toNumber(item.avg_daily, 0), 0) * 30,
                local90DayAvg: Math.max(toNumber(item.avg_daily, 0), 0) * 30,
                trendPct: 0,
            },
            weather: weatherContext,
            context: {
                retailerSizeSignal: rows.length * 12,
            },
            now: new Date(),
        }));

        const modelResponse = await predictDemandFromModel({
            rows: modelFeatureRows,
            target: 'units_sold_today',
        });

        const canUseModel = Boolean(
            modelResponse.ok &&
            Array.isArray(modelResponse.predictions) &&
            modelResponse.predictions.length === rows.length
        );

        if (!canUseModel && modelResponse.error) {
            console.warn(`[PREDICT] ML fallback active: ${modelResponse.error}`);
        }

        const predictions = rows.map((item, index) => {
            const avg = Math.max(toNumber(item.avg_daily, 0), 0.1); // Ensure float and non-zero
            
            const { multiplier, reason } = getDemandContext(item.category_name, { condition: normalizedCondition, temp_max: tempMax });
            if (multiplier !== 1) {
                console.log(`[PREDICT] Item: ${item.medicine_name}, Category: ${item.category_name}, Match: ${multiplier}x (${reason})`);
            }
            const adjustedAvg = avg * multiplier;

            const modelDaily = canUseModel
                ? Math.max(0, toNumber(modelResponse.predictions[index], adjustedAvg))
                : null;
            const effectiveDaily = canUseModel
                ? Math.max(0.05, (modelDaily * 0.8) + (adjustedAvg * 0.2))
                : Math.max(0.05, adjustedAvg);
            
            const available = Math.max(0, toNumber(item.available_stock, 0));

            // STEP 4: Before vs After (Smart Forecasting)
            const base_days = available / avg;
            const smart_days = available / effectiveDaily;

            let status = "SAFE";

            // STEP 7: Zero Stock Handling
            if (available === 0) {
                status = "OUT_OF_STOCK";
            } else if (smart_days < 3) {
                status = "CRITICAL";
            } else if (smart_days < 7) {
                status = "LOW";
            }

            const reorderLevel = toNumber(item.reorder_level, 10);
            const idealStock = Math.max(effectiveDaily * 10, reorderLevel * 1.8);
            const restock_quantity = Math.ceil(idealStock - available);
            const forecastDaily = canUseModel
                ? roundTo(clamp(effectiveDaily, 0, 99999), 4)
                : roundTo(clamp(adjustedAvg, 0, 99999), 4);

            return {
                medicine_id: item.medicine_id,
                medicine_name: item.medicine_name,
                category: item.category_name,
                available_stock: available,
                avg_daily: roundTo(avg, 4),
                base_days: Math.round(base_days),
                smart_days: Math.round(smart_days),
                days_left: Math.round(smart_days), // used for sorting/status
                multiplier: roundTo(multiplier, 3),
                reason,
                status,
                restock_quantity: restock_quantity > 0 ? restock_quantity : 0,
                forecast_daily: forecastDaily,
                model_daily: modelDaily === null ? null : roundTo(modelDaily, 4),
                demand_source: canUseModel ? `ml+weather (${modelResponse.source})` : 'weather-heuristic',
            };
        });

        // STEP 6: Prioritize critical items
        predictions.sort((a, b) => a.smart_days - b.smart_days);

        return predictions;

    } catch (err) {
        console.error("Prediction error:", err.message);
        throw err;
    }
};

module.exports = predictStock;