const axios = require('axios');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db');
const MediBotMessage = require('../models/MediBotMessage');
const MedicationReminder = require('../models/MedicationReminder');
const { sendNotification } = require('../utils/notifs');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const KOLKATA_OFFSET = '+05:30';
const KOLKATA_TIME_ZONE = 'Asia/Kolkata';
const KOLKATA_OFFSET_MINUTES = 5 * 60 + 30;

const SUPPORTED_LANGUAGES = {
  en: { label: 'English', locale: 'en-IN' },
  hi: { label: 'Hindi', locale: 'hi-IN' },
  mr: { label: 'Marathi', locale: 'mr-IN' },
  ta: { label: 'Tamil', locale: 'ta-IN' },
};

const DEFAULT_QUICK_REPLIES = [
  'What is in my cart?',
  'Suggest OTC products for cold and cough',
  'Explain side effects of my medicines',
  'Set a medicine reminder for tonight',
];

function getGroqKey() {
  return process.env.GROQ_API_KEY || '';
}

function getTextModel() {
  return (
    process.env.GROQ_MEDIBOT_MODEL ||
    process.env.GROQ_TEXT_MODEL ||
    'meta-llama/llama-4-scout-17b-16e-instruct'
  );
}

async function callGroq(messages, { temperature = 0.25, maxTokens = 1600 } = {}) {
  const apiKey = getGroqKey();
  if (!apiKey) throw Object.assign(new Error('GROQ_API_KEY not configured'), { statusCode: 503 });

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: getTextModel(),
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 25000,
    }
  );

  const raw = response?.data?.choices?.[0]?.message?.content || '';
  try {
    return JSON.parse(String(raw).replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
  } catch {
    return null;
  }
}

function normalizeLanguage(language) {
  const code = String(language || '').trim().toLowerCase();
  return SUPPORTED_LANGUAGES[code] ? code : 'en';
}

function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function arrayOfStrings(value, limit = 4) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, limit);
}

function clampQuantity(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.max(1, Math.min(Math.round(parsed), 10));
}

function formatReminderTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: KOLKATA_TIME_ZONE,
  });
}

function getKolkataNow() {
  return new Date();
}

function parseReminderDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const withOffset = /([zZ]|[+-]\d{2}:\d{2})$/.test(raw) ? raw : `${raw}${KOLKATA_OFFSET}`;
  const parsed = new Date(withOffset);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatTimeForStorage(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('en-GB', {
    hour12: false,
    timeZone: KOLKATA_TIME_ZONE,
  });
}

function getKolkataDateParts(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: KOLKATA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hours: Number(parts.hour),
    minutes: Number(parts.minute),
    seconds: Number(parts.second),
  };
}

function createKolkataDate(year, month, day, hours = 0, minutes = 0, seconds = 0) {
  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds) - KOLKATA_OFFSET_MINUTES * 60 * 1000
  );
}

function parseKolkataDateOnly(value) {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return createKolkataDate(Number(year), Number(month), Number(day));
}

function getTimeParts(timeValue) {
  const raw = String(timeValue || '').trim();
  if (!raw) return null;
  const parts = raw.split(':').map((part) => Number(part));
  const [hours = 0, minutes = 0, seconds = 0] = parts;
  if (![hours, minutes, seconds].every((part) => Number.isFinite(part))) return null;
  return { hours, minutes, seconds };
}

function withKolkataTime(baseDate, timeValue) {
  const timeParts = getTimeParts(timeValue);
  const dateParts = getKolkataDateParts(baseDate);
  if (!timeParts || !dateParts) return null;
  return createKolkataDate(
    dateParts.year,
    dateParts.month,
    dateParts.day,
    timeParts.hours,
    timeParts.minutes,
    timeParts.seconds || 0
  );
}

function parseReminderFrequency(frequencyValue) {
  const frequency = String(frequencyValue || 'daily').trim().toLowerCase();
  if (frequency.startsWith('interval:')) {
    const hours = Number(frequency.split(':')[1] || 0);
    return {
      kind: 'interval',
      intervalHours: Number.isFinite(hours) && hours > 0 ? hours : 24,
      label: `Every ${Number.isFinite(hours) && hours > 0 ? hours : 24} hours`,
    };
  }
  if (frequency.startsWith('once:')) {
    return {
      kind: 'once',
      date: frequency.split(':')[1] || null,
      label: 'One time',
    };
  }
  return {
    kind: 'daily',
    intervalHours: 24,
    label: frequency === 'daily' ? 'Every day' : frequency,
  };
}

function sameKolkataDay(left, right) {
  const a = getKolkataDateParts(left);
  const b = getKolkataDateParts(right);
  if (!a || !b) return false;
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function addKolkataDays(baseDate, days) {
  const base = withKolkataTime(baseDate, '00:00:00');
  if (!base) return null;
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + Number(days || 0));
  return next;
}

function buildReminderTitle(reminder) {
  if (!reminder?.medicationName) return 'Medication reminder';
  if (reminder.dosage) return `Take ${reminder.medicationName} (${reminder.dosage})`;
  return `Take ${reminder.medicationName}`;
}

function getNextReminderAt(reminder, now = getKolkataNow()) {
  if (!reminder?.isActive) return null;

  const currentTime = new Date(now);
  if (Number.isNaN(currentTime.getTime())) return null;

  const scheduledToday = withKolkataTime(currentTime, reminder.reminderTime);
  if (!scheduledToday) return null;

  const lastRemindedAt = reminder.lastRemindedAt ? new Date(reminder.lastRemindedAt) : null;
  const parsedFrequency = parseReminderFrequency(reminder.frequency);

  if (parsedFrequency.kind === 'interval') {
    if (!lastRemindedAt || Number.isNaN(lastRemindedAt.getTime())) {
      return scheduledToday;
    }
    return new Date(lastRemindedAt.getTime() + parsedFrequency.intervalHours * 60 * 60 * 1000);
  }

  if (parsedFrequency.kind === 'once') {
    const targetDate = parsedFrequency.date ? parseKolkataDateOnly(parsedFrequency.date) : currentTime;
    const targetDateTime = withKolkataTime(targetDate, reminder.reminderTime);
    if (!targetDateTime) return null;
    if (lastRemindedAt && !Number.isNaN(lastRemindedAt.getTime())) return null;
    return targetDateTime;
  }

  if (lastRemindedAt && sameKolkataDay(lastRemindedAt, currentTime)) {
    const tomorrow = addKolkataDays(currentTime, 1);
    return withKolkataTime(tomorrow, reminder.reminderTime);
  }

  return scheduledToday;
}

