const router = require('express').Router();
const {
	getProducts,
	getProduct,
	getProductFilters,
	createProduct,
	updateProduct,
	deleteProduct,
} = require('../controllers/productController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');

router.get('/', optionalProtect, getProducts);
router.get('/filters', getProductFilters);
router.get('/:id', getProduct);
router.post('/', protect, authorize('retailer', 'admin'), createProduct);
router.put('/:id', protect, authorize('retailer', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
