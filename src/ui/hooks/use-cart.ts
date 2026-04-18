'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ICartItem } from '@/src/types';

interface CartState {
  items: ICartItem[];
  addItem: (item: Omit<ICartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(i => i.variantId === item.variantId);
          
          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity || 1;
            return { items: newItems };
          }
          
          return { 
            items: [...state.items, { ...item, quantity: item.quantity || 1 }] 
          };
        });
      },
      
      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter(i => i.variantId !== variantId)
        }));
      },
      
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter(i => i.variantId !== variantId)
          }));
          return;
        }
        
        set((state) => ({
          items: state.items.map(i => 
            i.variantId === variantId ? { ...i, quantity } : i
          )
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'asward-cart',
    }
  )
);

export const useCart = () => {
  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);
  const getTotal = useCartStore(state => state.getTotal);
  const getItemCount = useCartStore(state => state.getItemCount);
  
  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total: getTotal(),
    itemCount: getItemCount(),
  };
};