function isReminderDue(reminder, now = getKolkataNow()) {
  const nextReminderAt = getNextReminderAt(reminder, now);
  if (!nextReminderAt) return false;
  return nextReminderAt.getTime() <= now.getTime();
}

function buildStoredReminderFrequency(rawAction, parsedDate) {
  const intervalHours = Number(rawAction?.intervalHours || 0);
  if (Number.isFinite(intervalHours) && intervalHours > 0) {
    return `interval:${Math.round(intervalHours)}`;
  }

  const recurrenceLabel = String(rawAction?.recurrenceLabel || '').trim().toLowerCase();
  if (recurrenceLabel.includes('daily') || recurrenceLabel.includes('every day')) {
    return 'daily';
  }

  const datePart = parsedDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return `once:${datePart}`;
}

function buildReminderNotes(rawAction) {
  return [rawAction?.instructions, rawAction?.recurrenceLabel]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' | ') || null;
}

function serializeProduct(product) {
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    brand: product.brand || '',
    description: product.description || '',
    category: product.category || '',
    price: Number(product.price || 0),
    mrp: Number(product.mrp || 0),
    stock: Number(product.stock || 0),
    requiresPrescription: Boolean(product.requiresPrescription),
    isEcom: Boolean(product.isEcom),
    saltName: product.saltName || '',
    image: product.image || '',
  };
}

function serializeReminder(reminder) {
  if (!reminder) return null;
  const nextReminderAt = getNextReminderAt(reminder);
  const parsedFrequency = parseReminderFrequency(reminder.frequency);
  return {
    id: reminder.id,
    title: buildReminderTitle(reminder),
    medicationName: reminder.medicationName || '',
    instructions: reminder.notes || '',
    remindAt: nextReminderAt,
    recurrenceLabel: parsedFrequency.label,
    intervalHours: parsedFrequency.kind === 'interval' ? parsedFrequency.intervalHours : null,
    isActive: Boolean(reminder.isActive),
    language: 'en',
    meta: {},
    createdAt: reminder.createdAt,
    dosage: reminder.dosage || '',
  };
}

function serializeMessage(message) {
  const meta = message?.meta || {};
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    language: message.language || 'en',
    intent: meta.intent || 'general',
    quickReplies: arrayOfStrings(meta.quickReplies),
    suggestedProducts: Array.isArray(meta.suggestedProducts) ? meta.suggestedProducts : [],
    executedActions: Array.isArray(meta.executedActions) ? meta.executedActions : [],
    reminders: Array.isArray(meta.reminders) ? meta.reminders : [],
    safety: meta.safety || { level: 'low', warnings: [] },
    followUpQuestion: meta.followUpQuestion || null,
    cartSnapshot: meta.cartSnapshot || null,
    createdAt: message.createdAt,
  };
}

function extractSearchTerms(message) {
  const original = String(message || '').trim();
  const lower = original.toLowerCase();
  if (!lower) return [];

  const stopWords = new Set([
    'what', 'whats', 'what\'s', 'show', 'tell', 'with', 'from', 'this', 'that', 'into',
    'cart', 'need', 'want', 'give', 'have', 'please', 'medicine', 'medicines', 'product',
    'products', 'assistant', 'medibot', 'order', 'orders', 'suggest', 'recommend', 'help',
    'side', 'effects', 'effect', 'contraindications', 'dosage', 'reminder', 'remind',
    'mera', 'meri', 'mujhe', 'mere', 'hai', 'ke', 'ki', 'aur', 'oru', 'enna',
  ]);

  const tokens = lower
    .replace(/[^\p{L}\p{N}\s.+-]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !stopWords.has(token));

  const unique = [];
  for (const token of tokens) {
    if (!unique.includes(token)) unique.push(token);
  }

  if (original.length <= 80) unique.unshift(original);
  return unique.slice(0, 6);
}

async function getActiveCartId(userId, createIfMissing = false, transaction) {
  const rows = await sequelize.query(
    `
    SELECT id
    FROM carts
    WHERE user_id = :userId
      AND is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1
    `,
    { type: QueryTypes.SELECT, replacements: { userId }, transaction }
  );

  if (rows[0]?.id) return rows[0].id;
  if (!createIfMissing) return null;

  const inserted = await sequelize.query(
    `
    INSERT INTO carts (user_id, is_active, created_at, updated_at)
    VALUES (:userId, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
    `,
    { type: QueryTypes.SELECT, replacements: { userId }, transaction }
  );

  return inserted[0]?.id || null;
}

async function getMedicineStock(productId, transaction, isEcom = false) {
  const column = isEcom ? 'ecommerce_product_id' : 'medicine_id';
  const rows = await sequelize.query(
    `
    SELECT COALESCE(SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)), 0)::int AS stock
    FROM inventory
    WHERE ${column} = :productId
    `,
    { type: QueryTypes.SELECT, replacements: { productId }, transaction }
  );
  return Number(rows[0]?.stock || 0);
}

