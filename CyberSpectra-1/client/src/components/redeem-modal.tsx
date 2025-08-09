import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
}

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

interface RedeemResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  fileName?: string;
  codeType?: 'product' | 'master';
}

export function RedeemModal({ isOpen, onClose, product }: RedeemModalProps) {
  const [redeemCode, setRedeemCode] = useState('');
  const [redemptionResult, setRedemptionResult] = useState<RedeemResponse | null>(null);
  const { toast } = useToast();

  const redeemMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/redeem', {
        code: code.toUpperCase(),
        productId: product.id
      });
      return response.json();
    },
    onSuccess: (data: RedeemResponse) => {
      setRedemptionResult(data);
      if (data.success) {
        toast({
          title: 'Code Redeemed Successfully!',
          description: `${data.codeType === 'master' ? 'Master' : 'Product'} code redeemed for ${product.name}`,
        });
      } else {
        toast({
          title: 'Redemption Failed',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Redemption Error',
        description: 'Failed to process redeem code. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a redeem code',
        variant: 'destructive',
      });
      return;
    }
    redeemMutation.mutate(redeemCode.trim());
  };

  const handleDownload = () => {
    if (redemptionResult?.downloadUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = redemptionResult.downloadUrl;
      link.download = redemptionResult.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download Started',
        description: `Downloading ${redemptionResult.fileName || 'file'}...`,
      });
    }
  };

  const resetModal = () => {
    setRedeemCode('');
    setRedemptionResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-md bg-cyber-blue/95 border-2 border-cyber-violet/50 text-white">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl text-cyber-amber flex items-center">
            <Gift className="mr-2 h-5 w-5" />
            Redeem Code - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-cyber-violet/30">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-white">{product.name}</h3>
              <p className="text-sm text-gray-400 capitalize">{product.category}</p>
              <p className="text-cyber-amber font-bold">₿{product.price}</p>
            </div>
          </div>

          {!redemptionResult ? (
            /* Redeem Code Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter Redeem Code
                </label>
                <Input
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="e.g., PRODUCT123 or MASTER2024"
                  className="bg-cyber-blue/50 border-cyber-violet/30 text-white placeholder-gray-400"
                  disabled={redeemMutation.isPending}
                />
                <p className="text-xs text-gray-400 mt-1">
                  You can use either a product-specific code or a master code
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={resetModal}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={redeemMutation.isPending || !redeemCode.trim()}
                  className="flex-1 neon-border rounded-lg bg-cyber-violet/20 text-cyber-amber hover:bg-cyber-violet/30 transition-all duration-300"
                >
                  {redeemMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-amber mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Redeem Code'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* Redemption Result */
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {redemptionResult.success ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle className="h-16 w-16 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-400 mb-2">
                        Code Redeemed Successfully!
                      </h3>
                      <p className="text-gray-300 mb-1">
                        {redemptionResult.codeType === 'master' ? 'Master Code' : 'Product Code'} accepted
                      </p>
                      <p className="text-sm text-gray-400">
                        Code: <span className="font-mono text-cyber-amber">{redeemCode}</span>
                      </p>
                    </div>
                    
                    {redemptionResult.downloadUrl && (
                      <div className="space-y-3">
                        <div className="p-4 bg-cyber-violet/20 rounded-lg border border-cyber-violet/50">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <Download className="h-5 w-5 text-cyber-amber" />
                            <span className="font-semibold text-white">
                              {redemptionResult.fileName || 'Download Ready'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 text-center">
                            Your download is ready. Click below to start the download.
                          </p>
                        </div>
                        
                        <Button
                          onClick={handleDownload}
                          className="w-full neon-border rounded-lg bg-cyber-amber/20 text-cyber-amber hover:bg-cyber-amber/30 transition-all duration-300 animate-glow"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Now
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      onClick={resetModal}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Close
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <AlertCircle className="h-16 w-16 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-400 mb-2">
                        Redemption Failed
                      </h3>
                      <p className="text-gray-300 mb-1">{redemptionResult.message}</p>
                      <p className="text-sm text-gray-400">
                        Code: <span className="font-mono text-red-300">{redeemCode}</span>
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => setRedemptionResult(null)}
                        className="flex-1 neon-border rounded-lg bg-cyber-violet/20 text-cyber-amber hover:bg-cyber-violet/30"
                      >
                        Try Again
                      </Button>
                      <Button
                        onClick={resetModal}
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}