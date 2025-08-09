import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Download, Gift, X, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface RedeemCode {
  id: string;
  code: string;
  type: 'download' | 'discount' | 'product_unlock';
  value: any;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: string;
  createdAt: string;
}

import { MasterRedeemCodes } from '@/components/master-redeem-codes';

export function RedeemCodeManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'download' as 'download' | 'discount' | 'product_unlock',
    value: '',
    usageLimit: '1',
    expiresAt: '',
    isActive: true,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: redeemCodes = [], isLoading } = useQuery<RedeemCode[]>({
    queryKey: ['/api/admin/redeem-codes'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        value: data.type === 'download' ? { downloadUrl: data.value } :
               data.type === 'discount' ? { discountPercent: parseFloat(data.value) } :
               { productId: data.value },
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : 1,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      };
      
      const response = await apiRequest('POST', '/api/admin/redeem-codes', payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/redeem-codes'] });
      setIsCreating(false);
      resetForm();
      toast({
        title: 'Redeem Code Created',
        description: 'New redeem code has been successfully created.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create redeem code',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/redeem-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/redeem-codes'] });
      toast({
        title: 'Redeem Code Deleted',
        description: 'Redeem code has been successfully removed.',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'download',
      value: '',
      usageLimit: '1',
      expiresAt: '',
      isActive: true,
    });
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code Copied',
      description: 'Redeem code copied to clipboard.',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getValueDisplay = (code: RedeemCode) => {
    switch (code.type) {
      case 'download':
        return `Download: ${code.value?.downloadUrl || 'Not specified'}`;
      case 'discount':
        return `Discount: ${code.value?.discountPercent || 0}%`;
      case 'product_unlock':
        return `Product: ${code.value?.productId || 'Not specified'}`;
      default:
        return 'Unknown type';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'download': return <Download className="h-4 w-4" />;
      case 'discount': return <Gift className="h-4 w-4" />;
      case 'product_unlock': return <Edit className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Master Redeem Codes */}
      <MasterRedeemCodes />

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="holographic rounded-xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-orbitron font-bold text-xl text-white">
                Create New Redeem Code
              </h3>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div className="space-y-2">
                <label className="text-cyber-teal font-semibold">Code</label>
                <div className="flex space-x-2">
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Enter code or generate"
                    className="bg-cyber-blue/50 border-cyber-violet/30 text-white"
                    required
                  />
                  <Button
                    type="button"
                    onClick={generateRandomCode}
                    className="neon-border px-3"
                  >
                    Gen
                  </Button>
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-cyber-teal font-semibold">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-cyber-blue/50 border border-cyber-violet/30 rounded text-white"
                >
                  <option value="download">Download</option>
                  <option value="discount">Discount</option>
                  <option value="product_unlock">Product Unlock</option>
                </select>
              </div>

              {/* Value */}
              <div className="space-y-2">
                <label className="text-cyber-teal font-semibold">
                  {formData.type === 'download' ? 'Download URL' :
                   formData.type === 'discount' ? 'Discount %' : 'Product ID'}
                </label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={
                    formData.type === 'download' ? 'https://example.com/file.zip' :
                    formData.type === 'discount' ? '25' : 'product-id'
                  }
                  className="bg-cyber-blue/50 border-cyber-violet/30 text-white"
                  required
                />
              </div>

              {/* Usage Limit */}
              <div className="space-y-2">
                <label className="text-cyber-teal font-semibold">Usage Limit</label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                  min="1"
                  className="bg-cyber-blue/50 border-cyber-violet/30 text-white"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <label className="text-cyber-teal font-semibold">Expires At (Optional)</label>
                <Input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="bg-cyber-blue/50 border-cyber-violet/30 text-white"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="neon-border rounded-xl px-6 py-2 font-semibold text-cyber-amber hover:bg-cyber-violet/20"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Code'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Codes List */}
      <div className="grid gap-4">
        {redeemCodes.map((code, index) => (
          <motion.div
            key={code.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="holographic rounded-xl p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getTypeIcon(code.type)}
                  <h3 className="font-orbitron font-bold text-lg text-white">
                    {code.code}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    code.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {code.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-2">{getValueDisplay(code)}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Usage: {code.usageCount}/{code.usageLimit || '∞'}</span>
                  {code.expiresAt && (
                    <span>Expires: {new Date(code.expiresAt).toLocaleDateString()}</span>
                  )}
                  <span>Created: {new Date(code.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(code.id)}
                disabled={deleteMutation.isPending}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}

        {redeemCodes.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No redeem codes created yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}