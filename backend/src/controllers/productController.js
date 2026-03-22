const { Op, QueryTypes } = require('sequelize');
const Product = require('../models/Product');
const sequelize = require('../db');

async function resolveUserLocation(req) {
  const queryLat = Number(req.query?.userLat);
  const queryLng = Number(req.query?.userLng);
  if (Number.isFinite(queryLat) && Number.isFinite(queryLng)) {
    return { lat: queryLat, lng: queryLng, source: 'query' };
  }

  if (!req.user?.id) return null;

  const rows = await sequelize.query(
    `
    SELECT lat, lng
    FROM user_addresses
    WHERE user_id = :userId
      AND lat IS NOT NULL
      AND lng IS NOT NULL
    ORDER BY is_default DESC, updated_at DESC
    LIMIT 1
    `,
    {
      type: QueryTypes.SELECT,
      replacements: { userId: req.user.id },
    }
  );

  const lat = Number(rows[0]?.lat);
  const lng = Number(rows[0]?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, source: 'default-address' };
}

exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      categories,
      brands,
      minPrice,
      maxPrice,
      inStockOnly,
      requiresPrescription,
      sort = 'newest',
      page = 1,
      limit = 12,
      radiusKm = 8,
    } = req.query;

    const categoryList = [];
    if (category) categoryList.push(category);
    if (Array.isArray(categories)) categoryList.push(...categories);
    else if (typeof categories === 'string' && categories.trim()) categoryList.push(...categories.split(','));

    const brandList = [];
    if (Array.isArray(brands)) brandList.push(...brands);
    else if (typeof brands === 'string' && brands.trim()) brandList.push(...brands.split(','));

    const allowedSort = {
      newest: 'm.id DESC',
      price_asc: 'COALESCE(m.selling_price, m.mrp) ASC',
      price_desc: 'COALESCE(m.selling_price, m.mrp) DESC',
      name_asc: 'm.name ASC',
      stock_desc: 'stock_quantity DESC',
    };
    const orderBy = allowedSort[sort] || allowedSort.newest;
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 12;
    const parsedPage = Number(page) > 0 ? Number(page) : 1;
    const offset = (parsedPage - 1) * parsedLimit;

    const replacements = {
      limit: parsedLimit,
      offset,
    };

    const resolvedLocation = await resolveUserLocation(req);
    const parsedUserLat = Number(resolvedLocation?.lat);
    const parsedUserLng = Number(resolvedLocation?.lng);
    const parsedRadiusKm = Number(radiusKm);
    const hasUserLocation = Number.isFinite(parsedUserLat) && Number.isFinite(parsedUserLng);

    const where = ['m.is_active = TRUE'];

    if (!hasUserLocation) {
      return res.status(400).json({ message: 'User location is required. Set a default address with map pin or pass userLat/userLng.' });
    }

    replacements.userLat = parsedUserLat;
    replacements.userLng = parsedUserLng;
    replacements.radiusKm = Number.isFinite(parsedRadiusKm) && parsedRadiusKm > 0 ? parsedRadiusKm : 8;

    const nearbyRetailerDistanceSql = `
      (
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
      )
    `;

    if (search) {
      replacements.search = `%${search}%`;
      where.push('(m.name ILIKE :search OR m.salt_name ILIKE :search OR m.manufacturer ILIKE :search)');
    }
    if (categoryList.length) {
      replacements.categoryList = categoryList;
      where.push('c.name IN (:categoryList)');
    }
    if (brandList.length) {
      replacements.brandList = brandList;
      where.push('m.manufacturer IN (:brandList)');
    }
    if (minPrice) {
      replacements.minPrice = Number(minPrice);
      where.push('COALESCE(m.selling_price, m.mrp) >= :minPrice');
    }
    if (maxPrice) {
      replacements.maxPrice = Number(maxPrice);
      where.push('COALESCE(m.selling_price, m.mrp) <= :maxPrice');
    }
    if (requiresPrescription !== undefined) {
      replacements.requiresRx = String(requiresPrescription) === 'true';
      where.push('m.requires_rx = :requiresRx');
    }
    if (String(inStockOnly) === 'true') {
      where.push(`
        EXISTS (
          SELECT 1
          FROM inventory i
          JOIN retailers r ON r.id = i.retailer_id
          WHERE i.medicine_id = m.id
            AND r.lat IS NOT NULL
            AND r.lng IS NOT NULL
            AND ${nearbyRetailerDistanceSql} <= :radiusKm
            AND GREATEST(i.stock_quantity - COALESCE(i.reserved_quantity, 0), 0) > 0
        )
      `);
    }

    const whereSql = where.join('\n        AND ');

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM medicines m
      LEFT JOIN categories c ON c.id = m.category_id
      WHERE ${whereSql}
    `;

    const listQuery = `
      SELECT
        m.id,
        m.name,
        m.description,
        m.type,
        m.section,
        m.manufacturer AS brand,
        c.name AS category,
        c.icon_url AS "categoryIcon",
        COALESCE(m.selling_price, m.mrp, 0)::float AS price,
        COALESCE(m.mrp, m.selling_price, 0)::float AS mrp,
        m.requires_rx AS "requiresPrescription",
        NULLIF(array_to_string(m.images, ','), '') AS image,
        COALESCE(inv.stock_quantity, 0)::int AS stock,
        m.salt_name AS "saltName"
      FROM medicines m
      LEFT JOIN categories c ON c.id = m.category_id
      LEFT JOIN (
        SELECT
          i.medicine_id,
          SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
        FROM inventory i
        JOIN retailers r ON r.id = i.retailer_id
        WHERE r.lat IS NOT NULL
          AND r.lng IS NOT NULL
          AND ${nearbyRetailerDistanceSql} <= :radiusKm
        GROUP BY i.medicine_id
      ) inv ON inv.medicine_id = m.id
      WHERE ${whereSql}
      ORDER BY ${orderBy}
      LIMIT :limit OFFSET :offset
    `;

    const [countRows, products] = await Promise.all([
      sequelize.query(countQuery, { type: QueryTypes.SELECT, replacements }),
      sequelize.query(listQuery, { type: QueryTypes.SELECT, replacements }),
    ]);

    const total = countRows[0]?.total || 0;
    res.json({ products, total, page: parsedPage, pages: Math.ceil(total / parsedLimit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProduct = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `
      SELECT
        m.id,
        m.name,
        m.description,
        m.manufacturer AS brand,
        c.name AS category,
        c.icon_url AS "categoryIcon",
        COALESCE(m.selling_price, m.mrp, 0)::float AS price,
        m.requires_rx AS "requiresPrescription",
        NULLIF(array_to_string(m.images, ','), '') AS image,
        COALESCE(inv.stock_quantity, 0)::int AS stock,
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
      WHERE m.id = :id
      LIMIT 1
      `,
      { type: QueryTypes.SELECT, replacements: { id: req.params.id } }
    );
    const product = rows[0];
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProductFilters = async (req, res) => {
  try {
    const [categories, brands] = await Promise.all([
      sequelize.query(
        `
        SELECT
          c.id,
          c.name,
          c.icon_url AS "iconUrl",
          COUNT(m.id)::int AS "productCount"
        FROM categories c
        LEFT JOIN medicines m
          ON m.category_id = c.id
         AND m.is_active = TRUE
        GROUP BY c.id, c.name, c.icon_url
        ORDER BY c.name ASC
        `,
        { type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `
        SELECT
          manufacturer AS name,
          COUNT(*)::int AS count
        FROM medicines
        WHERE is_active = TRUE
          AND manufacturer IS NOT NULL
          AND manufacturer <> ''
        GROUP BY manufacturer
        ORDER BY count DESC, manufacturer ASC
        LIMIT 200
        `,
        { type: QueryTypes.SELECT }
      ),
    ]);

    res.json({ categories, brands });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, retailerId: req.user.id });
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProduct = async (req, res) => {
  try {
    const [updated] = await Product.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(await Product.findByPk(req.params.id));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
