const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, cartController.getCart);
router.post('/', protect, cartController.addToCart);
router.post('/add', protect, cartController.addToCart);
router.put('/:itemId', protect, cartController.updateCartItem);
router.delete('/:itemId', protect, cartController.removeFromCart);

module.exports = router;
