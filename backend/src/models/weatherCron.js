const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const cron = require('node-cron');
const axios = require('axios');
const db = require('../db');

// run every 1 minute for testing
cron.schedule('* * * * *', async () => {
    try {
        console.log("⏳ Fetching 5-day look-ahead weather forecast...");

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=Pune&units=metric&appid=${process.env.WEATHER_API_KEY}`
        );

        let maxTemp = -100;
        let totalHum = 0;
        let dominantCondition = 'Clear';
        let highestSeverity = 0;

        const severityMap = {
          'Clear': 0, 'Clouds': 1, 'Drizzle': 2, 'Rain': 3, 'Snow': 4, 'Thunderstorm': 5
        };

        const list = response.data.list;

        list.forEach(item => {
            if (item.main.temp_max > maxTemp) maxTemp = item.main.temp_max;
            totalHum += item.main.humidity;
            
            const cond = item.weather[0].main;
            if ((severityMap[cond] || 0) > highestSeverity) {
                highestSeverity = severityMap[cond];
                dominantCondition = cond;
            }
        });

        const humidity = Math.round(totalHum / list.length);

        await db.query(
            `INSERT INTO weather_data (condition, temperature, humidity, timestamp) 
       VALUES (?, ?, ?, NOW())`,
            { replacements: [dominantCondition, maxTemp, humidity] }
        );

        console.log("✅ 5-Day Forecast stored:", dominantCondition, `(${maxTemp}°C)`);
    } catch (err) {
        console.error("❌ Weather error:", err.message);
    }
});