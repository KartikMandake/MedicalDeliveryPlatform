const db = require('../config/db');

exports.getRecommended = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM medicines LIMIT 6');
    
    // Format the database rows into the shape the frontend currently expects
    const formattedMedicines = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      brand: row.manufacturer,
      price: `$${row.selling_price}`,
      oldPrice: row.mrp ? `$${row.mrp}` : null,
      rx: row.requires_rx,
      demand: Math.random() > 0.7, 
      lowStock: Math.random() > 0.8,
      img: row.images && row.images.length > 0 ? row.images.join(',') : null
    }));

    res.json(formattedMedicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    let conditions = [];
    let queryParams = [];
    let paramIndex = 1;

    const { category, brand, maxPrice, inStock } = req.query;

    if (category) {
      const cats = category.split(',');
      conditions.push(`category_id IN (SELECT id FROM categories WHERE name = ANY($${paramIndex}))`);
      queryParams.push(cats);
      paramIndex++;
    }

    if (brand) {
      const brands = brand.split(',');
      conditions.push(`manufacturer = ANY($${paramIndex})`);
      queryParams.push(brands);
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(`selling_price <= $${paramIndex}`);
      queryParams.push(Number(maxPrice));
      paramIndex++;
    }

    if (inStock === 'true') {
      conditions.push(`is_active = true`);
    }

    let whereClause = '';
    if (conditions.length > 0) {
      whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    // Count total matching rows
    const countResult = await db.query(`SELECT COUNT(*) FROM medicines${whereClause}`, queryParams.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].count, 10);

    let queryStr = `SELECT * FROM medicines${whereClause}`;

    const { sort } = req.query;
    if (sort === 'Price Low to High') {
      queryStr += ' ORDER BY selling_price ASC';
    } else if (sort === 'Price High to Low') {
      queryStr += ' ORDER BY selling_price DESC';
    } else {
      queryStr += ' ORDER BY id ASC';
    }

    queryStr += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await db.query(queryStr, queryParams);
    
    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      brand: row.manufacturer,
      price: Number(row.selling_price || 0),
      description: row.description || 'Essential clinical medication.',
      rating: (Math.random() * (5 - 3) + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 200 + 10),
      image: row.images && row.images.length > 0 ? row.images.join(',') : null,
      requiresPrescription: row.requires_rx,
      stock: row.is_active ? Math.floor(Math.random() * 50 + 5) : 0
    }));

    res.json({ products, total });
  } catch (error) {
    console.error('Error fetching all medicines:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
};
