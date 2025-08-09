import { motion } from 'framer-motion';
import { RedeemCodeInput } from '@/components/redeem-code-input';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RedeemPage() {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-cyber-black via-cyber-blue/5 to-cyber-violet/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <Button
              variant="ghost"
              className="text-cyber-teal hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="font-orbitron font-bold text-4xl md:text-6xl text-white mb-4">
            <span className="text-cyber-teal">Code</span>{' '}
            <span className="text-cyber-amber">Redemption</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock exclusive downloads, discounts, and premium content with your redeem codes
          </p>
        </motion.div>

        {/* Redeem Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <RedeemCodeInput />
        </motion.div>

        {/* Information Section */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="holographic rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-cyber-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-cyber-amber text-2xl">📥</span>
            </div>
            <h3 className="font-orbitron font-bold text-lg text-white mb-2">
              Downloads
            </h3>
            <p className="text-gray-400 text-sm">
              Access exclusive files, software, and digital content
            </p>
          </div>

          <div className="holographic rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-cyber-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-cyber-teal text-2xl">💰</span>
            </div>
            <h3 className="font-orbitron font-bold text-lg text-white mb-2">
              Discounts
            </h3>
            <p className="text-gray-400 text-sm">
              Get percentage discounts on your next purchases
            </p>
          </div>

          <div className="holographic rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-cyber-violet/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-cyber-violet text-2xl">🔓</span>
            </div>
            <h3 className="font-orbitron font-bold text-lg text-white mb-2">
              Product Unlocks
            </h3>
            <p className="text-gray-400 text-sm">
              Unlock premium products and features
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}