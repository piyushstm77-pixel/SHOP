import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getSessionId } from '@/lib/constants';
import type { Product, CartItem } from '@shared/schema';

type CartItemWithProduct = CartItem & { product: Product };

export function useCart() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart', sessionId],
    refetchInterval: false,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const response = await apiRequest('POST', '/api/cart', {
        sessionId,
        productId,
        quantity,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
      // Auto-open cart when item is added
      setIsCartOpen(true);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await apiRequest('PATCH', `/api/cart/${sessionId}/${productId}`, {
        quantity,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest('DELETE', `/api/cart/${sessionId}/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/cart/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    isLoading,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateQuantityMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
}