async function resolveUserLocation(userId, transaction) {
  const addressRows = await sequelize.query(
    `
    SELECT lat, lng
    FROM user_addresses
    WHERE user_id = :userId
      AND lat IS NOT NULL
      AND lng IS NOT NULL
    ORDER BY is_default DESC, updated_at DESC
    LIMIT 1
    `,
    { type: QueryTypes.SELECT, replacements: { userId }, transaction }
  );

  const lat = Number(addressRows[0]?.lat);
  const lng = Number(addressRows[0]?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  const orderRows = await sequelize.query(
    `
    SELECT
      CASE
        WHEN (delivery_address->>'lat') ~ '^[-+]?[0-9]*\\.?[0-9]+$'
          THEN (delivery_address->>'lat')::double precision
        ELSE NULL
      END AS lat,
      CASE
        WHEN (delivery_address->>'lng') ~ '^[-+]?[0-9]*\\.?[0-9]+$'
          THEN (delivery_address->>'lng')::double precision
        ELSE NULL
      END AS lng
    FROM orders
    WHERE user_id = :userId
      AND delivery_address IS NOT NULL
    ORDER BY placed_at DESC
    LIMIT 1
    `,
    { type: QueryTypes.SELECT, replacements: { userId }, transaction }
  );

  const orderLat = Number(orderRows[0]?.lat);
  const orderLng = Number(orderRows[0]?.lng);
  if (Number.isFinite(orderLat) && Number.isFinite(orderLng)) {
    return { lat: orderLat, lng: orderLng };
  }

  return null;
}

async function buildCartSnapshot(userId, transaction) {
  const cartId = await getActiveCartId(userId, false, transaction);
  if (!cartId) {
    return { id: null, itemCount: 0, items: [], subtotal: 0, taxes: 0, total: 0 };
  }

  const items = await sequelize.query(
    `
    SELECT
      ci.id,
      COALESCE(ci.medicine_id, ci.ecommerce_product_id) AS "productId",
      ci.quantity,
      COALESCE(ci.unit_price, COALESCE(m.selling_price, m.mrp, ep.selling_price, ep.mrp, 0))::float AS price,
      (COALESCE(ci.unit_price, COALESCE(m.selling_price, m.mrp, ep.selling_price, ep.mrp, 0)) * ci.quantity)::float AS "lineTotal",
      COALESCE(m.name, ep.name) AS name,
      COALESCE(m.manufacturer, ep.brand) AS brand,
      COALESCE(c.name, c2.name) AS category,
      COALESCE(m.requires_rx, FALSE) AS "requiresPrescription",
      NULLIF(array_to_string(COALESCE(m.images, ep.images), ','), '') AS image,
      COALESCE(inv.stock_quantity, 0)::int AS stock,
      (ci.ecommerce_product_id IS NOT NULL) AS "isEcom"
    FROM cart_items ci
    LEFT JOIN medicines m ON m.id = ci.medicine_id
    LEFT JOIN ecommerce_products ep ON ep.id = ci.ecommerce_product_id
    LEFT JOIN categories c ON c.id = m.category_id
    LEFT JOIN categories c2 ON c2.id = ep.category_id
    LEFT JOIN (
      SELECT
        medicine_id,
        ecommerce_product_id,
        SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
      FROM inventory
      GROUP BY medicine_id, ecommerce_product_id
    ) inv
      ON (inv.medicine_id = ci.medicine_id AND ci.medicine_id IS NOT NULL)
      OR (inv.ecommerce_product_id = ci.ecommerce_product_id AND ci.ecommerce_product_id IS NOT NULL)
    WHERE ci.cart_id = :cartId
    ORDER BY ci.created_at DESC
    `,
    { type: QueryTypes.SELECT, replacements: { cartId }, transaction }
  );

  const subtotal = Number(
    items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0).toFixed(2)
  );
  const taxes = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + taxes).toFixed(2));

  return {
    id: cartId,
    itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      brand: item.brand,
      category: item.category,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      lineTotal: Number(item.lineTotal || 0),
      requiresPrescription: Boolean(item.requiresPrescription),
      image: item.image || '',
      stock: Number(item.stock || 0),
      isEcom: Boolean(item.isEcom),
    })),
    subtotal,
    taxes,
    total,
  };
}

async function getRecentOrders(userId, transaction) {
  const orders = await sequelize.query(
    `
    SELECT
      o.id,
      o.order_number AS "orderId",
      o.status,
      o.total_amount::float AS total,
      o.placed_at AS "placedAt"
    FROM orders o
    WHERE o.user_id = :userId
    ORDER BY o.placed_at DESC
    LIMIT 4
    `,
    { type: QueryTypes.SELECT, replacements: { userId }, transaction }
  );

  const orderIds = orders.map((order) => order.id);
  if (!orderIds.length) return [];

  const itemRows = await sequelize.query(
    `
    SELECT
      oi.order_id,
      oi.quantity,
      COALESCE(m.name, ep.name) AS name
    FROM order_items oi
    LEFT JOIN medicines m ON m.id = oi.medicine_id
    LEFT JOIN ecommerce_products ep ON ep.id = oi.ecommerce_product_id
    WHERE oi.order_id IN (:orderIds)
    ORDER BY oi.id ASC
    `,
    { type: QueryTypes.SELECT, replacements: { orderIds }, transaction }
  );

  const itemsByOrder = {};
  for (const row of itemRows) {
    if (!itemsByOrder[row.order_id]) itemsByOrder[row.order_id] = [];
    itemsByOrder[row.order_id].push({
      name: row.name,
      quantity: Number(row.quantity || 0),
    });
  }

  return orders.map((order) => ({
    orderId: order.orderId,
    status: order.status,
    total: Number(order.total || 0),
    placedAt: order.placedAt,
    items: itemsByOrder[order.id] || [],
  }));
}

async function getActiveReminders(userId) {
  const reminders = await MedicationReminder.findAll({
    where: { userId, isActive: true },
    order: [['createdAt', 'DESC']],
    limit: 10,
  });
  return reminders
    .map(serializeReminder)
    .filter(Boolean)
    .sort((left, right) => new Date(left.remindAt || 0) - new Date(right.remindAt || 0));
}

