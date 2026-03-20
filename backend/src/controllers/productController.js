const { Op } = require('sequelize');
const Product = require('../models/Product');
const User = require('../models/User');

exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, requiresPrescription, sort = 'createdAt', page = 1, limit = 12 } = req.query;
    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (category) where.category = category;
    if (requiresPrescription !== undefined) where.requiresPrescription = requiresPrescription === 'true';
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Product.findAndCountAll({ where, order: [[sort, 'DESC']], offset, limit: Number(limit) });
    res.json({ products: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
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
