const router = require('express').Router();
const upload = require('../middleware/upload');
const {
  getDashboard,
  getProfile,
  getOrders,
  updateOrderStatus,
  updateLocation,
  getAvailableAgents,
  getInventory,
  addToInventory,
  updateInventoryItem,
  deleteInventoryItem,
  searchMedicines,
  getCategories,
  verifyDocument,
} = require('../controllers/retailerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('retailer'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.get('/orders', getOrders);
router.get('/agents/available', getAvailableAgents);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/location', updateLocation);
router.get('/inventory', getInventory);
router.post('/inventory', addToInventory);
router.put('/inventory/:id', updateInventoryItem);
router.delete('/inventory/:id', deleteInventoryItem);
router.get('/medicines/search', searchMedicines);
router.get('/categories', getCategories);
router.post('/verify', upload.single('document'), verifyDocument);

module.exports = router;
