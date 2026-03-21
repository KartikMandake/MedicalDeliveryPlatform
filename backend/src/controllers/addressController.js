const UserAddress = require('../models/UserAddress');
const sequelize = require('../db');

const REQUIRED_FIELDS = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode', 'lat', 'lng'];
let geoColumnsEnsuredPromise = null;

async function ensureGeoColumns() {
  if (!geoColumnsEnsuredPromise) {
    geoColumnsEnsuredPromise = (async () => {
      await sequelize.query('ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION');
      await sequelize.query('ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION');
    })();
  }

  try {
    await geoColumnsEnsuredPromise;
  } catch (err) {
    geoColumnsEnsuredPromise = null;
    throw err;
  }
}

function toNullableNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function sanitize(payload = {}) {
  return {
    label: String(payload.label || 'Home').trim() || 'Home',
    fullName: String(payload.fullName || '').trim(),
    phone: String(payload.phone || '').trim(),
    line1: String(payload.line1 || '').trim(),
    line2: String(payload.line2 || '').trim(),
    city: String(payload.city || '').trim(),
    state: String(payload.state || '').trim(),
    pincode: String(payload.pincode || '').trim(),
    lat: toNullableNumber(payload.lat),
    lng: toNullableNumber(payload.lng),
    landmark: String(payload.landmark || '').trim(),
    isDefault: Boolean(payload.isDefault),
  };
}

function validateAddress(address) {
  for (const field of REQUIRED_FIELDS) {
    if (address[field] === null || address[field] === undefined || address[field] === '') {
      return `Address field is required: ${field}`;
    }
  }
  if (!/^\d{6}$/.test(address.pincode)) return 'Pincode must be exactly 6 digits';
  if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ''))) return 'Phone must be exactly 10 digits';
  if (!Number.isFinite(address.lat) || address.lat < -90 || address.lat > 90) return 'Latitude must be between -90 and 90';
  if (!Number.isFinite(address.lng) || address.lng < -180 || address.lng > 180) return 'Longitude must be between -180 and 180';
  return null;
}

exports.getAddresses = async (req, res) => {
  try {
    await ensureGeoColumns();
    const addresses = await UserAddress.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['updatedAt', 'DESC']],
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDefaultAddress = async (req, res) => {
  try {
    await ensureGeoColumns();
    const address = await UserAddress.findOne({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['updatedAt', 'DESC']],
    });
    res.json({ address: address || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAddress = async (req, res) => {
  try {
    await ensureGeoColumns();
    const payload = sanitize(req.body || {});
    const error = validateAddress(payload);
    if (error) return res.status(400).json({ message: error });

    const existingCount = await UserAddress.count({ where: { userId: req.user.id } });
    const shouldBeDefault = payload.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    const created = await UserAddress.create({
      userId: req.user.id,
      ...payload,
      isDefault: shouldBeDefault,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    await ensureGeoColumns();
    const existing = await UserAddress.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Address not found' });

    const payload = sanitize({ ...existing.toJSON(), ...req.body });
    const error = validateAddress(payload);
    if (error) return res.status(400).json({ message: error });

    if (payload.isDefault) {
      await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    await existing.update(payload);
    res.json(existing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    await ensureGeoColumns();
    const existing = await UserAddress.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = existing.isDefault;
    await existing.destroy();

    if (wasDefault) {
      const fallback = await UserAddress.findOne({
        where: { userId: req.user.id },
        order: [['updatedAt', 'DESC']],
      });
      if (fallback) await fallback.update({ isDefault: true });
    }

    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    await ensureGeoColumns();
    const existing = await UserAddress.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Address not found' });

    await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id } });
    await existing.update({ isDefault: true });

    res.json(existing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
