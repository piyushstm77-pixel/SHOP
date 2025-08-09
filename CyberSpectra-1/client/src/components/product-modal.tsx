import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, ShoppingCart, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';
import type { Product } from '@shared/schema';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart, isAddingToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  // Combine main image with additional images for gallery
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtube.com') 
        ? url.split('v=')[1]?.split('&')[0]
        : url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url; // Direct video link
  };

  const handleAddToCart = () => {
    addToCart({ productId: product.id });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-cyber-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="holographic rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="font-orbitron font-bold text-3xl text-white">
                  {product.name}
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  {/* Main Image Gallery */}
                  <div className="relative mb-4">
                    <motion.img
                      src={allImages[currentImageIndex]}
                      alt={product.name}
                      className="w-full rounded-xl"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Navigation arrows for multiple images */}
                    {allImages.length > 1 && (
                      <>
                        <Button
                          onClick={prevImage}
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          onClick={nextImage}
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          {currentImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail row */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'border-cyber-teal shadow-lg' 
                              : 'border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Video Section */}
                  {product.videoUrl && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
                        <Play className="h-5 w-5 mr-2 text-cyber-teal" />
                        Product Video
                      </h4>
                      <div className="rounded-xl overflow-hidden bg-gray-900">
                        {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') || product.videoUrl.includes('vimeo.com') ? (
                          <iframe
                            src={getVideoEmbedUrl(product.videoUrl)}
                            className="w-full h-64"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={product.videoUrl}
                            controls
                            className="w-full h-64"
                            preload="metadata"
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="font-orbitron font-bold text-3xl text-cyber-amber">
                      ₿{parseFloat(product.price).toFixed(2)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="text-cyber-amber h-5 w-5 fill-current" />
                      <span className="text-white">{parseFloat(product.rating).toFixed(1)}</span>
                      <span className="text-gray-400">(127 reviews)</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-lg mb-6">
                    {product.description}
                  </p>
                  
                  {product.specifications && typeof product.specifications === 'object' && (
                    <div className="space-y-4 mb-8">
                      <h4 className="font-semibold text-white text-lg">Specifications:</h4>
                      <ul className="space-y-2 text-gray-300">
                        {Object.entries(product.specifications as Record<string, string>).map(([key, value]) => (
                          <li key={key}>
                            <span className="text-cyber-teal">• {key}:</span> {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || !product.inStock}
                      className="flex-1 bg-cyber-violet text-white py-3 px-6 rounded-xl font-semibold hover:bg-cyber-violet/80 transition-colors duration-300"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <Button
                      variant="outline"
                      className="px-6 py-3 border-cyber-teal text-cyber-teal rounded-xl hover:bg-cyber-teal/20 transition-all duration-300"
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {!product.inStock && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 font-semibold">Currently out of stock</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
