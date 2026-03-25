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
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng, source: 'default-address' };
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
    {
      type: QueryTypes.SELECT,
      replacements: { userId: req.user.id },
    }
  );

  const orderLat = Number(orderRows[0]?.lat);
  const orderLng = Number(orderRows[0]?.lng);
  if (Number.isFinite(orderLat) && Number.isFinite(orderLng)) {
    return { lat: orderLat, lng: orderLng, source: 'latest-order-address' };
  }

  return null;
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
      productType,
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
      where.push('(m.name ILIKE :search OR m."saltName" ILIKE :search OR m.brand ILIKE :search)');
    }
    if (categoryList.length) {
      replacements.categoryList = categoryList;
      where.push('c.name IN (:categoryList)');
    }
    if (brandList.length) {
      replacements.brandList = brandList;
      where.push('m.brand IN (:brandList)');
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
      where.push('m."requiresPrescription" = :requiresRx');
    }
    if (productType === 'medicine') {
      where.push('m."isEcom" = FALSE');
    } else if (productType === 'ecom') {
      where.push('m."isEcom" = TRUE');
    }
    if (String(inStockOnly) === 'true') {
      where.push(`
        EXISTS (
          SELECT 1
          FROM inventory i
          JOIN retailers r ON r.id = i.retailer_id
          WHERE (i.medicine_id = m.id OR i.ecommerce_product_id = m.id)
            AND r.lat IS NOT NULL
            AND r.lng IS NOT NULL
            AND ${nearbyRetailerDistanceSql} <= :radiusKm
            AND GREATEST(i.stock_quantity - COALESCE(i.reserved_quantity, 0), 0) > 0
        )
      `);
    }

    const whereSql = where.join('\n        AND ');

    const cteSql = `
      WITH combined_products AS (
        SELECT
          id,
          name,
          description,
          type::text,
          section,
          manufacturer AS brand,
          category_id,
          selling_price,
          mrp,
          requires_rx AS "requiresPrescription",
          images,
          salt_name AS "saltName",
          is_active,
          FALSE AS "isEcom",
          NULL::numeric AS rating,
          NULL::int AS "reviewCount",
          id AS medicine_id,
          NULL::uuid AS ecommerce_product_id
        FROM medicines
        UNION ALL
        SELECT
          id,
          name,
          description,
          'E-Commerce'::text AS type,
          NULL AS section,
          brand,
          category_id,
          selling_price,
          mrp,
          FALSE AS "requiresPrescription",
          images,
          NULL AS "saltName",
          is_active,
          TRUE AS "isEcom",
          average_rating AS rating,
          total_reviews AS "reviewCount",
          NULL::uuid AS medicine_id,
          id AS ecommerce_product_id
        FROM ecommerce_products
      )
    `;

    const countQuery = `
      ${cteSql}
      SELECT COUNT(*)::int AS total
      FROM combined_products m
      LEFT JOIN categories c ON c.id = m.category_id
      WHERE ${whereSql}
    `;

    const listQuery = `
      ${cteSql}
      SELECT
        m.id,
        m.name,
        m.description,
        m.type,
        m.section,
        m.brand,
        c.name AS category,
        c.icon_url AS "categoryIcon",
        COALESCE(m.selling_price, m.mrp, 0)::float AS price,
        COALESCE(m.mrp, m.selling_price, 0)::float AS mrp,
        m."requiresPrescription",
        NULLIF(array_to_string(m.images, ','), '') AS image,
        COALESCE(inv.stock_quantity, 0)::int AS stock,
        m."saltName",
        m."isEcom",
        m.rating,
        m."reviewCount"
      FROM combined_products m
      LEFT JOIN categories c ON c.id = m.category_id
      LEFT JOIN (
        SELECT
          COALESCE(i.medicine_id, i.ecommerce_product_id) AS product_id,
          SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
        FROM inventory i
        JOIN retailers r ON r.id = i.retailer_id
        WHERE r.lat IS NOT NULL
          AND r.lng IS NOT NULL
          AND ${nearbyRetailerDistanceSql} <= :radiusKm
        GROUP BY COALESCE(i.medicine_id, i.ecommerce_product_id)
      ) inv ON inv.product_id = m.id
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
        m.type::text AS type,
        m.manufacturer AS brand,
        c.name AS category,
        c.icon_url AS "categoryIcon",
        COALESCE(m.selling_price, m.mrp, 0)::float AS price,
        m.mrp::float AS mrp,
        m.requires_rx AS "requiresPrescription",
        NULLIF(array_to_string(m.images, ','), '') AS image,
        COALESCE(inv.stock_quantity, 0)::int AS stock,
        m.salt_name AS "saltName",
        FALSE AS "isEcom",
        NULL::numeric AS rating,
        NULL::int AS "reviewCount"
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
      
      UNION ALL
      
      SELECT
        ep.id,
        ep.name,
        ep.description,
        'E-Commerce' AS type,
        ep.brand,
        c.name AS category,
        c.icon_url AS "categoryIcon",
        COALESCE(ep.selling_price, ep.mrp, 0)::float AS price,
        ep.mrp::float AS mrp,
        FALSE AS "requiresPrescription",
        NULLIF(array_to_string(ep.images, ','), '') AS image,
        COALESCE(inv.stock_quantity, 0)::int AS stock,
        NULL AS "saltName",
        TRUE AS "isEcom",
        ep.average_rating AS rating,
        ep.total_reviews AS "reviewCount"
      FROM ecommerce_products ep
      LEFT JOIN categories c ON c.id = ep.category_id
      LEFT JOIN (
        SELECT
          ecommerce_product_id,
          SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
        FROM inventory
        GROUP BY ecommerce_product_id
      ) inv ON inv.ecommerce_product_id = ep.id
      WHERE ep.id = :id
      
      LIMIT 1
      `,
      { type: QueryTypes.SELECT, replacements: { id: req.params.id } }
    );
    const product = rows[0];
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Geo-radius stock check: only count stock from retailers within 8km
    const resolvedLocation = await resolveUserLocation(req);
    const userLat = Number(resolvedLocation?.lat);
    const userLng = Number(resolvedLocation?.lng);

    if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
      const col = product.isEcom ? 'i.ecommerce_product_id' : 'i.medicine_id';
      const nearbyRows = await sequelize.query(
        `
        SELECT COALESCE(SUM(GREATEST(i.stock_quantity - COALESCE(i.reserved_quantity, 0), 0)), 0)::int AS nearby_stock
        FROM inventory i
        JOIN retailers r ON r.id = i.retailer_id
        WHERE ${col} = :productId
          AND r.lat IS NOT NULL AND r.lng IS NOT NULL
          AND (
            6371 * ACOS(
              LEAST(1, GREATEST(-1,
                COS(RADIANS(:userLat)) * COS(RADIANS(r.lat)) * COS(RADIANS(r.lng) - RADIANS(:userLng))
                + SIN(RADIANS(:userLat)) * SIN(RADIANS(r.lat))
              ))
            )
          ) <= 8
        `,
        { type: QueryTypes.SELECT, replacements: { productId: product.id, userLat, userLng } }
      );
      product.nearbyStock = Number(nearbyRows[0]?.nearby_stock || 0);
      product.outOfRange = product.nearbyStock <= 0;
    } else {
      product.nearbyStock = product.stock;
      product.outOfRange = false;
    }

    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProductSuggestions = async (req, res) => {
  try {
    const resolvedLocation = await resolveUserLocation(req);
    const parsedUserLat = Number(resolvedLocation?.lat);
    const parsedUserLng = Number(resolvedLocation?.lng);
    const hasUserLocation = Number.isFinite(parsedUserLat) && Number.isFinite(parsedUserLng);

    if (!hasUserLocation) {
      return res.json({ suggestions: [] });
    }

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

    const listQuery = `
      SELECT
        ep.id,
        ep.name,
        ep.description,
        ep.brand,
        c.name AS category,
        NULL AS "categoryIcon",
        COALESCE(ep.selling_price, ep.mrp, 0)::float AS price,
        COALESCE(ep.mrp, ep.selling_price, 0)::float AS mrp,
        FALSE AS "requiresPrescription",
        NULLIF(array_to_string(ep.images, ','), '') AS image,
        COALESCE(inv.stock_quantity, 0)::int AS stock,
        NULL AS "saltName",
        TRUE AS "isEcom",
        ep.average_rating AS rating,
        ep.total_reviews AS "reviewCount"
      FROM ecommerce_products ep
      LEFT JOIN categories c ON c.id = ep.category_id
      JOIN (
        SELECT
          i.ecommerce_product_id,
          SUM(GREATEST(stock_quantity - COALESCE(reserved_quantity, 0), 0)) AS stock_quantity
        FROM inventory i
        JOIN retailers r ON r.id = i.retailer_id
        WHERE i.ecommerce_product_id IS NOT NULL
          AND r.lat IS NOT NULL
          AND r.lng IS NOT NULL
          AND ${nearbyRetailerDistanceSql} <= :radiusKm
        GROUP BY i.ecommerce_product_id
      ) inv ON inv.ecommerce_product_id = ep.id
      WHERE ep.is_active = TRUE
        AND inv.stock_quantity > 0
      ORDER BY RANDOM()
      LIMIT :limit
    `;

    const replacements = {
      limit: 4,
      userLat: parsedUserLat,
      userLng: parsedUserLng,
      radiusKm: 8
    };

    const suggestions = await sequelize.query(listQuery, { type: QueryTypes.SELECT, replacements });
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
        LEFT JOIN (
          SELECT id, category_id, is_active FROM medicines
          UNION ALL
          SELECT id, category_id, is_active FROM ecommerce_products
        ) m
          ON m.category_id = c.id
         AND m.is_active = TRUE
        GROUP BY c.id, c.name, c.icon_url
        ORDER BY c.name ASC
        `,
        { type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `
        WITH combined_brands AS (
          SELECT manufacturer AS name FROM medicines WHERE is_active = TRUE AND manufacturer IS NOT NULL AND manufacturer <> ''
          UNION ALL
          SELECT brand AS name FROM ecommerce_products WHERE is_active = TRUE AND brand IS NOT NULL AND brand <> ''
        )
        SELECT
          name,
          COUNT(*)::int AS count
        FROM combined_brands
        GROUP BY name
        ORDER BY count DESC, name ASC
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
