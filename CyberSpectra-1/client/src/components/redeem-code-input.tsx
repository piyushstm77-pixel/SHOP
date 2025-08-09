import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function RedeemCodeInput() {
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsRedeeming(true);
    setRedeemResult(null);

    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        setRedeemResult({
          success: true,
          type: result.type,
          value: result.value,
          message: result.message,
        });
        
        toast({
          title: 'Code Redeemed Successfully!',
          description: result.message,
        });

        // Auto-download if it's a download type
        if (result.type === 'download' && result.value?.downloadUrl) {
          window.open(result.value.downloadUrl, '_blank');
        }
        
        setCode('');
      } else {
        setRedeemResult({
          success: false,
          message: result.message || 'Failed to redeem code',
        });
        
        toast({
          title: 'Redemption Failed',
          description: result.message || 'Invalid or expired code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setRedeemResult({
        success: false,
        message: 'Network error occurred',
      });
      
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const getResultIcon = () => {
    if (!redeemResult) return null;
    
    return redeemResult.success ? (
      <CheckCircle className="h-6 w-6 text-green-400" />
    ) : (
      <XCircle className="h-6 w-6 text-red-400" />
    );
  };

  const getResultContent = () => {
    if (!redeemResult?.success) return null;

    switch (redeemResult.type) {
      case 'download':
        return (
          <div className="flex items-center space-x-2 text-cyber-teal">
            <Download className="h-5 w-5" />
            <span>Download started automatically</span>
          </div>
        );
      case 'discount':
        return (
          <div className="text-cyber-amber">
            <span className="font-bold">{redeemResult.value?.discountPercent}% Discount</span> applied to your next purchase!
          </div>
        );
      case 'product_unlock':
        return (
          <div className="text-cyber-violet">
            <span className="font-bold">Product Unlocked:</span> {redeemResult.value?.productId}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        className="holographic rounded-xl p-6 space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-cyber-violet/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="text-cyber-violet h-6 w-6" />
          </div>
          <h2 className="font-orbitron font-bold text-xl text-white mb-2">
            Redeem Code
          </h2>
          <p className="text-gray-400 text-sm">
            Enter your redeem code to unlock exclusive content
          </p>
        </div>

        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter your code (e.g., CYBER2024)"
              className="bg-cyber-blue/50 border-cyber-violet/30 text-white text-center text-lg font-mono tracking-wider"
              disabled={isRedeeming}
            />
          </div>

          <Button
            type="submit"
            disabled={!code.trim() || isRedeeming}
            className="w-full neon-border rounded-xl py-3 font-semibold text-cyber-amber hover:bg-cyber-violet/20 transition-all duration-300 animate-glow"
          >
            {isRedeeming ? 'Redeeming...' : 'Redeem Code'}
          </Button>
        </form>

        <AnimatePresence>
          {redeemResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg border ${
                redeemResult.success
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getResultIcon()}
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {redeemResult.success ? 'Success!' : 'Failed'}
                  </p>
                  <p className="text-sm text-gray-300">
                    {redeemResult.message}
                  </p>
                  {getResultContent()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center text-xs text-gray-500">
          Codes are case-insensitive and may have usage limits
        </div>
      </motion.div>
    </div>
  );
}