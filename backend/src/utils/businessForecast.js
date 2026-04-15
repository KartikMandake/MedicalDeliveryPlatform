const axios = require('axios');
const sequelize = require('../db');
const { QueryTypes } = require('sequelize');

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RADIUS_KM = 8;
const DEFAULT_LOCAL_MARKET_SHARE = 0.015;
const PAST_WEEKS = 12;
const FUTURE_WEEKS = 4;
const weekLabelFormatter = new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' });

const WEATHER_SEVERITY = {
  Clear: 0,
  Clouds: 1,
  Drizzle: 2,
  Rain: 3,
  Snow: 4,
  Thunderstorm: 5,
};

const WEATHER_SIGNAL_RULES = [
  {
    label: 'Monsoon care',
    keys: ['cold', 'cough', 'flu', 'infection', 'antibiotic', 'fever', 'pain', 'allergy', 'respiratory'],
    rainBoost: 1.18,
    cloudBoost: 1.08,
    heatBoost: 1.02,
  },
  {
    label: 'Hydration and heat protection',
    keys: ['hydration', 'ors', 'electrolyte', 'energy', 'vitamin', 'skin', 'sun', 'dehydration'],
    rainBoost: 1.01,
    cloudBoost: 1.02,
    heatBoost: 1.22,
  },
  {
    label: 'Chronic care refill pressure',
    keys: ['diabet', 'sugar', 'hypertens', 'cardiac', 'blood pressure', 'thyroid'],
    rainBoost: 1.03,
    cloudBoost: 1.02,
    heatBoost: 1.08,
  },
];

const UI_CATEGORY_MAP = {
  'Cold & Flu': ['Cold & Cough', 'Allergy'],
  'Chronic': ['Blood Pressure', 'Heart Care', 'Diabetes', 'Digestive Care'],
  'First Aid': ['Pain Relief', 'Fever & Pain'],
  'General': []
};

const safeNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const roundTo = (value, digits = 1) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const startOfWeek = (date) => {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const weekday = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - weekday);
  return current;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const haversineKm = (fromLat, fromLng, toLat, toLng) => {
  const lat1 = Number(fromLat);
  const lng1 = Number(fromLng);
  const lat2 = Number(toLat);
  const lng2 = Number(toLng);

  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
  const numericValues = values.map((value) => safeNumber(value, NaN)).filter(Number.isFinite);
  if (!numericValues.length) return null;
  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
};

async function getRetailerContext(retailerId) {
  const rows = await sequelize.query(
    `
    SELECT
      r.id,
      r.shop_name,
      r.lat,
      r.lng,
      COALESCE(r.radius_km, :defaultRadiusKm) AS radius_km,
      u.address
    FROM retailers r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.id = :retailerId
    LIMIT 1
    `,
    {
      type: QueryTypes.SELECT,
      replacements: {
        retailerId,
        defaultRadiusKm: DEFAULT_RADIUS_KM,
      },
    }
  );

  return rows[0] || null;
}

async function getAllMedicines(retailerId) {
  return sequelize.query(
    `
    SELECT
      m.id,
      m.name,
      COALESCE(m.salt_name, '') AS salt_name,
      COALESCE(m.manufacturer, '') AS manufacturer,
      COALESCE(c.name, 'General') AS category_name,
      COALESCE(m.category_id::text, 'uncategorized') AS category_id,
      COALESCE(m.type::text, 'general') AS type,
      COALESCE(m.section::text, 'general') AS section,
      COALESCE(m.mrp, 0)::float AS mrp,
      COALESCE(m.selling_price, m.mrp, 0)::float AS selling_price,
      COALESCE(m.requires_rx, FALSE) AS requires_rx,
      COALESCE(i.stock_quantity, 0)::int AS stock_quantity,
      COALESCE(i.reserved_quantity, 0)::int AS reserved_quantity,
      COALESCE(i.reorder_level, 10)::int AS reorder_level,
      i.id AS inventory_id
    FROM medicines m
    LEFT JOIN categories c ON c.id = m.category_id
    LEFT JOIN inventory i ON i.retailer_id = :retailerId AND i.medicine_id = m.id
    WHERE COALESCE(m.is_active, TRUE) = TRUE
    ORDER BY m.name ASC
    `,
    {
      type: QueryTypes.SELECT,
      replacements: { retailerId },
    }
  );
}

