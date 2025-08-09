import { ProductGrid } from '@/components/product-grid';
import { motion } from 'framer-motion';

export default function Products() {
  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-br from-cyber-black via-cyber-blue/10 to-cyber-violet/10 py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-orbitron font-black text-5xl md:text-6xl mb-6">
            <span className="text-cyber-amber">Product</span>{' '}
            <span className="text-white">Catalog</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our complete collection of futuristic technology designed to enhance human potential
          </p>
        </div>
      </motion.div>
      
      <ProductGrid />
    </div>
  );
}
