const DEFAULT_WEATHER = {
  condition: 'Clear',
  temperature: 28,
  humidity: 56,
};

const WEATHER_ALIASES = {
  clear: 'Clear',
  clouds: 'Cloudy',
  cloudy: 'Cloudy',
  drizzle: 'Drizzle',
  rain: 'Rain',
  rainy: 'Rain',
  thunderstorm: 'Heavy Rain',
  snow: 'Cloudy',
  heatwave: 'Sunny',
  overcast: 'Overcast',
  haze: 'Hazy',
  hazy: 'Hazy',
  sunny: 'Sunny',
  partlycloudy: 'Partly Cloudy',
  'partly cloudy': 'Partly Cloudy',
};

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const roundTo = (value, digits = 2) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const normalizeWeatherCondition = (condition) => {
  const key = String(condition || '').trim().toLowerCase();
  if (!key) return 'Clear';
  const compact = key.replace(/\s+/g, '');
  return WEATHER_ALIASES[key] || WEATHER_ALIASES[compact] || 'Clear';
};

const inferHumidity = (condition, temperature, fallbackHumidity) => {
  const fallback = toNumber(fallbackHumidity, 0);
  if (fallback > 0) return clamp(fallback, 25, 98);

  if (condition === 'Rain' || condition === 'Drizzle') return 84;
  if (condition === 'Cloudy' || condition === 'Overcast') return 68;
  if (temperature >= 34) return 44;
  return 56;
};

const inferSeason = (month) => {
  if ([3, 4, 5].includes(month)) return 'summer';
  if ([6, 7, 8, 9].includes(month)) return 'monsoon';
  if ([10, 11].includes(month)) return 'autumn';
  return 'winter';
};

const inferPriceSegment = (price) => {
  if (price < 100) return 'low';
  if (price < 300) return 'medium';
  return 'high';
};

const inferRetailerSize = (contextSizeSignal) => {
  const signal = toNumber(contextSizeSignal, 0);
  if (signal >= 1200) return 'large';
  if (signal >= 350) return 'medium';
  return 'small';
};

const inferSeasonalFactor = ({ season, condition, categoryName }) => {
  const text = String(categoryName || '').toLowerCase();
  let factor = 1.0;

  if (season === 'monsoon' && /(cold|cough|flu|infection|antibiotic|allergy|respiratory)/.test(text)) {
    factor += 0.18;
  }
  if (season === 'summer' && /(hydration|ors|electrolyte|skin|sun|energy)/.test(text)) {
    factor += 0.14;
  }
  if ((condition === 'Rain' || condition === 'Drizzle') && /(pain|fever|cold|cough)/.test(text)) {
    factor += 0.08;
  }

  return roundTo(clamp(factor, 0.8, 1.45), 3);
};

const inferDiseaseRisk = ({ condition, temperature, categoryName }) => {
  const text = String(categoryName || '').toLowerCase();
  let score = 0.35;

  if (condition === 'Rain' || condition === 'Drizzle') score += 0.25;
  if (condition === 'Cloudy' || condition === 'Overcast') score += 0.1;
  if (temperature >= 34) score += 0.12;

  if (/(cold|cough|flu|infection|allergy|respiratory|fever|pain)/.test(text)) {
    score += 0.18;
  }

  return roundTo(clamp(score, 0.05, 0.99), 3);
};

const inferLeadTimeDays = (categoryName) => {
  const text = String(categoryName || '').toLowerCase();
  if (/(critical|oncology|insulin|cardiac)/.test(text)) return 4;
  return 2;
};

const inferSupplierReliability = (categoryName) => {
  const text = String(categoryName || '').toLowerCase();
  if (/(critical|oncology|rare)/.test(text)) return 0.86;
  return 0.92;
};

const getLocationName = (context = {}) => {
  const fromArea = String(context.localAreaName || '').trim();
  if (fromArea) return fromArea;

  const fromAddress = String(context.address || '').trim();
  if (!fromAddress) return 'unknown';

  const city = fromAddress.split(',').map((chunk) => chunk.trim()).filter(Boolean).slice(-2, -1)[0];
  return city || fromAddress.slice(0, 40) || 'unknown';
};

