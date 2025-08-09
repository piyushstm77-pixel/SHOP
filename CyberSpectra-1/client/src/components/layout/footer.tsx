import { Box, Twitter, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export function Footer() {
  const footerSections = [
    {
      title: 'Products',
      links: [
        'Neural Interfaces',
        'Quantum Devices',
        'Bio-Wearables',
        'Holo Displays',
      ],
    },
    {
      title: 'Support',
      links: [
        'Neural Sync Guide',
        'Quantum Warranty',
        'Bio-Compatibility',
        'Contact Support',
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-t from-cyber-black to-cyber-blue/10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Box className="text-cyber-teal text-3xl" />
              <h3 className="font-orbitron font-bold text-2xl text-cyber-amber">
                NeoMarket
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              The future of commerce, today. Experience shopping in a new dimension with our 
              cyberpunk marketplace of tomorrow.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="text-gray-400 hover:text-cyber-teal transition-colors duration-300"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-cyber-teal transition-colors duration-300"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <MessageCircle className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-cyber-teal transition-colors duration-300"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <Send className="h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-orbitron font-bold text-white text-lg mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="text-gray-400 hover:text-cyber-teal transition-colors duration-300"
                      whileHover={{ x: 5 }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="font-orbitron font-bold text-white text-lg mb-6">
              Connect
            </h4>
            <p className="text-gray-400 mb-4">
              Subscribe to our neural feed for the latest updates
            </p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Neural email address"
                className="w-full bg-cyber-blue/50 border-cyber-violet/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyber-violet focus:ring-1 focus:ring-cyber-violet"
              />
              <Button className="w-full bg-cyber-violet text-white py-3 rounded-lg hover:bg-cyber-violet/80 transition-colors duration-300">
                Connect
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="border-t border-cyber-violet/30 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400">
            © 2024 NeoMarket. All rights reserved. Powered by neural quantum technology.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