async function findCatalogProductById(productId, isEcom, transaction) {
  const rows = await sequelize.query(
    isEcom
      ? `
        SELECT
          ep.id,
          ep.name,
          ep.description,
          ep.brand,
          c.name AS category,
          COALESCE(ep.selling_price, ep.mrp, 0)::float AS price,
          COALESCE(ep.mrp, ep.selling_price, 0)::float AS mrp,
          FALSE AS "requiresPrescription",
          NULLIF(array_to_string(ep.images, ','), '') AS image,
          COALESCE(inv.stock_quantity, 0)::int AS stock,
          TRUE AS "isEcom",
          ep.is_active AS "isActive",
          NULL AS "saltName"
        FROM ecommerce_products ep
        LEFT JOIN categories c ON c.id = ep.category_id
        LEFT JOIN (
          SELECT
            ecommerce_product_id,
            SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
          FROM inventory
          GROUP BY ecommerce_product_id
        ) inv ON inv.ecommerce_product_id = ep.id
        WHERE ep.id = :productId
        LIMIT 1
      `
      : `
        SELECT
          m.id,
          m.name,
          m.description,
          m.manufacturer AS brand,
          c.name AS category,
          COALESCE(m.selling_price, m.mrp, 0)::float AS price,
          COALESCE(m.mrp, m.selling_price, 0)::float AS mrp,
          COALESCE(m.requires_rx, FALSE) AS "requiresPrescription",
          NULLIF(array_to_string(m.images, ','), '') AS image,
          COALESCE(inv.stock_quantity, 0)::int AS stock,
          FALSE AS "isEcom",
          m.is_active AS "isActive",
          m.salt_name AS "saltName"
        FROM medicines m
        LEFT JOIN categories c ON c.id = m.category_id
        LEFT JOIN (
          SELECT
            medicine_id,
            SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
          FROM inventory
          GROUP BY medicine_id
        ) inv ON inv.medicine_id = m.id
        WHERE m.id = :productId
        LIMIT 1
      `,
    { type: QueryTypes.SELECT, replacements: { productId }, transaction }
  );

  return rows[0] ? serializeProduct(rows[0]) : null;
}

async function searchCatalogCandidates(userId, message, transaction) {
  const location = await resolveUserLocation(userId, transaction);
  const searchTerms = extractSearchTerms(message);
  const replacements = { limit: 6 };
  const where = ['m.is_active = TRUE'];
  let distanceSql = '';

  if (location?.lat && location?.lng) {
    replacements.userLat = Number(location.lat);
    replacements.userLng = Number(location.lng);
    replacements.radiusKm = 8;
    distanceSql = `
      AND r.lat IS NOT NULL
      AND r.lng IS NOT NULL
      AND (
        6371 * ACOS(
          LEAST(
            1,
            GREATEST(
              -1,
              COS(RADIANS(:userLat)) * COS(RADIANS(r.lat)) * COS(RADIANS(r.lng) - RADIANS(:userLng))
              + SIN(RADIANS(:userLat)) * SIN(RADIANS(r.lat))
            )
          )
        )
      ) <= :radiusKm
    `;
  }

  if (searchTerms.length) {
    const termClauses = searchTerms.map((term, index) => {
      replacements[`term${index}`] = `%${term}%`;
      return `
        m.name ILIKE :term${index}
        OR COALESCE(m."saltName", '') ILIKE :term${index}
        OR COALESCE(m.description, '') ILIKE :term${index}
        OR COALESCE(m.brand, '') ILIKE :term${index}
        OR COALESCE(c.name, '') ILIKE :term${index}
      `;
    });
    where.push(`(${termClauses.join(' OR ')})`);
  }

  const query = `
    WITH combined_products AS (
      SELECT
        id,
        name,
        description,
        manufacturer AS brand,
        category_id,
        selling_price,
        mrp,
        requires_rx AS "requiresPrescription",
        images,
        salt_name AS "saltName",
        is_active,
        FALSE AS "isEcom"
      FROM medicines
      UNION ALL
      SELECT
        id,
        name,
        description,
        brand,
        category_id,
        selling_price,
        mrp,
        FALSE AS "requiresPrescription",
        images,
        NULL AS "saltName",
        is_active,
        TRUE AS "isEcom"
      FROM ecommerce_products
    )
    SELECT
      m.id,
      m.name,
      m.description,
      m.brand,
      c.name AS category,
      COALESCE(m.selling_price, m.mrp, 0)::float AS price,
      COALESCE(m.mrp, m.selling_price, 0)::float AS mrp,
      m."requiresPrescription",
      NULLIF(array_to_string(m.images, ','), '') AS image,
      COALESCE(inv.stock_quantity, 0)::int AS stock,
      m."isEcom",
      m."saltName"
    FROM combined_products m
    LEFT JOIN categories c ON c.id = m.category_id
    LEFT JOIN (
      SELECT
        COALESCE(i.medicine_id, i.ecommerce_product_id) AS product_id,
        SUM(GREATEST(i.stock_quantity - COALESCE(i.reserved_quantity, 0), 0)) AS stock_quantity
      FROM inventory i
      LEFT JOIN retailers r ON r.id = i.retailer_id
      WHERE 1 = 1
      ${distanceSql}
      GROUP BY COALESCE(i.medicine_id, i.ecommerce_product_id)
    ) inv ON inv.product_id = m.id
    WHERE ${where.join(' AND ')}
    ORDER BY
      CASE WHEN COALESCE(inv.stock_quantity, 0) > 0 THEN 0 ELSE 1 END,
      COALESCE(inv.stock_quantity, 0) DESC,
      m.name ASC
    LIMIT :limit
  `;

  const results = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements,
    transaction,
  });

  if (results.length >= 4) {
    return results.map(serializeProduct);
  }

  const fallbackQuery = `
    WITH combined_products AS (
      SELECT
        id,
        name,
        description,
        manufacturer AS brand,
        category_id,
        selling_price,
        mrp,
        requires_rx AS "requiresPrescription",
        images,
        salt_name AS "saltName",
        is_active,
        FALSE AS "isEcom"
      FROM medicines
      UNION ALL
      SELECT
        id,
        name,
        description,
        brand,
        category_id,
        selling_price,
        mrp,
        FALSE AS "requiresPrescription",
        images,
        NULL AS "saltName",
        is_active,
        TRUE AS "isEcom"
      FROM ecommerce_products
    )
    SELECT
      m.id,
      m.name,
      m.description,
      m.brand,
      c.name AS category,
      COALESCE(m.selling_price, m.mrp, 0)::float AS price,
      COALESCE(m.mrp, m.selling_price, 0)::float AS mrp,
      m."requiresPrescription",
      NULLIF(array_to_string(m.images, ','), '') AS image,
      COALESCE(inv.stock_quantity, 0)::int AS stock,
      m."isEcom",
      m."saltName"
    FROM combined_products m
    LEFT JOIN categories c ON c.id = m.category_id
    LEFT JOIN (
      SELECT
        COALESCE(i.medicine_id, i.ecommerce_product_id) AS product_id,
        SUM(GREATEST(i.stock_quantity - COALESCE(i.reserved_quantity, 0), 0)) AS stock_quantity
      FROM inventory i
      LEFT JOIN retailers r ON r.id = i.retailer_id
      WHERE 1 = 1
      ${distanceSql}
      GROUP BY COALESCE(i.medicine_id, i.ecommerce_product_id)
    ) inv ON inv.product_id = m.id
    WHERE m.is_active = TRUE
      AND COALESCE(m."requiresPrescription", FALSE) = FALSE
    ORDER BY
      CASE WHEN COALESCE(inv.stock_quantity, 0) > 0 THEN 0 ELSE 1 END,
      COALESCE(inv.stock_quantity, 0) DESC,
      m.name ASC
    LIMIT :limit
  `;

  const fallback = await sequelize.query(fallbackQuery, {
    type: QueryTypes.SELECT,
    replacements,
    transaction,
  });

  const merged = [...results, ...fallback].map(serializeProduct);
  const deduped = [];
  const seen = new Set();
  for (const product of merged) {
    if (!product?.id || seen.has(product.id)) continue;
    seen.add(product.id);
    deduped.push(product);
  }
  return deduped.slice(0, 6);
}

