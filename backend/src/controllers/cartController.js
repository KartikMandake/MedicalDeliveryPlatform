const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { v4: uuidv4 } = require('crypto');

const calcTotals = async (items) => {
  let subtotal = 0;
  for (const item of items) {
    const p = await Product.findByPk(item.productId);
    if (p) { item.name = p.name; item.price = p.price; item.image = p.image; item.brand = p.brand; item.category = p.category; item.requiresPrescription = p.requiresPrescription; }
    subtotal += (item.price || 0) * item.quantity;
  }
  const taxes = +(subtotal * 0.05).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), taxes, total: +(subtotal + taxes).toFixed(2) };
};

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.json({ items: [], subtotal: 0, taxes: 0, total: 0 });
    const totals = await calcTotals(cart.items);
    res.json({ ...cart.toJSON(), ...totals });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });

    const items = [...cart.items];
    const existing = items.find((i) => i.productId === productId);
    if (existing) existing.quantity += quantity;
    else items.push({ id: `${Date.now()}`, productId, quantity });

    await cart.update({ items });
    const totals = await calcTotals(items);
    res.json({ ...cart.toJSON(), items, ...totals });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    let items = cart.items.filter((i) => quantity > 0 || i.id !== req.params.itemId);
    items = items.map((i) => i.id === req.params.itemId ? { ...i, quantity } : i);
    await cart.update({ items });
    const totals = await calcTotals(items);
    res.json({ ...cart.toJSON(), items, ...totals });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const items = cart.items.filter((i) => i.id !== req.params.itemId);
    await cart.update({ items });
    res.json({ message: 'Item removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.update({ items: [] }, { where: { userId: req.user.id } });
    res.json({ message: 'Cart cleared' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
