const { buildModelFeatureRow } = require('./modelFeatureBuilder');
const { predictDemandFromModel } = require('./modelInferenceClient');

const PRIORITY_RANK = {
  Launch: 0,
  Restock: 1,
  Monitor: 2,
  Reduce: 3,
  Low: 4,
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

const getPriorityBucket = ({ projected30Days, inInventory, coverageDays, availableStock, reorderLevel }) => {
  if (!inInventory && projected30Days >= 6) return 'Launch';
  if (inInventory && projected30Days >= 6 && Number.isFinite(coverageDays) && coverageDays < 14) return 'Restock';
  if (inInventory && availableStock > Math.max(reorderLevel * 2, 20) && projected30Days <= 2) return 'Reduce';
  if (projected30Days >= 3) return 'Monitor';
  return 'Low';
};

const refreshWeeklyDemand = (weeklyDemand = [], totalProjectedDemand30d = 0) => {
  if (!Array.isArray(weeklyDemand) || !weeklyDemand.length) return weeklyDemand;

  const actualRows = weeklyDemand.filter((item) => item.period === 'actual' || item.actualDemand !== null);
  const projectedRows = weeklyDemand.filter((item) => item.period === 'projected' || item.projectedDemand !== null);

  if (!projectedRows.length) return weeklyDemand;

  const lastFourActual = actualRows.slice(-4).reduce((sum, item) => sum + safeNumber(item.actualDemand), 0);
  const overallTrendPct = lastFourActual > 0
    ? roundTo(((totalProjectedDemand30d - lastFourActual) / lastFourActual) * 100, 1)
    : 0;

  const getWeights = (count, trend) => {
    if (count === 4) {
      if (trend > 10) return [0.22, 0.24, 0.26, 0.28];
      if (trend < -5) return [0.28, 0.26, 0.24, 0.22];
      return [0.25, 0.25, 0.25, 0.25];
    }

    if (count <= 0) return [];
    return Array.from({ length: count }, () => 1 / count);
  };

  const weights = getWeights(projectedRows.length, overallTrendPct);
  const updatedProjected = projectedRows.map((item, index) => ({
    ...item,
    actualDemand: null,
    projectedDemand: Math.round(totalProjectedDemand30d * (weights[index] || 0)),
    period: 'projected',
  }));

  const normalizedActual = actualRows.map((item) => ({
    ...item,
    projectedDemand: null,
    period: 'actual',
  }));

  return [...normalizedActual, ...updatedProjected];
};

const rebuildCategoryForecasts = (medicineForecasts, previousCategoryForecasts = []) => {
  const previousMap = new Map(
    (previousCategoryForecasts || []).map((category) => [
      String(category.categoryId || category.categoryName || ''),
      category,
    ])
  );

  const categoryMap = new Map();
  for (const item of medicineForecasts) {
    const categoryId = String(item.categoryId || item.categoryName || 'uncategorized');
    const previous = previousMap.get(categoryId) || {};

    const existing = categoryMap.get(categoryId) || {
      categoryId,
      categoryName: item.categoryName || 'General',
      last30Days: 0,
      projected30Days: 0,
      projectedRevenue: 0,
      stockedSkus: 0,
      opportunitySkus: 0,
      retailerShareQty30: safeNumber(previous.retailerShareQty30),
      retailerSharePct: safeNumber(previous.retailerSharePct),
    };

    existing.last30Days += safeNumber(item.local30Days);
    existing.projected30Days += safeNumber(item.projected30Days);
    existing.projectedRevenue += safeNumber(item.projectedRevenue);
    if (item.inInventory) existing.stockedSkus += 1;
    if (item.priority === 'Launch') existing.opportunitySkus += 1;

    categoryMap.set(categoryId, existing);
  }

  const totalProjected = medicineForecasts.reduce((sum, item) => sum + safeNumber(item.projected30Days), 0);

  return [...categoryMap.values()]
    .map((category) => ({
      ...category,
      projectedRevenue: roundTo(category.projectedRevenue, 2),
      trendPct: category.last30Days > 0
        ? roundTo(((category.projected30Days - category.last30Days) / category.last30Days) * 100, 1)
        : (category.projected30Days > 0 ? 100 : 0),
      sharePct: totalProjected > 0 ? roundTo((category.projected30Days / totalProjected) * 100, 1) : 0,
      retailerSharePct: roundTo(safeNumber(category.retailerSharePct), 1),
    }))
    .sort((a, b) => b.projected30Days - a.projected30Days);
};

const rebuildRecommendationMix = (medicineForecasts) => ['Launch', 'Restock', 'Monitor', 'Reduce', 'Low']
  .map((name) => ({
    name,
    count: medicineForecasts.filter((item) => item.priority === name).length,
  }));

const rebuildTopOpportunities = (medicineForecasts) => medicineForecasts
  .filter((item) => item.priority === 'Launch' || item.priority === 'Restock')
  .slice(0, 8)
  .map((item) => ({
    name: item.name,
    priority: item.priority,
    projected30Days: item.projected30Days,
    projectedRevenue: item.projectedRevenue,
    categoryName: item.categoryName,
  }));

const refreshMarketSignals = (marketSignals = [], source = 'model') => {
  if (!Array.isArray(marketSignals)) return marketSignals;

  let replaced = false;
  const nextSignals = marketSignals.map((signal) => {
    if (signal.label !== 'Demand model') return signal;
    replaced = true;
    return {
      ...signal,
      value: `ML artifacts (${source})`,
      icon: 'precision_manufacturing',
    };
  });

  if (!replaced) {
    nextSignals.unshift({
      icon: 'precision_manufacturing',
      label: 'Demand model',
      value: `ML artifacts (${source})`,
    });
  }

  return nextSignals;
};

const rebuildKpis = (medicineForecasts, previousKpis = {}) => {
  const totalProjectedDemand30d = medicineForecasts.reduce((sum, item) => sum + safeNumber(item.projected30Days), 0);
  const totalProjectedRevenue30d = roundTo(
    medicineForecasts.reduce((sum, item) => sum + safeNumber(item.projectedRevenue), 0),
    2
  );

  const stockedProjectedDemand = medicineForecasts
    .filter((item) => item.inInventory)
    .reduce((sum, item) => sum + safeNumber(item.projected30Days), 0);

  const marketCoveragePct = totalProjectedDemand30d > 0
    ? roundTo((stockedProjectedDemand / totalProjectedDemand30d) * 100, 1)
    : 0;

  return {
    ...previousKpis,
    totalProjectedDemand30d,
    totalProjectedRevenue30d,
    marketCoveragePct,
    unstockedOpportunityCount: medicineForecasts.filter((item) => item.priority === 'Launch').length,
    restockRiskCount: medicineForecasts.filter((item) => item.priority === 'Restock').length,
    slowMoverCount: medicineForecasts.filter((item) => item.priority === 'Reduce').length,
  };
};

async function enhanceDemandForecastWithModel(forecast) {
  if (!forecast || !Array.isArray(forecast.medicineForecasts) || !forecast.medicineForecasts.length) {
    return { applied: false, forecast, reason: 'No medicine forecasts available' };
  }

  const context = {
    localAreaName: forecast?.meta?.localAreaName,
    address: forecast?.meta?.address,
    retailerSizeSignal: forecast?.kpis?.totalProjectedDemand30d,
  };

  const weather = {
    condition: forecast?.weather?.dominantCondition,
    temperature: forecast?.weather?.maxTemperature,
    humidity: forecast?.weather?.humidity,
  };

  const rows = forecast.medicineForecasts.map((item) => buildModelFeatureRow({
    item,
    weather,
    context,
    now: new Date(),
  }));

  const inference = await predictDemandFromModel({ rows, target: 'units_sold_today' });
  if (!inference.ok || !Array.isArray(inference.predictions) || inference.predictions.length !== rows.length) {
    return {
      applied: false,
      forecast,
      reason: inference.error || 'Model prediction failed',
    };
  }

  const updatedForecasts = forecast.medicineForecasts.map((item, index) => {
    const predictedDailyDemand = Math.max(0, safeNumber(inference.predictions[index], 0));
    const projected30Days = Math.max(0, Math.round(predictedDailyDemand * 30));
    const availableStock = safeNumber(item.availableStock);
    const local30Days = safeNumber(item.local30Days);
    const reorderLevel = safeNumber(item.reorderLevel, 10);

    const coverageDays = projected30Days > 0
      ? roundTo(availableStock / (projected30Days / 30), 1)
      : null;

    const trendPct = local30Days > 0
      ? roundTo(((projected30Days - local30Days) / local30Days) * 100, 1)
      : (projected30Days > 0 ? 100 : 0);

    const projectedRevenue = roundTo(projected30Days * safeNumber(item.sellingPrice || item.mrp), 2);
    const priority = getPriorityBucket({
      projected30Days,
      inInventory: Boolean(item.inInventory),
      coverageDays,
      availableStock,
      reorderLevel,
    });

    const confidence = Math.round(clamp(safeNumber(item.confidence, 60) + 5, 25, 99));

    return {
      ...item,
      projected30Days,
      projectedRevenue,
      coverageDays,
      trendPct,
      priority,
      confidence,
      predictedDailyDemand: roundTo(predictedDailyDemand, 3),
      demandModelSource: inference.source,
    };
  });

  const maxProjectedDemand = Math.max(...updatedForecasts.map((item) => item.projected30Days), 1);
  updatedForecasts.forEach((item) => {
    item.marketDemandIndex = Math.round((safeNumber(item.projected30Days) / maxProjectedDemand) * 100);
  });

  updatedForecasts.sort((a, b) => {
    const aRank = PRIORITY_RANK[a.priority] ?? 99;
    const bRank = PRIORITY_RANK[b.priority] ?? 99;

    if (aRank !== bRank) return aRank - bRank;
    if (safeNumber(b.projected30Days) !== safeNumber(a.projected30Days)) {
      return safeNumber(b.projected30Days) - safeNumber(a.projected30Days);
    }

    return safeNumber(b.projectedRevenue) - safeNumber(a.projectedRevenue);
  });

  const kpis = rebuildKpis(updatedForecasts, forecast.kpis);
  const categoryForecasts = rebuildCategoryForecasts(updatedForecasts, forecast.categoryForecasts);

  const warnings = Array.isArray(forecast.warnings)
    ? [...forecast.warnings]
    : [];

  warnings.push(`Demand forecast upgraded with trained ML artifacts (${inference.source}).`);

  const enhancedForecast = {
    ...forecast,
    meta: {
      ...forecast.meta,
      modelInference: {
        enabled: true,
        source: inference.source,
        strategy: inference.selection || null,
        generatedAt: new Date().toISOString(),
      },
    },
    kpis,
    medicineForecasts: updatedForecasts,
    categoryForecasts,
    weeklyDemand: refreshWeeklyDemand(forecast.weeklyDemand, kpis.totalProjectedDemand30d),
    recommendationMix: rebuildRecommendationMix(updatedForecasts),
    topOpportunities: rebuildTopOpportunities(updatedForecasts),
    marketSignals: refreshMarketSignals(forecast.marketSignals, inference.source),
    warnings,
  };

  return {
    applied: true,
    forecast: enhancedForecast,
    source: inference.source,
  };
}

module.exports = {
  enhanceDemandForecastWithModel,
};