function buildConversationContext(messages) {
  return messages.slice(-8).map((message) => {
    const meta = message.meta || {};
    return {
      role: message.role,
      content: message.content,
      suggestedProducts: Array.isArray(meta.suggestedProducts)
        ? meta.suggestedProducts.map((product) => ({
            catalogId: product.catalogId,
            name: product.name,
            isEcom: Boolean(product.isEcom),
          }))
        : [],
      executedActions: Array.isArray(meta.executedActions) ? meta.executedActions : [],
    };
  });
}

function buildReferenceProductMap(catalogCandidates, messages) {
  const map = new Map();

  for (const product of catalogCandidates || []) {
    if (!product?.id) continue;
    map.set(product.id, { ...product, catalogId: product.id });
  }

  for (const message of messages || []) {
    const suggestedProducts = Array.isArray(message?.meta?.suggestedProducts)
      ? message.meta.suggestedProducts
      : [];

    for (const product of suggestedProducts) {
      if (!product?.catalogId) continue;
      if (!map.has(product.catalogId)) {
        map.set(product.catalogId, {
          id: product.catalogId,
          catalogId: product.catalogId,
          name: product.name || '',
          brand: product.brand || '',
          category: product.category || '',
          price: Number(product.price || 0),
          stock: Number(product.stock || 0),
          isEcom: Boolean(product.isEcom),
          requiresPrescription: Boolean(product.requiresPrescription),
          description: product.description || '',
          image: product.image || '',
        });
      }
    }
  }

  return map;
}

function resolveReferenceProduct(candidate, productMap) {
  if (!candidate || !productMap) return null;
  const directId = String(candidate.catalogId || candidate.id || '').trim();
  if (directId && productMap.has(directId)) {
    return productMap.get(directId);
  }

  const targetName = String(candidate.name || '').trim().toLowerCase();
  if (!targetName) return null;

  for (const product of productMap.values()) {
    if (String(product.name || '').trim().toLowerCase() === targetName) {
      return product;
    }
  }

  return null;
}

function sanitizeSuggestedProducts(rawProducts, productMap) {
  if (!Array.isArray(rawProducts)) return [];

  const normalized = [];
  const seen = new Set();

  for (const rawProduct of rawProducts) {
    const product = resolveReferenceProduct(rawProduct, productMap);
    if (!product?.id || seen.has(product.id)) continue;
    seen.add(product.id);

    normalized.push({
      catalogId: product.id,
      name: product.name,
      brand: product.brand || '',
      category: product.category || '',
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      isEcom: Boolean(product.isEcom),
      requiresPrescription: Boolean(product.requiresPrescription),
      description: product.description || '',
      image: product.image || '',
      reason: String(rawProduct.reason || rawProduct.why || '').trim(),
    });
  }

  return normalized.slice(0, 4);
}

