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

    const { category, brand, maxPrice, inStock, search } = req.query;

    if (search) {
      conditions.push(`(m.name ILIKE $${paramIndex} OR m.description ILIKE $${paramIndex} OR m.manufacturer ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      const cats = category.split(',');
      conditions.push(`m.category_id IN (SELECT id FROM categories WHERE name = ANY($${paramIndex}))`);
      queryParams.push(cats);
      paramIndex++;
    }

    if (brand) {
      const brands = brand.split(',');
      conditions.push(`m.manufacturer = ANY($${paramIndex})`);
      queryParams.push(brands);
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(`m.selling_price <= $${paramIndex}`);
      queryParams.push(Number(maxPrice));
      paramIndex++;
    }

    if (inStock === 'true') {
      conditions.push(`m.id IN (SELECT medicine_id FROM inventory WHERE stock_quantity > 0)`);
    }

    let queryStr = `
      SELECT m.*, COALESCE(SUM(i.stock_quantity), 0) as total_stock
      FROM medicines m
      LEFT JOIN inventory i ON m.id = i.medicine_id
    `;
    
    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryStr += ' GROUP BY m.id ';

    const { sort } = req.query;
    if (sort === 'Price Low to High') {
      queryStr += ' ORDER BY m.selling_price ASC';
    } else if (sort === 'Price High to Low') {
      queryStr += ' ORDER BY m.selling_price DESC';
    } else {
      queryStr += ' ORDER BY m.id ASC';
    }

    queryStr += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await db.query(queryStr, queryParams);

    const formattedMedicines = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      brand: row.manufacturer,
      price: Number(row.selling_price || 0),
      description: row.description || 'Essential clinical medication.',
      rating: (Math.random() * (5 - 3) + 3).toFixed(1),
      image: row.images && row.images.length > 0 ? row.images.join(',') : null,
      rxRequired: row.requires_rx,
      outOfStock: Number(row.total_stock) <= 0
    }));

    res.json(formattedMedicines);
  } catch (error) {
    console.error('Error fetching all medicines:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
};

exports.getFilters = async (req, res) => {
  try {
    const brandsResult = await db.query(`
      SELECT manufacturer as brand, count(id) as count 
      FROM medicines 
      WHERE is_active = true AND manufacturer IS NOT NULL 
      GROUP BY manufacturer 
      ORDER BY brand ASC
    `);

    const categoriesResult = await db.query(`
      SELECT c.id, c.name, c.icon_url, count(m.id) as count 
      FROM categories c 
      LEFT JOIN medicines m ON c.id = m.category_id AND m.is_active = true 
      GROUP BY c.id 
      ORDER BY c.name ASC
    `);

    res.json({
      brands: brandsResult.rows.map(r => ({ brand: r.brand, count: parseInt(r.count) })),
      categories: categoriesResult.rows.map(r => ({ 
        id: r.id, 
        name: r.name, 
        icon_url: r.icon_url, 
        count: parseInt(r.count) 
      }))
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
};
