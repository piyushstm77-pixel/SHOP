import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Link } from 'wouter';
import type { Product } from '@shared/schema';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, isAddingToCart } = useCart();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['/api/products', id],
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart({ productId: product.id });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyber-violet mx-auto mb-4"></div>
          <p className="text-gray-400">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <p className="text-gray-400 mb-8">The requested product could not be found.</p>
          <Link href="/products">
            <Button className="neon-border rounded-lg px-6 py-3 font-semibold text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-cyber-black via-cyber-blue/5 to-cyber-violet/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/products">
            <Button 
              variant="ghost" 
              className="mb-8 text-cyber-teal hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="holographic rounded-2xl p-6">
              <img
                src={product.image}
                alt={product.name}
                className="w-full rounded-xl"
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="font-orbitron font-bold text-4xl text-cyber-amber">
                  ₿{parseFloat(product.price).toFixed(2)}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="text-cyber-amber h-6 w-6 fill-current" />
                  <span className="text-white text-lg">{parseFloat(product.rating).toFixed(1)}</span>
                  <span className="text-gray-400">(127 reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed">
              {product.description}
            </p>

            {product.specifications && typeof product.specifications === 'object' && (
              <div className="space-y-4">
                <h3 className="font-orbitron font-bold text-xl text-white">
                  Specifications
                </h3>
                <div className="holographic rounded-xl p-6">
                  <ul className="space-y-3">
                    {Object.entries(product.specifications as Record<string, string>).map(([key, value]) => (
                      <li key={key} className="flex justify-between items-center">
                        <span className="text-cyber-teal font-semibold">{key}:</span>
                        <span className="text-gray-300">{String(value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex space-x-4 pt-6">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.inStock}
                className="flex-1 bg-cyber-violet text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-cyber-violet/80 transition-colors duration-300"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                className="px-8 py-4 border-cyber-teal text-cyber-teal rounded-xl hover:bg-cyber-teal/20 transition-all duration-300"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {!product.inStock && (
              <motion.div 
                className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-red-400 font-semibold text-center">
                  Currently out of stock - Neural restock in progress
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
