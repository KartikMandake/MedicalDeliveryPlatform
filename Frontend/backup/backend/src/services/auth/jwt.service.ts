// TODO: Import 'jsonwebtoken' when implementing real tokens
// import jwt from 'jsonwebtoken';

export const generateTokens = async (payload: any) => {
    // TODO: Sign actual JWT using env JWT_SECRET
    console.log(`[JWT Service] Generating tokens for payload:`, payload);
    return {
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token'
    };
};

export const verifyToken = async (token: string) => {
    // TODO: Verify actual token
    return { valid: true, payload: { role: 'USER', id: 'uuid-123' } };
};
