import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';

const router = Router();

router.get('/', cartController.getCart);
router.post('/add', cartController.addCartItem);
router.patch('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeCartItem);

export default router;