const buildModelFeatureRow = ({
  item,
  weather,
  context,
  now = new Date(),
}) => {
  const timestamp = now instanceof Date ? now : new Date(now);
  const month = timestamp.getMonth() + 1;
  const dayOfWeek = timestamp.getDay();
  const isoDate = timestamp.toISOString().slice(0, 10);

  const condition = normalizeWeatherCondition(weather?.condition || weather?.dominantCondition);
  const temperature = toNumber(weather?.temperature, toNumber(weather?.maxTemperature, DEFAULT_WEATHER.temperature));
  const humidity = inferHumidity(condition, temperature, weather?.humidity);

  const sellingPrice = toNumber(item.sellingPrice, toNumber(item.selling_price, toNumber(item.mrp, 0)));
  const mrp = toNumber(item.mrp, sellingPrice);
  const costPrice = toNumber(item.costPrice, sellingPrice > 0 ? sellingPrice * 0.72 : mrp * 0.72);
  const medicineId = String(item.medicine_id || item.medicineId || item.id || item.item_id || 'unknown');
  const retailerId = String(item.retailer_id || item.retailerId || context?.retailerId || 'unknown');

  const availableStock = toNumber(item.availableStock, toNumber(item.available_stock, 0));
  const reorderLevel = toNumber(item.reorderLevel, toNumber(item.reorder_level, 10));
  const storageLimit = toNumber(item.maxCapacity, toNumber(item.max_capacity, Math.max(availableStock * 2, reorderLevel * 4, 80)));

  const local30Days = toNumber(item.local30Days, Number.NaN);
  const local90DayAvg = toNumber(item.local90DayAvg, Number.NaN);
  const avgDaily = toNumber(item.avg_daily, Number.NaN);
  const projected30 = toNumber(item.projected30Days, Number.NaN);

  const dailyFromLocal = Number.isFinite(local30Days) ? local30Days / 30 : Number.NaN;
  const dailyFromAverage = Number.isFinite(avgDaily) ? avgDaily : Number.NaN;
  const dailyFromProjected = Number.isFinite(projected30) ? projected30 / 30 : Number.NaN;

  const baselineDaily = [dailyFromLocal, dailyFromAverage, dailyFromProjected]
    .find((value) => Number.isFinite(value) && value >= 0) ?? 0.2;

  const longWindowDaily = Number.isFinite(local90DayAvg)
    ? local90DayAvg / 30
    : baselineDaily;

  const trendPct = toNumber(item.trendPct, 0);
  const lag1 = Math.max(0, baselineDaily * (1 + clamp(trendPct / 100, -0.5, 0.5) * 0.2));
  const lag7 = Math.max(0, baselineDaily);
  const lag14 = Math.max(0, (lag7 * 0.7) + (longWindowDaily * 0.3));
  const rolling7 = Math.max(0, baselineDaily);
  const rolling14 = Math.max(0, (baselineDaily * 0.65) + (longWindowDaily * 0.35));
  const rolling28 = Math.max(0, (rolling14 * 0.7) + (longWindowDaily * 0.3));
  const rollingStd7 = Math.max(0.02, rolling7 * 0.35);
  const rollingMin7 = Math.max(0, rolling7 * 0.55);
  const rollingMax7 = Math.max(rolling7, rolling7 * 1.45);

  const daysOfStockLeft = rolling7 > 0 ? availableStock / rolling7 : 0;
  const margin = sellingPrice - costPrice;
  const marginPct = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;
  const inventoryValue = availableStock * costPrice;
  const availableBudget = Math.max(inventoryValue * 1.2, 5000);

  const season = inferSeason(month);
  const categoryName = String(item.categoryName || item.category_name || 'General');
  const seasonalFactor = inferSeasonalFactor({ season, condition, categoryName });
  const diseaseRiskScore = inferDiseaseRisk({ condition, temperature, categoryName });

  const avgOrderQuantity = Math.max(1, roundTo(rolling7 * 7, 3));
  const orderFrequencyDays = rolling7 > 0 ? clamp(Math.round(10 / Math.max(rolling7, 0.3)), 1, 14) : 7;

  const modelRow = {
    medicine_id: medicineId,
    retailer_id: retailerId,
    date: isoDate,
    month,
    day_of_week: dayOfWeek,
    week_of_year: toNumber(item.week_of_year, Math.ceil((timestamp.getDate() + 6) / 7)),
    is_weekend: dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0,

    season,
    medicine_type: String(item.type || item.medicine_type || 'general'),
    price_segment: inferPriceSegment(sellingPrice),
    weather_condition: condition,
    category_name: categoryName,
    retailer_size: String(item.retailer_size || inferRetailerSize(context?.retailerSizeSignal)).toLowerCase(),
    retailer_location: String(item.retailer_location || getLocationName(context)),

    is_generic: toNumber(item.isGeneric, toNumber(item.is_generic, 0)) > 0 ? 1 : 0,
    requires_rx: toNumber(item.requiresRx, toNumber(item.requires_rx, 0)) > 0 ? 1 : 0,

    lag_1_sales: roundTo(lag1, 4),
    lag_7_sales: roundTo(lag7, 4),
    lag_14_sales: roundTo(lag14, 4),
    rolling_avg_7: roundTo(rolling7, 4),
    rolling_avg_14: roundTo(rolling14, 4),
    rolling_avg_28: roundTo(rolling28, 4),
    rolling_std_7: roundTo(rollingStd7, 4),
    rolling_min_7: roundTo(rollingMin7, 4),
    rolling_max_7: roundTo(rollingMax7, 4),

    current_stock: roundTo(availableStock, 3),
    days_of_stock_left: roundTo(daysOfStockLeft, 3),
    reorder_level: roundTo(reorderLevel, 3),
    stockout_flag: availableStock <= 0 ? 1 : 0,
    storage_limit: roundTo(storageLimit, 3),

    cost_price: roundTo(costPrice, 3),
    selling_price: roundTo(sellingPrice, 3),
    margin: roundTo(margin, 3),
    margin_pct: roundTo(marginPct, 3),
    inventory_value: roundTo(inventoryValue, 3),
    available_budget: roundTo(availableBudget, 3),

    seasonal_factor: roundTo(seasonalFactor, 4),
    disease_risk_score: roundTo(diseaseRiskScore, 4),
    temperature_c: roundTo(temperature, 3),
    humidity_pct: roundTo(humidity, 3),

    lead_time_days: inferLeadTimeDays(categoryName),
    supplier_reliability: inferSupplierReliability(categoryName),
    avg_order_quantity: roundTo(avgOrderQuantity, 3),
    order_frequency_days: orderFrequencyDays,
    under_order_bias: roundTo(toNumber(item.under_order_bias, 0.2), 3),

    future_7day_demand: roundTo(Math.max(0, baselineDaily * 7), 3),
    units_sold_today: roundTo(Math.max(0, baselineDaily), 3),
  };

  return modelRow;
};

module.exports = {
  normalizeWeatherCondition,
  buildModelFeatureRow,
};