async function getRecentDeliveredMedicineOrders() {
  return sequelize.query(
    `
    SELECT
      o.id AS order_id,
      o.retailer_id,
      o.placed_at,
      COALESCE(NULLIF(o.delivery_address ->> 'lat', ''), NULL)::double precision AS lat,
      COALESCE(NULLIF(o.delivery_address ->> 'lng', ''), NULL)::double precision AS lng,
      COALESCE(o.delivery_address ->> 'city', '') AS city,
      COALESCE(o.delivery_address ->> 'pincode', '') AS pincode,
      oi.medicine_id,
      oi.quantity::int AS quantity,
      COALESCE(oi.total_price, oi.quantity * COALESCE(m.selling_price, m.mrp, 0))::float AS total_price,
      COALESCE(m.category_id::text, 'uncategorized') AS category_id,
      COALESCE(c.name, 'General') AS category_name
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN medicines m ON m.id = oi.medicine_id
    LEFT JOIN categories c ON c.id = m.category_id
    WHERE oi.medicine_id IS NOT NULL
      AND o.status = 'delivered'
      AND o.placed_at >= NOW() - INTERVAL '120 days'
    `,
    {
      type: QueryTypes.SELECT,
    }
  );
}

async function getAddressSignals() {
  return sequelize.query(
    `
    SELECT
      user_id,
      city,
      pincode,
      lat,
      lng
    FROM user_addresses
    WHERE lat IS NOT NULL AND lng IS NOT NULL
    `,
    {
      type: QueryTypes.SELECT,
    }
  );
}

async function getWeatherSignal(lat, lng) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null;

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      forecast_days: '5',
      timezone: 'Asia/Kolkata',
    });

    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      timeout: 10000,
    });

    const dailyCodes = response.data?.daily?.weather_code || [];
    const maxTemperatures = response.data?.daily?.temperature_2m_max || [];
    const minTemperatures = response.data?.daily?.temperature_2m_min || [];

    const dominantCondition = getDominantCondition(dailyCodes);
    const maxTemperature = Math.max(...maxTemperatures.map((value) => safeNumber(value, -Infinity)));
    const averageTemperature = average(maxTemperatures) ?? null;
    const minimumTemperature = Math.min(...minTemperatures.map((value) => safeNumber(value, Infinity)));

    if (!Number.isFinite(maxTemperature)) return null;

    let outlook = 'Stable conditions expected';
    if (dominantCondition === 'Thunderstorm' || dominantCondition === 'Rain' || dominantCondition === 'Drizzle') {
      outlook = 'Wet spell likely to lift fever, cold, and infection demand';
    } else if (maxTemperature >= 34) {
      outlook = 'Heat pressure likely to lift hydration and skin-care demand';
    } else if (dominantCondition === 'Clouds') {
      outlook = 'Cloud cover may keep respiratory and allergy demand elevated';
    }

    return {
      dominantCondition,
      maxTemperature: roundTo(maxTemperature, 1),
      averageTemperature: roundTo(averageTemperature ?? maxTemperature, 1),
      minimumTemperature: Number.isFinite(minimumTemperature) ? roundTo(minimumTemperature, 1) : null,
      outlook,
    };
  } catch {
    return null;
  }
}

