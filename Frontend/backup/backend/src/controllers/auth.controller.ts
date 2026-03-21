import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as otpService from '../services/auth/otp.service';
import * as jwtService from '../services/auth/jwt.service';

export const requestOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) {
        res.status(400);
        throw new Error('Phone number is required');
    }
    
    const result = await otpService.sendOtp(phone);
    res.json({ success: true, data: result });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        res.status(400);
        throw new Error('Phone and OTP are required');
    }

    const isValid = await otpService.verifyOtp(phone, otp);
    if (!isValid) {
        res.status(401);
        throw new Error('Invalid or expired OTP');
    }

    // Usually you'd fetch or create the user in the DB here via a user.service
    const tokens = await jwtService.generateTokens({ phone });
    res.json({ success: true, message: 'Login successful', data: tokens });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Validate incoming refresh token and issue new access token
    res.json({ success: true, message: 'Token refreshed', data: { accessToken: 'new.mock.token' } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Invalidate refresh token in DB or Redis
    res.json({ success: true, message: 'Logged out successfully' });
});
