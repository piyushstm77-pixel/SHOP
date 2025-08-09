import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-cyber-black/80 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            className="relative bg-cyber-black/95 backdrop-blur-md border border-cyber-violet/30 rounded-2xl p-8 max-w-4xl w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-orbitron font-bold text-2xl text-white">
                Product Demo
              </h3>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                data-testid="button-close-demo"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Video Container */}
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                title="NeoMarket Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                data-testid="iframe-demo-video"
              />
              
              {/* Cyberpunk overlay frame */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyber-teal rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyber-teal rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyber-teal rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyber-teal rounded-br-lg"></div>
              </div>
            </div>
            
            {/* Demo Description */}
            <div className="text-center">
              <h4 className="font-semibold text-xl text-white mb-3">
                Experience the Future of Digital Commerce
              </h4>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Watch how our cyberpunk marketplace revolutionizes the shopping experience with neural interfaces, 
                quantum processing, and immersive product interactions that blur the line between digital and reality.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={onClose}
                  className="neon-border rounded-xl px-6 py-3 font-semibold text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300"
                  data-testid="button-explore-products"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Shopping
                </Button>
                <Button 
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl px-6 py-3"
                  data-testid="button-close-modal"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}