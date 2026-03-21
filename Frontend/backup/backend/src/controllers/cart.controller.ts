import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as cartService from '../services/cart.service';

// Mock user ID until auth middleware is implemented
const MOCK_USER_ID = 'user_123';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = MOCK_USER_ID; // Normally req.user.id
    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
});

export const addCartItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = MOCK_USER_ID;
    const { medicineId, qty } = req.body;
    
    if (!medicineId || !qty) {
        res.status(400);
        throw new Error('medicineId and qty are required');
    }

    const result = await cartService.addItem(userId, medicineId, qty);
    res.json(result);
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = MOCK_USER_ID;
    const { itemId } = req.params;
    const { qty } = req.body;

    const result = await cartService.updateItemQuantity(userId, itemId, qty);
    res.json(result);
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = MOCK_USER_ID;
    const { itemId } = req.params;

    const result = await cartService.removeItem(userId, itemId);
    res.json(result);
});
