import { create } from 'zustand';
import type { Order, OrderStatus } from '@/types';

interface OrderState {
  activeOrderId: string | null;
  orders: Order[];
  setActiveOrder: (id: string | null) => void;
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

export const useOrderStore = create<OrderState>()((set) => ({
  activeOrderId: null,
  orders: [],
  setActiveOrder: (id) => set({ activeOrderId: id }),
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    })),
}));
