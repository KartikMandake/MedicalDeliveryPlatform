import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as orderService from '../services/order/order.service';

const MOCK_USER_ID = 'user_123';

export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = MOCK_USER_ID;
    const result = await orderService.placeOrder(userId);
    res.json({ success: true, data: result });
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = MOCK_USER_ID;
    const orders = await orderService.getUserOrders(userId);
    res.json({ success: true, data: orders });
});

export const getOrderDetails = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const details = await orderService.getOrderDetails(orderId);
    res.json({ success: true, data: details });
});

export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const tracking = await orderService.trackOrder(orderId);
    res.json({ success: true, data: tracking });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const result = await orderService.cancelOrder(orderId, reason);
    res.json(result);
});