async function addProductToCart(userId, productId, quantity, isEcom) {
  return sequelize.transaction(async (transaction) => {
    const product = await findCatalogProductById(productId, isEcom, transaction);
    if (!product) {
      throw new Error('The requested product is no longer available.');
    }
    if (product.stock <= 0) {
      throw new Error(`${product.name} is currently out of stock.`);
    }

    const cartId = await getActiveCartId(userId, true, transaction);

    const existingRows = await sequelize.query(
      `
      SELECT quantity
      FROM cart_items
      WHERE cart_id = :cartId
        AND ${isEcom ? 'ecommerce_product_id' : 'medicine_id'} = :productId
      LIMIT 1
      `,
      { type: QueryTypes.SELECT, replacements: { cartId, productId }, transaction }
    );

    const existingQty = Number(existingRows[0]?.quantity || 0);
    const requestedQty = existingQty + quantity;
    const availableStock = await getMedicineStock(productId, transaction, isEcom);

    if (availableStock < requestedQty) {
      throw new Error(`Only ${availableStock} unit(s) of ${product.name} are currently available.`);
    }

    const location = await resolveUserLocation(userId, transaction);
    if (location?.lat && location?.lng) {
      const nearbyRows = await sequelize.query(
        `
        SELECT COALESCE(SUM(GREATEST(i.stock_quantity - COALESCE(i.reserved_quantity, 0), 0)), 0)::int AS nearby_stock
        FROM inventory i
        JOIN retailers r ON r.id = i.retailer_id
        WHERE ${isEcom ? 'i.ecommerce_product_id' : 'i.medicine_id'} = :productId
          AND r.lat IS NOT NULL
          AND r.lng IS NOT NULL
          AND (
            6371 * ACOS(
              LEAST(
                1,
                GREATEST(
                  -1,
                  COS(RADIANS(:userLat)) * COS(RADIANS(r.lat)) * COS(RADIANS(r.lng) - RADIANS(:userLng))
                  + SIN(RADIANS(:userLat)) * SIN(RADIANS(r.lat))
                )
              )
            )
          ) <= 8
        `,
        {
          type: QueryTypes.SELECT,
          replacements: {
            productId,
            userLat: Number(location.lat),
            userLng: Number(location.lng),
          },
          transaction,
        }
      );

      if (Number(nearbyRows[0]?.nearby_stock || 0) < requestedQty) {
        throw new Error(`${product.name} is currently not deliverable within your 8 km service radius.`);
      }
    }

    if (existingQty > 0) {
      await sequelize.query(
        `
        UPDATE cart_items
        SET
          quantity = quantity + :quantity,
          unit_price = :unitPrice,
          total_price = (quantity + :quantity) * :unitPrice,
          updated_at = CURRENT_TIMESTAMP
        WHERE cart_id = :cartId
          AND ${isEcom ? 'ecommerce_product_id' : 'medicine_id'} = :productId
        `,
        {
          replacements: {
            cartId,
            productId,
            quantity,
            unitPrice: Number(product.price || 0),
          },
          transaction,
        }
      );
    } else {
      await sequelize.query(
        `
        INSERT INTO cart_items (
          cart_id,
          ${isEcom ? 'ecommerce_product_id' : 'medicine_id'},
          quantity,
          unit_price,
          total_price,
          created_at,
          updated_at
        )
        VALUES (
          :cartId,
          :productId,
          :quantity,
          :unitPrice,
          :totalPrice,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        `,
        {
          replacements: {
            cartId,
            productId,
            quantity,
            unitPrice: Number(product.price || 0),
            totalPrice: Number(product.price || 0) * quantity,
          },
          transaction,
        }
      );
    }

    const cartSnapshot = await buildCartSnapshot(userId, transaction);
    return { product, cartSnapshot };
  });
}

async function executeActionRequests(req, rawActions, productMap, language) {
  if (!Array.isArray(rawActions) || !rawActions.length) {
    return { executedActions: [], cartSnapshot: null, reminderPayload: [] };
  }

  const executedActions = [];
  let latestCartSnapshot = null;
  const reminderPayload = [];

  for (const rawAction of rawActions.slice(0, 3)) {
    const type = String(rawAction?.type || '').trim().toLowerCase();

    if (type === 'add_to_cart') {
      const product = resolveReferenceProduct(rawAction, productMap);
      if (!product?.id) continue;

      try {
        const quantity = clampQuantity(rawAction.quantity, 1);
        const result = await addProductToCart(req.user.id, product.id, quantity, Boolean(product.isEcom));
        latestCartSnapshot = result.cartSnapshot;
        executedActions.push({
          type,
          status: 'success',
          message: `${result.product.name} added to cart.`,
          quantity,
          product: {
            catalogId: result.product.id,
            name: result.product.name,
            isEcom: Boolean(result.product.isEcom),
          },
        });
      } catch (err) {
        executedActions.push({
          type,
          status: 'failed',
          message: err.message || 'Unable to add that product to cart right now.',
          product: {
            catalogId: product.id,
            name: product.name,
            isEcom: Boolean(product.isEcom),
          },
        });
      }
    }

    if (type === 'create_reminder') {
      const parsedDate = parseReminderDate(rawAction.scheduledFor);
      if (!parsedDate) {
        executedActions.push({
          type,
          status: 'failed',
          message: 'I could not understand the reminder time. Please try again with a clearer time.',
        });
        continue;
      }

      const medicationName = String(rawAction.medicationName || '').trim() || 'Medication';
      const reminderTime = formatTimeForStorage(parsedDate);
      const storedFrequency = buildStoredReminderFrequency(rawAction, parsedDate);
      const reminder = await MedicationReminder.create({
        userId: req.user.id,
        medicationName,
        frequency: storedFrequency,
        reminderTime,
        dosage: String(rawAction.dosage || '').trim() || null,
        notes: buildReminderNotes(rawAction),
      });

      const serializedReminder = serializeReminder(reminder);
      reminderPayload.push(serializedReminder);
      executedActions.push({
        type,
        status: 'success',
        message: `Reminder scheduled for ${formatReminderTime(serializedReminder.remindAt)}.`,
        reminder: serializedReminder,
      });

      await sendNotification(
        req,
        req.user.id,
        'MediBot reminder scheduled',
        `${serializedReminder.title} is set for ${formatReminderTime(serializedReminder.remindAt)}.`,
        'system'
      );
    }
  }

  return { executedActions, cartSnapshot: latestCartSnapshot, reminderPayload };
}

