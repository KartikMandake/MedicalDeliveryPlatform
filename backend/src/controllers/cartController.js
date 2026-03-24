const { QueryTypes } = require('sequelize');
const sequelize = require('../db');

const TAX_RATE = 0.05;

const getActiveCartId = async (userId, createIfMissing = false, transaction) => {
  const carts = await sequelize.query(
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

  if (carts[0]?.id) return carts[0].id;
  if (!createIfMissing) return null;

  const inserted = await sequelize.query(
    `
    INSERT INTO carts (user_id, is_active, created_at, updated_at)
    VALUES (:userId, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
    `,
    { type: QueryTypes.SELECT, replacements: { userId }, transaction }
  );
  return inserted[0].id;
};

const getMedicineStock = async (productId, transaction, isEcom = false) => {
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
};

const buildCartResponse = async (userId, transaction) => {
  const cartId = await getActiveCartId(userId, false, transaction);
  if (!cartId) return { items: [], subtotal: 0, taxes: 0, total: 0 };

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
    ) inv ON (inv.medicine_id = ci.medicine_id AND ci.medicine_id IS NOT NULL) OR (inv.ecommerce_product_id = ci.ecommerce_product_id AND ci.ecommerce_product_id IS NOT NULL)
    WHERE ci.cart_id = :cartId
    ORDER BY ci.created_at DESC
    `,
    { type: QueryTypes.SELECT, replacements: { cartId }, transaction }
  );

  const subtotal = Number(
    items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0).toFixed(2)
  );
  const taxes = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + taxes).toFixed(2));

  return { id: cartId, items, subtotal, taxes, total };
};

exports.getCart = async (req, res) => {
  try {
    const cart = await buildCartResponse(req.user.id);
    res.json(cart);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, isEcom = false } = req.body;
    const parsedQty = Number(quantity);
    if (!productId || !Number.isInteger(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    await sequelize.transaction(async (transaction) => {
      let medicine;
      if (isEcom) {
        const ecomRows = await sequelize.query(
          `
          SELECT
            id,
            COALESCE(selling_price, mrp, 0)::float AS price,
            is_active AS "isActive"
          FROM ecommerce_products
          WHERE id = :productId
          LIMIT 1
          `,
          { type: QueryTypes.SELECT, replacements: { productId }, transaction }
        );
        medicine = ecomRows[0];
      } else {
        const medicineRows = await sequelize.query(
          `
          SELECT
            id,
            COALESCE(selling_price, mrp, 0)::float AS price,
            is_active AS "isActive"
          FROM medicines
          WHERE id = :productId
          LIMIT 1
          `,
          { type: QueryTypes.SELECT, replacements: { productId }, transaction }
        );
        medicine = medicineRows[0];
      }

      if (!medicine || !medicine.isActive) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const cartId = await getActiveCartId(req.user.id, true, transaction);

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
      const requestedQty = existingQty + parsedQty;
      const availableStock = await getMedicineStock(productId, transaction, isEcom);

      if (availableStock < requestedQty) {
        return res.status(400).json({ message: 'Insufficient stock' });
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
          WHERE cart_id = :cartId AND ${isEcom ? 'ecommerce_product_id' : 'medicine_id'} = :productId
          `,
          {
            replacements: { cartId, productId, quantity: parsedQty, unitPrice: Number(medicine.price || 0) },
            transaction
          }
        );
      } else {
        await sequelize.query(
          `
          INSERT INTO cart_items (cart_id, ${isEcom ? 'ecommerce_product_id' : 'medicine_id'}, quantity, unit_price, total_price, created_at, updated_at)
          VALUES (:cartId, :productId, :quantity, :unitPrice, :totalPrice, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `,
          {
            replacements: {
              cartId,
              productId,
              quantity: parsedQty,
              unitPrice: Number(medicine.price || 0),
              totalPrice: Number(medicine.price || 0) * parsedQty
            },
            transaction
          }
        );
      }

      const cart = await buildCartResponse(req.user.id, transaction);
      res.json(cart);
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCartItem = async (req, res) => {
  try {
    const parsedQty = Number(req.body?.quantity);
    if (!Number.isInteger(parsedQty)) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    await sequelize.transaction(async (transaction) => {
      const cartId = await getActiveCartId(req.user.id, false, transaction);
      if (!cartId) return res.status(404).json({ message: 'Cart not found' });

      const itemRows = await sequelize.query(
        `
        SELECT id, COALESCE(medicine_id, ecommerce_product_id) AS "productId", (ecommerce_product_id IS NOT NULL) AS "isEcom"
        FROM cart_items
        WHERE id = :itemId
          AND cart_id = :cartId
        LIMIT 1
        `,
        { type: QueryTypes.SELECT, replacements: { itemId: req.params.itemId, cartId }, transaction }
      );
      const item = itemRows[0];
      if (!item) return res.status(404).json({ message: 'Cart item not found' });

      if (parsedQty <= 0) {
        await sequelize.query(
          `DELETE FROM cart_items WHERE id = :itemId AND cart_id = :cartId`,
          { replacements: { itemId: req.params.itemId, cartId }, transaction }
        );
      } else {
        const availableStock = await getMedicineStock(item.productId, transaction, item.isEcom);
        if (availableStock < parsedQty) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }

        await sequelize.query(
          `
          UPDATE cart_items ci
          SET
            quantity = :quantity,
            total_price = :quantity * COALESCE(ci.unit_price, 0),
            updated_at = CURRENT_TIMESTAMP
          WHERE ci.id = :itemId
            AND ci.cart_id = :cartId
          `,
          { replacements: { itemId: req.params.itemId, cartId, quantity: parsedQty }, transaction }
        );
      }

      const cart = await buildCartResponse(req.user.id, transaction);
      res.json(cart);
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeFromCart = async (req, res) => {
  try {
    await sequelize.transaction(async (transaction) => {
      const cartId = await getActiveCartId(req.user.id, false, transaction);
      if (!cartId) return res.status(404).json({ message: 'Cart not found' });

      const deletedRows = await sequelize.query(
        `
        DELETE FROM cart_items
        WHERE id = :itemId
          AND cart_id = :cartId
        RETURNING id
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { itemId: req.params.itemId, cartId },
          transaction,
        }
      );

      if (!deletedRows.length) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      const cart = await buildCartResponse(req.user.id, transaction);
      res.json(cart);
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.clearCart = async (req, res) => {
  try {
    await sequelize.transaction(async (transaction) => {
      const cartId = await getActiveCartId(req.user.id, false, transaction);
      if (!cartId) return res.json({ items: [], subtotal: 0, taxes: 0, total: 0 });

      await sequelize.query(
        `DELETE FROM cart_items WHERE cart_id = :cartId`,
        { replacements: { cartId }, transaction }
      );

      const cart = await buildCartResponse(req.user.id, transaction);
      res.json(cart);
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
