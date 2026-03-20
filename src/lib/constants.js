export const DEMO_USER_ID = '20000000-0000-0000-0000-000000000001';
export const DEFAULT_TRACKING_ORDER_NUMBER = 'ORD-1001';

export const DEMO_CHECKOUT_PROFILE = {
  name: 'Sujal Sonavane',
  contact: '+1 (555) 012-3456',
  addresses: [
    {
      id: 'home',
      label: 'Home',
      line1: '124 Clinical Heights, Dehu Phata',
      line2: 'Pune, 412105',
      contact: '+1 (555) 012-3456',
    },
    {
      id: 'office',
      label: 'Office',
      line1: 'Precision Lab Hub, Block 4C',
      line2: 'Pune, 412105',
      contact: '+1 (555) 987-6543',
    },
  ],
};

export const DEMO_PRODUCTS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Paracetamol 650',
    manufacturer: 'MediPharm Labs',
    description: 'Fever and mild pain relief.',
    price: 39,
    rating: '4.6',
    reviewCount: 345,
    requiresRx: false,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAtAr2G6oLMC24sWFObYW5Z0r8NvZIQYtxqyoK5ylKgUQrK4gqatRhLrM9sw4ETuaSVuHAidjmjs1t7VJf5wcOKQ8azDqrc-vXBLyygj7_fjxtyMUUaUGW4nIj1W9chSRZxDgdcaK6vqLLBPdmdFm7RsPRqzvXABDozNMantY8gCc0gqXk7Jul9ztB9Ql76Z48wlBzGyiePgMk6NKLb5nbcPUtHrBkfYGbocnw4W3P6XA7_o6dS-Jzof4AD8Wy8UNrBZduq903oFgPS',
    inStock: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Cough Syrup Plus',
    manufacturer: 'HealthNova',
    description: 'Dry cough suppressant syrup.',
    price: 99,
    rating: '4.7',
    reviewCount: 678,
    requiresRx: false,
    image:
      'https://cdn01.pharmeasy.in/dam/products_otc/H93792/himalaya-koflet-syrup-100ml-6-koflet-lozenges-free-for-wet-dry-cough-6.01-1743230945.jpg',
    inStock: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Vitamin C 500',
    manufacturer: 'NutriWell',
    description: 'Daily immunity support.',
    price: 159,
    rating: '4.5',
    reviewCount: 289,
    requiresRx: false,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQOMoYtylNo1sYfLjTeMTAF-70GPB-Y_ckmHROrHhcCVw1ehgmBlWzs24wbYaXNtZJRsW_GnxGjrzqSIgzCtauK4xzPacf4ZrdW8wsXcL8xVeAW0YEz8zT9C2roCnm3XUjdEAXvngz2F_7WHDGBnjbd6xhaCHRqHsKKUEBxaONumly_NLDOEhkTfXqgZvxrHrbpkAHIpZU3qB2umvitag1YhyKDnY1tHgILTKKoKxk0m-koyTUnFobaOSLZIEbd1PSvFW4I-EXOZBb',
    inStock: true,
  },
];
