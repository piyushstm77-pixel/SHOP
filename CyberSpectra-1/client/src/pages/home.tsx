import { HeroSection } from '@/components/hero-section';
import { motion } from 'framer-motion';
import { Brain, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Technology Showcase */}
      <section className="py-20 bg-gradient-to-r from-cyber-blue to-cyber-violet/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-orbitron font-black text-4xl md:text-5xl mb-6">
                <span className="text-cyber-teal">Advanced</span><br />
                <span className="text-white">Neural Networks</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Our products are powered by cutting-edge AI that adapts to your neural patterns, 
                creating a seamless interface between human consciousness and digital reality.
              </p>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 rounded-full bg-cyber-violet/20 flex items-center justify-center">
                    <Brain className="text-cyber-violet h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Neural Synchronization</h4>
                    <p className="text-gray-400">Direct mind-machine interface protocols</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 rounded-full bg-cyber-amber/20 flex items-center justify-center">
                    <Zap className="text-cyber-amber h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Quantum Processing</h4>
                    <p className="text-gray-400">Instantaneous data computation and analysis</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 rounded-full bg-cyber-teal/20 flex items-center justify-center">
                    <Shield className="text-cyber-teal h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Bio-Security</h4>
                    <p className="text-gray-400">Advanced biometric encryption systems</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Neural network visualization with futuristic interface */}
              <img 
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Neural network visualization" 
                className="w-full rounded-2xl shadow-2xl" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-cyber-violet/30 to-cyber-teal/30 rounded-2xl"></div>
              
              {/* Floating data points */}
              <motion.div 
                className="absolute top-1/4 left-1/4 w-4 h-4 bg-cyber-amber rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyber-teal rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
              />
              <motion.div 
                className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyber-violet rounded-full"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, delay: 1, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