const createWeekBuckets = (now) => {
  const currentWeekStart = startOfWeek(now);
  const firstActualStart = addDays(currentWeekStart, -(PAST_WEEKS - 1) * 7);

  const actual = Array.from({ length: PAST_WEEKS }, (_, index) => {
    const start = addDays(firstActualStart, index * 7);
    const end = addDays(start, 7);
    return {
      label: weekLabelFormatter.format(start),
      start,
      end,
      actualDemand: 0,
      projectedDemand: null,
    };
  });

  const future = Array.from({ length: FUTURE_WEEKS }, (_, index) => {
    const start = addDays(currentWeekStart, (index + 1) * 7);
    const end = addDays(start, 7);
    return {
      label: weekLabelFormatter.format(start),
      start,
      end,
      actualDemand: null,
      projectedDemand: 0,
    };
  });

  return { actual, future, firstActualStart, currentWeekStart };
};

const getWeatherMultiplier = (medicine, weatherSignal) => {
  if (!weatherSignal) return { multiplier: 1, reasons: [] };

  const searchableText = `${medicine.name} ${medicine.salt_name} ${medicine.category_name} ${medicine.section}`.toLowerCase();
  let multiplier = 1;
  const reasons = [];

  for (const rule of WEATHER_SIGNAL_RULES) {
    const matches = rule.keys.some((keyword) => searchableText.includes(keyword));
    if (!matches) continue;

    if (['Thunderstorm', 'Rain', 'Drizzle'].includes(weatherSignal.dominantCondition)) {
      multiplier *= rule.rainBoost;
      reasons.push(rule.label);
    } else if (weatherSignal.dominantCondition === 'Clouds') {
      multiplier *= rule.cloudBoost;
      reasons.push(rule.label);
    } else if (weatherSignal.maxTemperature >= 34) {
      multiplier *= rule.heatBoost;
      reasons.push(rule.label);
    }
  }

  return {
    multiplier: clamp(multiplier, 0.9, 1.45),
    reasons: [...new Set(reasons)].slice(0, 2),
  };
};

const getPriorityBucket = ({ projected30Days, inInventory, coverageDays, availableStock, reorderLevel }) => {
  if (!inInventory && projected30Days >= 6) return 'Launch';
  if (inInventory && projected30Days >= 6 && Number.isFinite(coverageDays) && coverageDays < 14) return 'Restock';
  if (inInventory && availableStock > Math.max(reorderLevel * 2, 20) && projected30Days <= 2) return 'Reduce';
  if (projected30Days >= 3) return 'Monitor';
  return 'Low';
};

function buildInsights({
  medicineForecasts,
  categoryForecasts,
  weatherSignal,
  nearbyHouseholds,
  retailerContext,
  warnings,
}) {
  const insights = [];
  const topLaunch = medicineForecasts.find((item) => item.priority === 'Launch');
  const topRestock = medicineForecasts.find((item) => item.priority === 'Restock');
  const topCategory = categoryForecasts[0];
  const slowMover = medicineForecasts.find((item) => item.priority === 'Reduce');

  if (topLaunch) {
    insights.push({
      icon: 'storefront',
      title: `Add ${topLaunch.name} to the assortment`,
      body: `${topLaunch.projected30Days} units are projected in the local catchment over the next 30 days and the store does not currently stock it.`,
    });
  }

  if (topRestock) {
    insights.push({
      icon: 'inventory_2',
      title: `Restock ${topRestock.name} early`,
      body: `${topRestock.coverageDays} days of coverage remain against projected demand, which is below the 14-day safety threshold.`,
    });
  }

  if (topCategory) {
    insights.push({
      icon: 'monitoring',
      title: `${topCategory.categoryName} is leading local demand`,
      body: `${topCategory.projected30Days} projected units and ${topCategory.sharePct}% demand share make it the strongest category near ${retailerContext.shop_name || 'this store'}.`,
    });
  }

  if (weatherSignal) {
    insights.push({
      icon: 'partly_cloudy_day',
      title: 'Weather signal has been blended into the forecast',
      body: `${weatherSignal.outlook}. The current five-day outlook is ${weatherSignal.dominantCondition.toLowerCase()} with highs near ${weatherSignal.maxTemperature}C.`,
    });
  }

  if (Number.isFinite(nearbyHouseholds) && nearbyHouseholds > 0) {
    insights.push({
      icon: 'groups',
      title: 'Local catchment depth is available',
      body: `${nearbyHouseholds} nearby household addresses were detected inside the forecast radius, improving confidence in the hyperlocal demand curve.`,
    });
  }

  if (slowMover) {
    insights.push({
      icon: 'schedule',
      title: `Watch ${slowMover.name} for slow movement`,
      body: `${slowMover.availableStock} units are on hand but only ${slowMover.projected30Days} units are projected next month, which ties up working capital.`,
    });
  }

  return insights.slice(0, 4).concat(
    warnings.slice(0, Math.max(0, 4 - Math.min(insights.length, 4))).map((warning) => ({
      icon: 'info',
      title: 'Forecast signal note',
      body: warning,
    }))
  ).slice(0, 4);
}

