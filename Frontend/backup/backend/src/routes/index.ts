import { Router } from 'express';

import authRoutes from './auth.routes';
import medicineRoutes from './medicine.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';

const router = Router();

// Domains
router.use('/auth', authRoutes);
router.use('/medicines', medicineRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
// ...

// Healthcheck endpoint
router.get('/status', (req, res) => {
    res.json({ message: 'Enterprise Node.js Backend with TS is running!' });
});

export default router;
