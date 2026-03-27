const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const cron = require('node-cron');
const axios = require('axios');
const db = require('../db');

const PUNE_COORDINATES = {
  latitude: 18.5204,
  longitude: 73.8567,
};

const WEATHER_SEVERITY = {
  Clear: 0,
  Clouds: 1,
  Drizzle: 2,
  Rain: 3,
  Snow: 4,
  Thunderstorm: 5,
};

const mapWeatherCodeToCondition = (code) => {
  const normalizedCode = Number(code);

  if ([95, 96, 99].includes(normalizedCode)) return 'Thunderstorm';
  if ([71, 73, 75, 77, 85, 86].includes(normalizedCode)) return 'Snow';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(normalizedCode)) return 'Rain';
  if ([51, 53, 55, 56, 57].includes(normalizedCode)) return 'Drizzle';
  if ([1, 2, 3, 45, 48].includes(normalizedCode)) return 'Clouds';
  return 'Clear';
};

const getDominantCondition = (codes = []) => {
  let dominantCondition = 'Clear';
  let highestSeverity = -1;

  for (const code of codes) {
    const condition = mapWeatherCodeToCondition(code);
    const severity = WEATHER_SEVERITY[condition] ?? 0;
    if (severity > highestSeverity) {
      highestSeverity = severity;
      dominantCondition = condition;
    }
  }

  return dominantCondition;
};

const average = (values = []) => {
  const numericValues = values.map((value) => Number(value)).filter(Number.isFinite);
  if (!numericValues.length) return null;
  const total = numericValues.reduce((sum, value) => sum + value, 0);
  return total / numericValues.length;
};

const maxOf = (values = []) => {
  const numericValues = values.map((value) => Number(value)).filter(Number.isFinite);
  if (!numericValues.length) return null;
  return Math.max(...numericValues);
};

async function fetchFiveDayForecastSnapshot() {
  const params = new URLSearchParams({
    latitude: String(PUNE_COORDINATES.latitude),
    longitude: String(PUNE_COORDINATES.longitude),
    daily: 'weather_code,temperature_2m_max',
    hourly: 'relative_humidity_2m',
    forecast_days: '5',
    timezone: 'Asia/Kolkata',
  });

  const response = await axios.get(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    timeout: 10000,
  });

  const dailyWeatherCodes = response.data?.daily?.weather_code || [];
  const dailyMaxTemperatures = response.data?.daily?.temperature_2m_max || [];
  const hourlyHumidity = response.data?.hourly?.relative_humidity_2m || [];

  const temperature = maxOf(dailyMaxTemperatures);
  if (!dailyWeatherCodes.length || temperature === null) {
    throw new Error('Forecast response did not include expected weather fields');
  }

  return {
    condition: getDominantCondition(dailyWeatherCodes),
    temperature,
    humidity: Math.round(average(hourlyHumidity) ?? 50),
  };
}

// Run every minute for testing.
cron.schedule('* * * * *', async () => {
  try {
    console.log('[weather] Fetching 5-day forecast for Pune');

    const snapshot = await fetchFiveDayForecastSnapshot();

    await db.query(
      `
      INSERT INTO weather_data (condition, temperature, humidity, timestamp)
      VALUES (:condition, :temperature, :humidity, NOW())
      `,
      {
        replacements: snapshot,
      }
    );

    console.log(`[weather] Stored forecast snapshot: ${snapshot.condition} (${snapshot.temperature}C)`);
  } catch (err) {
    const status = err.response?.status;
    const detail = status ? `HTTP ${status}` : err.message;
    console.error(`[weather] Forecast update failed: ${detail}`);
  }
});
