const router = require('express').Router();
const {
	getProducts,
	getProduct,
	getProductFilters,
	getProductSuggestions,
	createProduct,
	updateProduct,
	deleteProduct,
} = require('../controllers/productController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');

router.get('/', optionalProtect, getProducts);
router.get('/filters', getProductFilters);
router.get('/:id', optionalProtect, getProduct);
router.get('/:id/suggestions', optionalProtect, getProductSuggestions);
router.post('/', protect, authorize('retailer', 'admin'), createProduct);
router.put('/:id', protect, authorize('retailer', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
