import { Router } from 'express';
import * as medicineController from '../controllers/medicine.controller';

const router = Router();

router.get('/', medicineController.getMedicines);
router.get('/categories', medicineController.getCategories);
router.get('/:id', medicineController.getMedicineById);
// router.get('/search', medicineController.searchMedicines); // Usually handled in getMedicines with ?q=

export default router;