function buildFallbackReply({ message, cartSnapshot, reminders, catalogCandidates }) {
  const lower = String(message || '').toLowerCase();

  if (/\bcart\b/.test(lower)) {
    if (!cartSnapshot?.items?.length) {
      return {
        reply: 'Your cart is currently empty. I can help you find medicines or OTC products to add.',
        intent: 'cart_summary',
        quickReplies: DEFAULT_QUICK_REPLIES,
        suggestedProducts: [],
      };
    }

    const itemLines = cartSnapshot.items
      .slice(0, 4)
      .map((item) => `${item.name} x${item.quantity}`)
      .join(', ');

    return {
      reply: `Your cart has ${cartSnapshot.itemCount} item(s): ${itemLines}. Current total is ${money(cartSnapshot.total)}.`,
      intent: 'cart_summary',
      quickReplies: DEFAULT_QUICK_REPLIES,
      suggestedProducts: [],
    };
  }

  if (/\bremind|\breminder/.test(lower)) {
    if (!reminders.length) {
      return {
        reply: 'You do not have any active medicine reminders yet. Tell me the medicine and time, and I can schedule one for you.',
        intent: 'reminders',
        quickReplies: DEFAULT_QUICK_REPLIES,
        suggestedProducts: [],
      };
    }

    const nextReminder = reminders[0];
    return {
      reply: `Your next reminder is "${nextReminder.title}" at ${formatReminderTime(nextReminder.remindAt)}.`,
      intent: 'reminders',
      quickReplies: DEFAULT_QUICK_REPLIES,
      suggestedProducts: [],
    };
  }

  const suggestedProducts = (catalogCandidates || []).slice(0, 3).map((product) => ({
    catalogId: product.id,
    name: product.name,
    brand: product.brand || '',
    category: product.category || '',
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    isEcom: Boolean(product.isEcom),
    requiresPrescription: Boolean(product.requiresPrescription),
    description: product.description || '',
    image: product.image || '',
    reason: 'Relevant to your question and currently available in the catalog.',
  }));

  if (suggestedProducts.length) {
    return {
      reply: 'I found a few relevant products in the catalog. I can explain them, compare them, or add one to your cart.',
      intent: 'product_help',
      quickReplies: DEFAULT_QUICK_REPLIES,
      suggestedProducts,
    };
  }

  return {
    reply: 'I can help with your cart, medicine questions, dosage reminders, and OTC suggestions. Try asking what is in your cart or ask me to suggest products for a symptom.',
    intent: 'general',
    quickReplies: DEFAULT_QUICK_REPLIES,
    suggestedProducts: [],
  };
}

