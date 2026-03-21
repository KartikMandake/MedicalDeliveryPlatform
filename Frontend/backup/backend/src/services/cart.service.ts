export const getCart = async (userId: string) => {
    console.log(`[Cart Service] Fetching cart for user ${userId}`);
    return { 
        userId, 
        items: [
            { itemId: 'item_1', medicineId: '1', name: 'Paracetamol 500mg', qty: 2, price: 15 }
        ],
        total: 30
    };
};

export const addItem = async (userId: string, medicineId: string, qty: number) => {
    console.log(`[Cart Service] Adding ${qty} of medicine ${medicineId} to cart of user ${userId}`);
    return { success: true, message: 'Item added to cart' };
};

export const updateItemQuantity = async (userId: string, itemId: string, qty: number) => {
    console.log(`[Cart Service] Updating item ${itemId} to qty ${qty} for user ${userId}`);
    return { success: true, message: 'Cart updated' };
};

export const removeItem = async (userId: string, itemId: string) => {
    console.log(`[Cart Service] Removing item ${itemId} from cart of user ${userId}`);
    return { success: true, message: 'Item removed from cart' };
};
