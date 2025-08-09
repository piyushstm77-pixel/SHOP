import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { RedeemModal } from '@/components/redeem-modal';
import type { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { addToCart, isAddingToCart } = useCart();
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ productId: product.id });
  };

  const handleRedeemCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRedeemModal(true);
  };

  const handleCardClick = () => {
    onProductClick?.(product);
  };

  return (
    <motion.div
      className="cyber-card rounded-2xl p-6 cursor-pointer relative group"
      onClick={handleCardClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div className="relative overflow-hidden rounded-xl mb-4">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
      </motion.div>
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-orbitron font-bold text-lg text-white">
          {product.name}
        </h3>
        <span className="text-cyber-amber font-bold text-xl">
          ₿{parseFloat(product.price).toFixed(2)}
        </span>
      </div>
      
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {product.description}
      </p>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Star className="text-cyber-amber h-4 w-4 fill-current" />
            <span className="text-sm text-gray-300">
              {parseFloat(product.rating).toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-gray-500 capitalize">{product.category}</span>
        </div>
        
        <motion.div 
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.inStock}
              className="w-full cyber-button"
              size="sm"
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              {isAddingToCart ? 'Adding...' : 'Cart'}
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Button
              onClick={handleRedeemCode}
              disabled={!product.inStock}
              className="w-full neon-border bg-cyber-amber/10 text-cyber-amber rounded-lg hover:bg-cyber-amber/20 transition-all duration-300"
              size="sm"
            >
              <Gift className="mr-1 h-4 w-4" />
              Redeem
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        product={{
          ...product,
          price: parseFloat(product.price),
          rating: parseFloat(product.rating)
        }}
      />
      
      {!product.inStock && (
        <div className="absolute inset-0 bg-cyber-black/50 rounded-2xl flex items-center justify-center">
          <span className="text-red-400 font-bold text-lg">Out of Stock</span>
        </div>
      )}
    </motion.div>
  );
}
