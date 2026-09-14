import type { Order, Payment, SupportTicket } from '@/types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    userId: 'usr-001',
    items: [
      { id: '1', name: 'Campus BBQ Stack', price: 3500, quantity: 2, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop' },
      { id: '5', name: 'Fruit Bowl', price: 1800, quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=100&h=100&fit=crop' },
    ],
    status: 'delivered',
    subtotal: 8800,
    deliveryFee: 500,
    total: 9300,
    address: { streetAddress: 'Obakekere, FUTA South Gate', city: 'Akure', phone: '08012345678' },
    paystackRef: 'PSK_ref_001',
    hpEarned: 38,
    estimatedDelivery: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    prepDeadline: new Date(Date.now() - 2.4 * 60 * 60 * 1000).toISOString(),
    rider: { name: 'Aisha Rider', phone: '08022221111', vehicle: 'Red dispatch bike', etaMinutes: 0 },
    statusHistory: [
      { status: 'placed', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { status: 'confirmed', timestamp: new Date(Date.now() - 2.8 * 60 * 60 * 1000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString() },
      { status: 'out_for_delivery', timestamp: new Date(Date.now() - 2.2 * 60 * 60 * 1000).toISOString() },
      { status: 'delivered', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-002',
    userId: 'usr-001',
    items: [
      { id: '3', name: 'Mediterranean Bowl', price: 4500, quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop' },
      { id: '7', name: 'Smoky Mediterranean', price: 1200, quantity: 2, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&h=100&fit=crop' },
    ],
    status: 'preparing',
    subtotal: 6900,
    deliveryFee: 500,
    total: 7400,
    address: { streetAddress: 'FUTA North Gate, beside GTBank', city: 'Akure', phone: '08098765432' },
    paystackRef: 'PSK_ref_002',
    hpEarned: 25,
    estimatedDelivery: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    prepDeadline: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    rider: { name: 'Tobi Rider', phone: '08033332222', vehicle: 'Campus dispatch bike', etaMinutes: 20 },
    statusHistory: [
      { status: 'placed', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { status: 'confirmed', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-003',
    userId: 'usr-003',
    items: [
      { id: '5', name: 'Fruit Bowl', price: 5500, quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=100&h=100&fit=crop' },
    ],
    status: 'out_for_delivery',
    subtotal: 5500,
    deliveryFee: 500,
    total: 6000,
    address: { streetAddress: 'Aule, FUTA Road', city: 'Akure', landmark: 'Near Dominos', phone: '09011223344' },
    paystackRef: 'PSK_ref_003',
    hpEarned: 25,
    estimatedDelivery: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    prepDeadline: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    rider: { name: 'Dara Rider', phone: '08100000001', vehicle: 'Black scooter', etaMinutes: 8 },
    statusHistory: [
      { status: 'placed', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { status: 'confirmed', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
      { status: 'out_for_delivery', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-004',
    userId: 'usr-001',
    items: [
      { id: '2', name: 'Spicy Campus Fusion', price: 3000, quantity: 3, imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=100&h=100&fit=crop' },
      { id: '6', name: 'Herby Mediterranean', price: 1500, quantity: 2, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=100&h=100&fit=crop' },
    ],
    status: 'placed',
    subtotal: 12000,
    deliveryFee: 500,
    total: 12500,
    address: { streetAddress: 'FUTA South Gate', city: 'Akure', phone: '08012345678' },
    paystackRef: 'PSK_ref_004',
    hpEarned: 54,
    estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    prepDeadline: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    statusHistory: [{ status: 'placed', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() }],
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'PAY-001', orderId: 'ORD-001', paystackRef: 'PSK_ref_001', amount: 9300, status: 'success', channel: 'card', customerEmail: 'adewale@futa.edu.ng', customerPhone: '08012345678', paidAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'PAY-002', orderId: 'ORD-002', paystackRef: 'PSK_ref_002', amount: 7400, status: 'success', channel: 'wallet', customerEmail: 'funmi@futa.edu.ng', customerPhone: '08098765432', paidAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
];

export const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-001',
    userId: 'usr-002',
    userName: 'Funmilayo Adebayo',
    userEmail: 'funmi@futa.edu.ng',
    orderId: 'ORD-002',
    subject: 'Order taking too long',
    status: 'open',
    priority: 'high',
    messages: [
      { id: 'm1', sender: 'customer', message: 'My order has been preparing for over 30 minutes. Is everything okay?', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
];

export const MOCK_USERS = [
  { id: 'usr-001', name: 'Adewale Johnson', email: 'adewale@futa.edu.ng', totalHP: 248, ordersCount: 9, totalSpent: 45600 },
  { id: 'usr-002', name: 'Funmilayo Adebayo', email: 'funmi@futa.edu.ng', totalHP: 420, ordersCount: 14, totalSpent: 82300 },
  { id: 'usr-003', name: 'Chinedu Okonkwo', email: 'chinedu@futa.edu.ng', totalHP: 188, ordersCount: 5, totalSpent: 28900 },
  { id: 'usr-004', name: 'Blessing Eze', email: 'blessing@futa.edu.ng', totalHP: 312, ordersCount: 22, totalSpent: 134500 },
];
