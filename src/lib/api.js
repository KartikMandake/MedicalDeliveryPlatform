const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function addToCart({ userId, medicineId, quantity = 1 }) {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, medicineId, quantity }),
  });
  return parseResponse(response);
}

export async function getCart(userId) {
  const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
  return parseResponse(response);
}

export async function updateCartItemQuantity({ itemId, quantity }) {
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  return parseResponse(response);
}

export async function getOrderTracking(orderNumber) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}/tracking`);
  return parseResponse(response);
}

export async function updateOrderStatus({ orderId, status }) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return parseResponse(response);
}

export async function pushAgentLocation({ agentId, lat, lng, isOnline = true }) {
  const response = await fetch(`${API_BASE_URL}/agent/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, lat, lng, isOnline }),
  });
  return parseResponse(response);
}

export async function placeOrder({ userId, deliveryAddress, paymentMethod }) {
  const response = await fetch(`${API_BASE_URL}/orders/place`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, deliveryAddress, paymentMethod }),
  });
  return parseResponse(response);
}