exports.getMediBotMessages = async (req, res) => {
  try {
    const messages = await MediBotMessage.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']],
      limit: 40,
    });

    if (!messages.length) {
      return res.json({
        messages: [
          {
            id: 'medibot-welcome',
            role: 'assistant',
            content: 'I am MediBot. I can check your cart, explain medicines in simple language, suggest OTC options, and set reminders for you.',
            language: 'en',
            intent: 'welcome',
            quickReplies: DEFAULT_QUICK_REPLIES,
            suggestedProducts: [],
            executedActions: [],
            reminders: [],
            safety: { level: 'low', warnings: [] },
            followUpQuestion: null,
            cartSnapshot: null,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }

    return res.json({ messages: messages.map(serializeMessage) });
  } catch {
    return res.status(500).json({ message: 'Unable to load MediBot history.' });
  }
};

exports.chatWithMediBot = async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const language = normalizeLanguage(req.body?.language);

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const userMessage = await MediBotMessage.create({
      userId: req.user.id,
      role: 'user',
      content: message,
      language,
      meta: {},
    });

    const [cartSnapshot, recentOrders, recentMessages, activeReminders, catalogCandidates] = await Promise.all([
      buildCartSnapshot(req.user.id),
      getRecentOrders(req.user.id),
      MediBotMessage.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'ASC']],
        limit: 12,
      }),
      getActiveReminders(req.user.id),
      searchCatalogCandidates(req.user.id, message),
    ]);

    const productMap = buildReferenceProductMap(catalogCandidates, recentMessages);
    const referenceProducts = [...productMap.values()].slice(0, 8).map((product) => ({
      catalogId: product.id,
      name: product.name,
      brand: product.brand || '',
      category: product.category || '',
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      isEcom: Boolean(product.isEcom),
      requiresPrescription: Boolean(product.requiresPrescription),
      description: product.description || '',
      saltName: product.saltName || '',
    }));

    const conversationContext = buildConversationContext(recentMessages);
    const languageInfo = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;
    const fallback = buildFallbackReply({
      message,
      cartSnapshot,
      reminders: activeReminders,
      catalogCandidates,
    });

    let assistantPayload = null;
    try {
      assistantPayload = await callGroq(
        [
          {
            role: 'system',
            content: `
You are MediBot, a deeply integrated health and commerce assistant for a medical delivery platform.

Core rules:
- Use only the provided user/cart/order/reminder/catalog context for factual claims about this user or the catalog.
- Never say an item is in the user's cart or history unless it appears in context.
- You may explain medicines, side effects, contraindications, and dosage in simple language, but always stay careful and non-diagnostic.
- For emergency red flags like chest pain, severe breathing trouble, stroke signs, seizures, severe allergy, suicidal thoughts, pregnancy emergencies, or infant high fever, advise urgent medical care and do not rely on OTC products alone.
- Suggest OTC products only from the provided reference products.
- If the user asks to add something to cart, create an action request using only the provided catalogId values.
- If the user asks for reminders, create a reminder action with ISO 8601 datetime in Asia/Kolkata (+05:30) when you can infer a time.
- Reply in ${languageInfo.label}.

Return ONLY valid JSON with this shape:
{
  "reply": "short, helpful response in the requested language",
  "intent": "general | cart_summary | medication_info | product_recommendation | symptom_triage | reminders | order_history",
  "quickReplies": ["short reply suggestion"],
  "safety": {
    "level": "low | medium | high",
    "warnings": ["short warning"]
  },
  "suggestedProducts": [
    {
      "catalogId": "uuid from reference products",
      "name": "product name",
      "reason": "why it fits"
    }
  ],
  "actionRequests": [
    {
      "type": "add_to_cart",
      "catalogId": "uuid from reference products",
      "quantity": 1
    },
    {
      "type": "create_reminder",
      "title": "Take Crocin after food",
      "medicationName": "Crocin",
      "instructions": "After dinner",
      "scheduledFor": "2026-03-26T20:00:00+05:30",
      "intervalHours": 24,
      "recurrenceLabel": "Every day at 8:00 PM"
    }
  ],
  "followUpQuestion": "null or a short follow-up question"
}
            `.trim(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              currentTime: new Date().toISOString(),
              timezone: 'Asia/Kolkata',
              preferredLanguage: languageInfo.label,
              userProfile: {
                name: req.user.name || 'Customer',
                address: req.user.address || '',
              },
              cartSnapshot,
              recentOrders,
              activeReminders,
              referenceProducts,
              conversationContext,
              latestUserMessage: message,
            }),
          },
        ],
        { temperature: 0.2, maxTokens: 1600 }
      );
    } catch {
      assistantPayload = null;
    }

    const safeReply = String(assistantPayload?.reply || fallback.reply || '').trim() || fallback.reply;
    const intent = String(assistantPayload?.intent || fallback.intent || 'general').trim();
    const quickReplies = arrayOfStrings(assistantPayload?.quickReplies, 4).length
      ? arrayOfStrings(assistantPayload?.quickReplies, 4)
      : fallback.quickReplies;
    const safety = {
      level: ['low', 'medium', 'high'].includes(assistantPayload?.safety?.level)
        ? assistantPayload.safety.level
        : 'low',
      warnings: arrayOfStrings(assistantPayload?.safety?.warnings, 4),
    };

    const suggestedProducts = sanitizeSuggestedProducts(
      assistantPayload?.suggestedProducts?.length ? assistantPayload.suggestedProducts : fallback.suggestedProducts,
      productMap
    );

    const { executedActions, cartSnapshot: refreshedCartSnapshot, reminderPayload } = await executeActionRequests(
      req,
      assistantPayload?.actionRequests,
      productMap,
      language
    );

    const assistantMeta = {
      intent,
      quickReplies,
      safety,
      suggestedProducts,
      executedActions,
      reminders: reminderPayload,
      followUpQuestion: String(assistantPayload?.followUpQuestion || '').trim() || null,
      cartSnapshot: refreshedCartSnapshot || cartSnapshot,
    };

    const assistantMessage = await MediBotMessage.create({
      userId: req.user.id,
      role: 'assistant',
      content: safeReply,
      language,
      meta: assistantMeta,
    });

    return res.json({
      userMessage: serializeMessage(userMessage),
      assistant: serializeMessage(assistantMessage),
      cartSnapshot: assistantMeta.cartSnapshot,
      reminders: reminderPayload,
    });
  } catch (err) {
    console.error('MediBot chat failed:', err.message);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'MediBot is unavailable right now.',
    });
  }
};

exports.getMedicationReminders = async (req, res) => {
  try {
    const reminders = await MedicationReminder.findAll({
      where: { userId: req.user.id, isActive: true },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    return res.json({
      reminders: reminders
        .map(serializeReminder)
        .filter(Boolean)
        .sort((left, right) => new Date(left.remindAt || 0) - new Date(right.remindAt || 0)),
    });
  } catch {
    return res.status(500).json({ message: 'Unable to load reminders.' });
  }
};

exports.checkDueMedicationReminders = async (req, res) => {
  try {
    const allActiveReminders = await MedicationReminder.findAll({
      where: {
        userId: req.user.id,
        isActive: true,
      },
      order: [['createdAt', 'DESC']],
      limit: 30,
    });

    const fired = [];
    const now = getKolkataNow();

    for (const reminder of allActiveReminders.filter((item) => isReminderDue(item, now)).slice(0, 10)) {
      const serialized = serializeReminder(reminder);
      if (!serialized) continue;

      const parsedFrequency = parseReminderFrequency(reminder.frequency);
      const [updatedCount] = await MedicationReminder.update(
        parsedFrequency.kind === 'once'
          ? { isActive: false, lastRemindedAt: now }
          : { lastRemindedAt: now },
        {
          where: {
            id: reminder.id,
            userId: req.user.id,
            isActive: true,
            lastRemindedAt: reminder.lastRemindedAt || null,
          },
        }
      );

      if (!updatedCount) continue;

      fired.push(serialized);

      await sendNotification(
        req,
        req.user.id,
        serialized.title,
        serialized.instructions || `It's time for ${serialized.medicationName || 'your medication'}.`,
        'system'
      );
    }

    const activeReminders = await MedicationReminder.findAll({
      where: { userId: req.user.id, isActive: true },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    return res.json({
      due: fired,
      reminders: activeReminders
        .map(serializeReminder)
        .filter(Boolean)
        .sort((left, right) => new Date(left.remindAt || 0) - new Date(right.remindAt || 0)),
    });
  } catch {
    return res.status(500).json({ message: 'Unable to check due reminders.' });
  }
};

exports.cancelMedicationReminder = async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOne({
      where: { id: req.params.id, userId: req.user.id, isActive: true },
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found.' });
    }

    await reminder.update({ isActive: false });
    return res.json({ message: 'Reminder cancelled.', id: reminder.id });
  } catch {
    return res.status(500).json({ message: 'Unable to cancel reminder.' });
  }
};
