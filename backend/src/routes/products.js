const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('retailer', 'admin'), createProduct);
router.put('/:id', protect, authorize('retailer', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
