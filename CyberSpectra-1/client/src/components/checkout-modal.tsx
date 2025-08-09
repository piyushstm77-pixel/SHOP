import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Bitcoin, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getSessionId } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import type { Product, CartItem } from '@shared/schema';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: (CartItem & { product: Product })[];
  total: number;
}

export function CheckoutModal({ isOpen, onClose, cartItems, total }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  
  const { clearCart } = useCart();
  const { toast } = useToast();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Order Placed Successfully!',
        description: 'Your futuristic items are being prepared for neural delivery.',
      });
      clearCart();
      onClose();
    },
    onError: () => {
      toast({
        title: 'Order Failed',
        description: 'Unable to process your order. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const orderData = {
      sessionId: getSessionId(),
      total: total.toString(),
      paymentMethod,
      billingInfo,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-cyber-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="holographic rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-orbitron font-bold text-3xl text-white">
                Secure Checkout
              </h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-white text-lg mb-4">
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border border-cyber-violet/30 rounded-xl hover:bg-cyber-violet/10 transition-colors duration-300 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="crypto"
                      checked={paymentMethod === 'crypto'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-cyber-violet"
                    />
                    <Bitcoin className="text-cyber-amber h-5 w-5" />
                    <span className="text-white">Cryptocurrency (Bitcoin/Ethereum)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border border-cyber-violet/30 rounded-xl hover:bg-cyber-violet/10 transition-colors duration-300 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="neural"
                      checked={paymentMethod === 'neural'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-cyber-violet"
                    />
                    <Brain className="text-cyber-teal h-5 w-5" />
                    <span className="text-white">Neural Credits</span>
                  </label>
                </div>
              </div>
              
              {/* Billing Information */}
              <div>
                <h3 className="font-semibold text-white text-lg mb-4">
                  Billing Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={billingInfo.firstName}
                    onChange={(e) => setBillingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="bg-cyber-blue/50 border-cyber-violet/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyber-violet focus:ring-1 focus:ring-cyber-violet"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={billingInfo.lastName}
                    onChange={(e) => setBillingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="bg-cyber-blue/50 border-cyber-violet/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyber-violet focus:ring-1 focus:ring-cyber-violet"
                    required
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Neural Email Address"
                  value={billingInfo.email}
                  onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full mt-4 bg-cyber-blue/50 border-cyber-violet/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyber-violet focus:ring-1 focus:ring-cyber-violet"
                  required
                />
              </div>
              
              {/* Order Summary */}
              <div className="border-t border-cyber-violet/30 pt-6">
                <h3 className="font-semibold text-white text-lg mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-gray-300">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="text-white">
                        ₿{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-cyber-violet/30">
                  <span className="font-semibold text-white">Total:</span>
                  <span className="font-orbitron font-bold text-2xl text-cyber-amber">
                    ₿{total.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full neon-border rounded-xl py-4 font-orbitron font-bold text-lg text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300 animate-glow"
              >
                <Lock className="mr-2 h-5 w-5" />
                {createOrderMutation.isPending ? 'Processing...' : 'Complete Purchase'}
              </Button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
