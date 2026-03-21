export const placeOrder = async (userId: string) => {
    console.log(`[Order Service] Placing order for user ${userId}`);
    // Mock logic: generate orderId and trigger geo-match
    return { orderId: 'ord_999', status: 'CONFIRMED', total: 30 };
};

export const getUserOrders = async (userId: string) => {
    console.log(`[Order Service] Fetching history for user ${userId}`);
    return [
        { orderId: 'ord_999', date: new Date(), status: 'CONFIRMED', total: 30 }
    ];
};

export const getOrderDetails = async (orderId: string) => {
    console.log(`[Order Service] Fetching details for ${orderId}`);
    return { orderId, status: 'CONFIRMED', timeline: ['Placed', 'Confirmed'] };
};

export const trackOrder = async (orderId: string) => {
    console.log(`[Order Service] Tracking ${orderId}`);
    return { orderId, agentLocation: { lat: 12.9716, lng: 77.5946 }, eta: '10 mins' };
};

export const cancelOrder = async (orderId: string, reason: string) => {
    console.log(`[Order Service] Cancelling ${orderId} due to ${reason}`);
    return { success: true, message: `Order ${orderId} cancelled` };
};
