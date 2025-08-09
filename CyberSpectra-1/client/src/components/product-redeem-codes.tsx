import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Gift, Download, Tag, Unlock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface RedeemCode {
  id: string;
  code: string;
  type: string;
  value: any;
  productId: string | null;
  isMasterCode: boolean;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

interface ProductRedeemCodesProps {
  productId: string;
  productName: string;
}

export function ProductRedeemCodes({ productId, productName }: ProductRedeemCodesProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'download',
    value: { downloadUrl: '', fileName: '' },
    usageLimit: 1,
    expiresAt: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: codes = [], isLoading } = useQuery<RedeemCode[]>({
    queryKey: ['/api/admin/redeem-codes/product', productId],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/redeem-codes', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/redeem-codes/product', productId] });
      setIsCreating(false);
      resetForm();
      toast({
        title: 'Redeem Code Created',
        description: 'Product-specific redeem code has been created successfully.',
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/redeem-codes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/redeem-codes/product', productId] });
      setEditingId(null);
      resetForm();
      toast({
        title: 'Code Updated',
        description: 'Redeem code has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update redeem code',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/redeem-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/redeem-codes/product', productId] });
      toast({
        title: 'Code Deleted',
        description: 'Redeem code has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete redeem code',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'download',
      value: { downloadUrl: '', fileName: '' },
      usageLimit: 1,
      expiresAt: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      productId,
      isMasterCode: false,
      value: getValueForType(formData.type, formData.value),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getValueForType = (type: string, value: any) => {
    return { downloadUrl: value.downloadUrl || '', fileName: value.fileName || '' };
  };

  const startEditing = (code: RedeemCode) => {
    setEditingId(code.id);
    setFormData({
      code: code.code,
      type: code.type,
      value: code.value,
      usageLimit: code.usageLimit || 1,
      expiresAt: code.expiresAt ? new Date(code.expiresAt).toISOString().slice(0, 16) : '',
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const getTypeIcon = (type: string) => {
    return <Download className="h-4 w-4 text-cyber-amber" />;
  };

  const getTypeDescription = (type: string, value: any) => {
    return `Download: ${value?.fileName || 'File'}`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-lg text-white">
          Redeem Codes for {productName}
        </h4>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          className="neon-border rounded-lg px-4 py-2 text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300"
        >
          <Plus className="mr-2 h-3 w-3" />
          Add Code
        </Button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            className="holographic rounded-lg p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-semibold text-white">
                  {editingId ? 'Edit Redeem Code' : 'Create New Redeem Code'}
                </h5>
                <Button
                  type="button"
                  onClick={cancelEdit}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SAVE20"
                    className="bg-cyber-blue/50 border-cyber-violet/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Download URL
                  </label>
                  <Input
                    value={formData.value.downloadUrl}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      value: { ...formData.value, downloadUrl: e.target.value }
                    })}
                    placeholder="https://example.com/file.zip"
                    className="bg-cyber-blue/50 border-cyber-violet/30"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    File Name
                  </label>
                  <Input
                    value={formData.value.fileName}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      value: { ...formData.value, fileName: e.target.value }
                    })}
                    placeholder="Premium Content.zip"
                    className="bg-cyber-blue/50 border-cyber-violet/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Usage Limit
                  </label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                    min="1"
                    className="bg-cyber-blue/50 border-cyber-violet/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expires At (Optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="bg-cyber-blue/50 border-cyber-violet/30"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={cancelEdit}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="neon-border rounded-lg px-6 py-2 font-semibold text-cyber-amber hover:bg-cyber-violet/20 transition-all duration-300"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : editingId ? 'Update Code' : 'Create Code'
                  }
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {codes.map((code) => (
          <motion.div
            key={code.id}
            className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3">
              {getTypeIcon(code.type)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-cyber-amber font-semibold">
                    {code.code}
                  </span>
                  {!code.isActive && (
                    <span className="text-xs text-red-400 bg-red-400/20 px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {getTypeDescription(code.type, code.value)} • 
                  Used {code.usageCount}/{code.usageLimit || '∞'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => startEditing(code)}
                size="sm"
                variant="ghost"
                className="text-cyber-teal hover:bg-cyber-teal/20"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(code.id)}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:bg-red-400/20"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        ))}

        {codes.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            No redeem codes created for this product yet.
          </div>
        )}
      </div>
    </div>
  );
}