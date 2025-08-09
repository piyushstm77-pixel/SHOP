import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart as CartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';
import { CheckoutModal } from './checkout-modal';

export function ShoppingCart() {
  const {
    cartItems,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    isUpdatingCart,
    isRemovingFromCart,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsCartOpen(false);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity({ productId, quantity: newQuantity });
    }
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-cyber-black/50 backdrop-blur-sm" />
            
            {/* Cart Sidebar */}
            <motion.div
              className="absolute top-0 right-0 h-full w-96 bg-cyber-black/95 backdrop-blur-md border-l border-cyber-violet/30"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-orbitron font-bold text-xl text-white">
                    Shopping Cart
                  </h3>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto mb-6">
                  {cartItems.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <CartIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Your cart is empty</p>
                      <p className="text-sm">Add some futuristic items to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {cartItems.map((item) => (
                          <motion.div
                            key={item.id}
                            className="flex items-center space-x-4 p-4 bg-cyber-blue/20 rounded-xl"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">
                                {item.product.name}
                              </h4>
                              <p className="text-cyber-amber font-bold">
                                ₿{parseFloat(item.product.price).toFixed(2)}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  disabled={isUpdatingCart}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-cyber-teal border-cyber-teal/30"
                                >
                                  -
                                </Button>
                                <span className="text-gray-300 text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  disabled={isUpdatingCart}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-cyber-teal border-cyber-teal/30"
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                            <Button
                              onClick={() => removeFromCart(item.productId)}
                              disabled={isRemovingFromCart}
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:text-red-300 transition-colors duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                
                {/* Cart Footer */}
                {cartItems.length > 0 && (
                  <div className="border-t border-cyber-violet/30 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-white">Total:</span>
                      <span className="font-orbitron font-bold text-xl text-cyber-amber">
                        ₿{cartTotal.toFixed(2)}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleCheckout}
                      className="w-full neon-border rounded-xl py-3 font-orbitron font-bold text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300 animate-glow"
                    >
                      <CartIcon className="mr-2 h-4 w-4" />
                      Checkout
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        total={cartTotal}
      />
    </>
  );
}