async function buildRetailerDemandForecast(userId, categoryFilter = 'General') {
  const retailerResult = await sequelize.query(
    'SELECT id FROM retailers WHERE user_id = :userId LIMIT 1',
    { type: QueryTypes.SELECT, replacements: { userId } }
  );

  if (!retailerResult.length) {
    const error = new Error('Retailer profile not found.');
    error.statusCode = 403;
    throw error;
  }

  const retailerId = retailerResult[0].id;
  const [retailerContext, allMedicines, allOrderRows, addressRows] = await Promise.all([
    getRetailerContext(retailerId),
    getAllMedicines(retailerId),
    getRecentDeliveredMedicineOrders(),
    getAddressSignals(),
  ]);

  // Apply category filtering
  let medicines = allMedicines;
  let orderRows = allOrderRows;

  if (categoryFilter && categoryFilter !== 'General') {
    const targetCategories = UI_CATEGORY_MAP[categoryFilter] || [];
    medicines = allMedicines.filter(m => targetCategories.includes(m.category_name));
    orderRows = allOrderRows.filter(o => targetCategories.includes(o.category_name));
  }

  if (!retailerContext) {
    const error = new Error('Retailer context not found.');
    error.statusCode = 404;
    throw error;
  }

  const weatherSignal = await getWeatherSignal(retailerContext.lat, retailerContext.lng);
  const now = new Date();
  const threshold30 = new Date(now.getTime() - 30 * DAY_MS);
  const threshold60 = new Date(now.getTime() - 60 * DAY_MS);
  const threshold90 = new Date(now.getTime() - 90 * DAY_MS);
  const { actual, future, firstActualStart } = createWeekBuckets(now);
  const hasStoreCoordinates =
    Number.isFinite(safeNumber(retailerContext.lat, NaN)) &&
    Number.isFinite(safeNumber(retailerContext.lng, NaN));
  const radiusKm = safeNumber(retailerContext.radius_km, DEFAULT_RADIUS_KM);
  const warnings = [];

  const nearbyAddresses = hasStoreCoordinates
    ? addressRows.filter((address) => {
        const distanceKm = haversineKm(retailerContext.lat, retailerContext.lng, address.lat, address.lng);
        return Number.isFinite(distanceKm) && distanceKm <= radiusKm;
      })
    : [];

  const nearbyHouseholds = new Set(nearbyAddresses.map((address) => address.user_id).filter(Boolean)).size;
  const localAreaName = (() => {
    const localCityCounts = new Map();
    for (const address of nearbyAddresses) {
      const city = String(address.city || '').trim();
      if (!city) continue;
      localCityCounts.set(city, (localCityCounts.get(city) || 0) + 1);
    }
    return [...localCityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  })();

  const normalizedRows = orderRows
    .map((row) => {
      const placedAt = new Date(row.placed_at);
      if (Number.isNaN(placedAt.getTime())) return null;

      const distanceKm = hasStoreCoordinates
        ? haversineKm(retailerContext.lat, retailerContext.lng, row.lat, row.lng)
        : null;
      const isRetailerOrder = row.retailer_id === retailerId;
      const isHyperlocal = Number.isFinite(distanceKm) && distanceKm <= radiusKm;
      const isLocal = hasStoreCoordinates ? (isHyperlocal || isRetailerOrder) : isRetailerOrder;

      return {
        ...row,
        placedAt,
        quantity: safeNumber(row.quantity),
        total_price: safeNumber(row.total_price),
        distanceKm,
        isLocal,
        isRetailerOrder,
      };
    })
    .filter(Boolean);

  const localRows = normalizedRows.filter((row) => row.isLocal);
  const retailerRows = normalizedRows.filter((row) => row.isRetailerOrder);

  if (!hasStoreCoordinates) {
    warnings.push('Store coordinates are missing, so the forecast is using retailer sales and platform demand instead of a full hyperlocal radius.');
  }
  if (localRows.length < 20) {
    warnings.push('Local signal is still sparse, so the model is blending platform-wide demand to improve coverage for low-history medicines.');
  }
  if (!weatherSignal) {
    warnings.push('Live weather context is temporarily unavailable, so only historical and platform demand signals are being used.');
  }

  const totalPlatform30Orders = new Set();
  const totalLocal30Orders = new Set();
  const totalRetailer30Orders = new Set();

  const local30ByMedicine = new Map();
  const local90ByMedicine = new Map();
  const prev30ByMedicine = new Map();
  const global30ByMedicine = new Map();

  const local30ByCategory = new Map();
  const local90ByCategory = new Map();
  const prev30ByCategory = new Map();
  const retailer30ByCategory = new Map();
  const global30ByCategory = new Map();

  const localRevenue30ByMedicine = new Map();

  for (const row of normalizedRows) {
    const medicineId = row.medicine_id;
    const categoryId = row.category_id || 'uncategorized';
    const quantity = safeNumber(row.quantity);

    if (row.placedAt >= threshold30) {
      totalPlatform30Orders.add(row.order_id);
      global30ByMedicine.set(medicineId, (global30ByMedicine.get(medicineId) || 0) + quantity);
      global30ByCategory.set(categoryId, (global30ByCategory.get(categoryId) || 0) + quantity);
      if (row.isLocal) {
        totalLocal30Orders.add(row.order_id);
        local30ByMedicine.set(medicineId, (local30ByMedicine.get(medicineId) || 0) + quantity);
        local30ByCategory.set(categoryId, (local30ByCategory.get(categoryId) || 0) + quantity);
        localRevenue30ByMedicine.set(medicineId, (localRevenue30ByMedicine.get(medicineId) || 0) + safeNumber(row.total_price));
      }
      if (row.isRetailerOrder) {
        totalRetailer30Orders.add(row.order_id);
        retailer30ByCategory.set(categoryId, (retailer30ByCategory.get(categoryId) || 0) + quantity);
      }
    } else if (row.placedAt >= threshold60 && row.isLocal) {
      prev30ByMedicine.set(medicineId, (prev30ByMedicine.get(medicineId) || 0) + quantity);
      prev30ByCategory.set(categoryId, (prev30ByCategory.get(categoryId) || 0) + quantity);
    }

    if (row.placedAt >= threshold90 && row.isLocal) {
      local90ByMedicine.set(medicineId, (local90ByMedicine.get(medicineId) || 0) + quantity);
      local90ByCategory.set(categoryId, (local90ByCategory.get(categoryId) || 0) + quantity);
    }

    if (row.isLocal && row.placedAt >= firstActualStart) {
      const weekIndex = Math.floor((row.placedAt.getTime() - firstActualStart.getTime()) / (7 * DAY_MS));
      if (weekIndex >= 0 && weekIndex < actual.length) {
        actual[weekIndex].actualDemand += quantity;
      }
    }
  }

  const platformTotal30Qty = [...global30ByMedicine.values()].reduce((sum, value) => sum + value, 0);
  const localTotal30Qty = [...local30ByMedicine.values()].reduce((sum, value) => sum + value, 0);
  const retailerTotal30Qty = retailerRows
    .filter((row) => row.placedAt >= threshold30)
    .reduce((sum, row) => sum + safeNumber(row.quantity), 0);
  const addressMarketShare = addressRows.length ? nearbyHouseholds / addressRows.length : 0;

  const localMarketShare = (() => {
    if (platformTotal30Qty > 0 && localTotal30Qty > 0) {
      return clamp(localTotal30Qty / platformTotal30Qty, 0.005, 0.2);
    }
    if (platformTotal30Qty > 0 && retailerTotal30Qty > 0) {
      return clamp(retailerTotal30Qty / platformTotal30Qty, 0.005, 0.12);
    }
    if (addressMarketShare > 0) {
      return clamp(addressMarketShare * 1.25, 0.005, 0.08);
    }
    return DEFAULT_LOCAL_MARKET_SHARE;
  })();

  const medicineForecasts = medicines.map((medicine) => {
    const medicineId = medicine.id;
    const categoryId = medicine.category_id || 'uncategorized';
    const local30 = local30ByMedicine.get(medicineId) || 0;
    const local90Monthly = (local90ByMedicine.get(medicineId) || 0) / 3;
    const previous30 = prev30ByMedicine.get(medicineId) || 0;
    const global30 = global30ByMedicine.get(medicineId) || 0;
    const localCategory30 = local30ByCategory.get(categoryId) || 0;
    const globalCategory30 = global30ByCategory.get(categoryId) || 0;
    const localShare = localCategory30 > 0 ? local30 / localCategory30 : 0;
    const globalShare = globalCategory30 > 0 ? global30 / globalCategory30 : 0;
    const blendedShare = localShare > 0 && globalShare > 0
      ? (localShare * 0.65) + (globalShare * 0.35)
      : (localShare || globalShare || 0);
    const categoryFallback = localCategory30 > 0 ? localCategory30 * blendedShare : 0;
    const coldStartBase = global30 > 0 ? global30 * localMarketShare : 0;

    let baseForecast = (local30 * 0.55) + (local90Monthly * 0.25) + (categoryFallback * 0.15) + (coldStartBase * 0.05);
    if (local30 === 0 && categoryFallback === 0) baseForecast = coldStartBase;
    if (local30 > 0) {
      baseForecast = Math.max(baseForecast, local30 * 0.85, local90Monthly * 0.9);
    }

    const trendMultiplier = previous30 > 0 && local30 > 0
      ? clamp(1 + (((local30 - previous30) / previous30) * 0.35), 0.8, 1.35)
      : (local30 > 0 ? 1.05 : 1);
    const weatherEffect = getWeatherMultiplier(medicine, weatherSignal);
    const projected30Days = Math.max(0, Math.round(baseForecast * trendMultiplier * weatherEffect.multiplier));
    const availableStock = Math.max(0, safeNumber(medicine.stock_quantity) - safeNumber(medicine.reserved_quantity));
    const coverageDays = projected30Days > 0 ? roundTo(availableStock / (projected30Days / 30), 1) : null;
    const inInventory = Boolean(medicine.inventory_id);
    const priority = getPriorityBucket({
      projected30Days,
      inInventory,
      coverageDays,
      availableStock,
      reorderLevel: safeNumber(medicine.reorder_level, 10),
    });
    const trendPct = previous30 > 0
      ? roundTo(((projected30Days - previous30) / previous30) * 100, 1)
      : (projected30Days > 0 ? 100 : 0);
    const projectedRevenue = roundTo(projected30Days * safeNumber(medicine.selling_price || medicine.mrp));
    const confidence = clamp(
      0.3 +
        Math.min((local90ByMedicine.get(medicineId) || 0) / 40, 0.3) +
        Math.min(global30 / 60, 0.2) +
        (hasStoreCoordinates ? 0.1 : 0) +
        (weatherSignal ? 0.05 : 0),
      0.25,
      0.95
    );

    return {
      id: medicine.id,
      name: medicine.name,
      saltName: medicine.salt_name,
      manufacturer: medicine.manufacturer,
      categoryId,
      categoryName: medicine.category_name,
      type: medicine.type,
      section: medicine.section,
      requiresRx: Boolean(medicine.requires_rx),
      mrp: roundTo(safeNumber(medicine.mrp), 2),
      sellingPrice: roundTo(safeNumber(medicine.selling_price || medicine.mrp), 2),
      inInventory,
      inventoryId: medicine.inventory_id,
      stockQuantity: safeNumber(medicine.stock_quantity),
      reservedQuantity: safeNumber(medicine.reserved_quantity),
      availableStock,
      reorderLevel: safeNumber(medicine.reorder_level, 10),
      local30Days: local30,
      local90DayAvg: roundTo(local90Monthly, 1),
      platform30Days: global30,
      localRevenue30Days: roundTo(localRevenue30ByMedicine.get(medicineId) || 0, 2),
      projected30Days,
      projectedRevenue,
      coverageDays,
      trendPct,
      confidence: roundTo(confidence * 100, 0),
      weatherReasons: weatherEffect.reasons,
      priority,
    };
  });

  const maxProjectedDemand = Math.max(...medicineForecasts.map((item) => item.projected30Days), 1);
  for (const forecast of medicineForecasts) {
    forecast.marketDemandIndex = Math.round((forecast.projected30Days / maxProjectedDemand) * 100);
  }

  medicineForecasts.sort((a, b) => {
    const priorityRank = { Launch: 0, Restock: 1, Monitor: 2, Reduce: 3, Low: 4 };
    if (priorityRank[a.priority] !== priorityRank[b.priority]) {
      return priorityRank[a.priority] - priorityRank[b.priority];
    }
    if (b.projected30Days !== a.projected30Days) return b.projected30Days - a.projected30Days;
    return b.projectedRevenue - a.projectedRevenue;
  });

  const totalProjectedDemand30d = medicineForecasts.reduce((sum, item) => sum + item.projected30Days, 0);
  const totalProjectedRevenue30d = roundTo(medicineForecasts.reduce((sum, item) => sum + item.projectedRevenue, 0), 2);
  const stockedProjectedDemand30d = medicineForecasts
    .filter((item) => item.inInventory)
    .reduce((sum, item) => sum + item.projected30Days, 0);
  const marketCoveragePct = totalProjectedDemand30d > 0
    ? roundTo((stockedProjectedDemand30d / totalProjectedDemand30d) * 100, 1)
    : 0;
  const unstockedOpportunityCount = medicineForecasts.filter((item) => item.priority === 'Launch').length;
  const restockRiskCount = medicineForecasts.filter((item) => item.priority === 'Restock').length;
  const slowMoverCount = medicineForecasts.filter((item) => item.priority === 'Reduce').length;

  const categoryMap = new Map();
  for (const item of medicineForecasts) {
    const categoryKey = item.categoryId || 'uncategorized';
    const current = categoryMap.get(categoryKey) || {
      categoryId: categoryKey,
      categoryName: item.categoryName,
      last30Days: 0,
      projected30Days: 0,
      projectedRevenue: 0,
      stockedSkus: 0,
      opportunitySkus: 0,
      retailerShareQty30: retailer30ByCategory.get(categoryKey) || 0,
    };
    current.last30Days += item.local30Days;
    current.projected30Days += item.projected30Days;
    current.projectedRevenue += item.projectedRevenue;
    if (item.inInventory) current.stockedSkus += 1;
    if (item.priority === 'Launch') current.opportunitySkus += 1;
    categoryMap.set(categoryKey, current);
  }

  const categoryForecasts = [...categoryMap.values()]
    .map((category) => ({
      ...category,
      projectedRevenue: roundTo(category.projectedRevenue, 2),
      trendPct: category.last30Days > 0
        ? roundTo(((category.projected30Days - category.last30Days) / category.last30Days) * 100, 1)
        : (category.projected30Days > 0 ? 100 : 0),
      sharePct: totalProjectedDemand30d > 0 ? roundTo((category.projected30Days / totalProjectedDemand30d) * 100, 1) : 0,
      retailerSharePct: local30ByCategory.get(category.categoryId)
        ? roundTo(((category.retailerShareQty30 || 0) / local30ByCategory.get(category.categoryId)) * 100, 1)
        : 0,
    }))
    .sort((a, b) => b.projected30Days - a.projected30Days);

  const lastFourWeekActual = actual.slice(-4).reduce((sum, item) => sum + safeNumber(item.actualDemand), 0);
  const overallTrendPct = lastFourWeekActual > 0
    ? roundTo(((totalProjectedDemand30d - lastFourWeekActual) / lastFourWeekActual) * 100, 1)
    : 0;
  const projectionWeights = overallTrendPct > 10
    ? [0.22, 0.24, 0.26, 0.28]
    : overallTrendPct < -5
      ? [0.28, 0.26, 0.24, 0.22]
      : [0.25, 0.25, 0.25, 0.25];

  future.forEach((bucket, index) => {
    bucket.projectedDemand = Math.round(totalProjectedDemand30d * projectionWeights[index]);
  });

  const weeklyDemand = [
    ...actual.map((bucket) => ({
      label: bucket.label,
      actualDemand: bucket.actualDemand,
      projectedDemand: null,
      period: 'actual',
    })),
    ...future.map((bucket) => ({
      label: bucket.label,
      actualDemand: null,
      projectedDemand: bucket.projectedDemand,
      period: 'projected',
    })),
  ];

  const recommendationMix = ['Launch', 'Restock', 'Monitor', 'Reduce', 'Low'].map((name) => ({
    name,
    count: medicineForecasts.filter((item) => item.priority === name).length,
  }));

  const topOpportunities = medicineForecasts
    .filter((item) => item.priority === 'Launch' || item.priority === 'Restock')
    .slice(0, 8)
    .map((item) => ({
      name: item.name,
      priority: item.priority,
      projected30Days: item.projected30Days,
      projectedRevenue: item.projectedRevenue,
      categoryName: item.categoryName,
    }));

  const marketSignals = [
    {
      icon: hasStoreCoordinates ? 'radar' : 'location_off',
      label: 'Demand model',
      value: hasStoreCoordinates ? 'Hyperlocal radius' : 'Retailer fallback',
    },
    {
      icon: 'route',
      label: 'Catchment radius',
      value: `${roundTo(radiusKm, 1)} km`,
    },
    {
      icon: 'groups',
      label: 'Nearby households',
      value: nearbyHouseholds > 0 ? String(nearbyHouseholds) : 'Sparse',
    },
    {
      icon: 'partly_cloudy_day',
      label: 'Weather outlook',
      value: weatherSignal ? `${weatherSignal.dominantCondition}, ${weatherSignal.maxTemperature}C` : 'Unavailable',
    },
  ];

  return {
    success: true,
    meta: {
      retailerId,
      shopName: retailerContext.shop_name || 'Retailer Store',
      address: retailerContext.address || '',
      radiusKm: roundTo(radiusKm, 1),
      localAreaName,
      usedLocationModel: hasStoreCoordinates,
      generatedAt: new Date().toISOString(),
      localSignalOrders30d: totalLocal30Orders.size,
      retailerOrders30d: totalRetailer30Orders.size,
      platformOrders30d: totalPlatform30Orders.size,
      nearbyHouseholds,
    },
    kpis: {
      totalProjectedDemand30d,
      totalProjectedRevenue30d,
      marketCoveragePct,
      unstockedOpportunityCount,
      restockRiskCount,
      slowMoverCount,
      localMarketSharePct: roundTo(localMarketShare * 100, 2),
    },
    weather: weatherSignal,
    marketSignals,
    weeklyDemand,
    categoryForecasts,
    medicineForecasts,
    recommendationMix,
    topOpportunities,
    warnings,
    insights: buildInsights({
      medicineForecasts,
      categoryForecasts,
      weatherSignal,
      nearbyHouseholds,
      retailerContext,
      warnings,
    }),
  };
}

module.exports = {
  buildRetailerDemandForecast,
};
