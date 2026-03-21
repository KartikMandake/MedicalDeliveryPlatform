import { Router } from 'express';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.post('/', orderController.placeOrder);
router.get('/', orderController.getOrders);
router.get('/:orderId', orderController.getOrderDetails);
router.get('/:orderId/track', orderController.trackOrder);
router.post('/:orderId/cancel', orderController.cancelOrder);

export default router;
