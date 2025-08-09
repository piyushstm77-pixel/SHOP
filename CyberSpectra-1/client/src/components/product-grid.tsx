import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './product-card';
import { ProductModal } from './product-modal';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants';
import type { Product } from '@shared/schema';

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: selectedCategory === 'all' 
      ? ['/api/products'] 
      : ['/api/products', { category: selectedCategory }],
  });

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <div className="py-20 bg-gradient-to-b from-cyber-black to-cyber-blue/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-black text-4xl md:text-5xl mb-6">
              <span className="text-cyber-amber">Loading</span>{' '}
              <span className="text-white">Arsenal</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="holographic rounded-2xl p-6 h-80 animate-pulse">
                <div className="w-full h-48 bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-8 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-cyber-black to-cyber-blue/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-orbitron font-black text-4xl md:text-5xl mb-6">
            <span className="text-cyber-amber">Futuristic</span>{' '}
            <span className="text-white">Arsenal</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Cutting-edge technology that pushes the boundaries of what's possible
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div 
          className="flex flex-wrap justify-center mb-12 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-6 py-3 rounded-full border transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'border-cyber-violet bg-cyber-violet/20 text-cyber-violet'
                  : 'border-cyber-teal/30 text-cyber-teal hover:bg-cyber-teal/20'
              }`}
              variant="outline"
            >
              {category.name}
            </Button>
          ))}
        </motion.div>

        {/* Product Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          layout
        >
          <AnimatePresence mode="wait">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                layout
              >
                <ProductCard
                  product={product}
                  onProductClick={handleProductClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {products.length === 0 && !isLoading && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-400 text-lg">
              No products found in this category.
            </p>
          </motion.div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeModal}
      />
    </section>
  );
}
