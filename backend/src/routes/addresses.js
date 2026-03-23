const router = require('express').Router();
const {
  getAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAddresses);
router.get('/default', getDefaultAddress);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.put('/:id/default', setDefaultAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
