import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Calendar, DollarSign, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  code?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  companyName?: string;
  bannerImage?: string;
  videoUrl?: string;
  createdAt: string;
}

export function PromotionManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    code: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    companyName: '',
    bannerImage: '',
    videoUrl: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['/api/admin/promotions'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/promotions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      setIsCreating(false);
      resetForm();
      toast({
        title: 'Promotion Created',
        description: 'New promotion has been successfully created.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/promotions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      setEditingId(null);
      resetForm();
      toast({
        title: 'Promotion Updated',
        description: 'Promotion has been successfully updated.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/promotions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      toast({
        title: 'Promotion Deleted',
        description: 'Promotion has been successfully removed.',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      code: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      companyName: '',
      bannerImage: '',
      videoUrl: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (promotion: Promotion) => {
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      code: promotion.code || '',
      startDate: new Date(promotion.startDate).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate).toISOString().split('T')[0],
      usageLimit: promotion.usageLimit?.toString() || '',
    });
    setEditingId(promotion.id);
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="holographic rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-orbitron font-bold text-2xl text-white">
          Promotion Management
        </h3>
        <Button
          onClick={() => setIsCreating(true)}
          className="neon-border rounded-xl px-6 py-3 font-semibold text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300 animate-glow"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            className="holographic rounded-xl p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-xl text-white">
                {editingId ? 'Edit Promotion' : 'Create New Promotion'}
              </h4>
              <Button
                onClick={cancelEdit}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Promo Code (Optional)
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  placeholder="e.g., CYBER20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full bg-cyber-blue/50 border border-cyber-violet/30 rounded-lg px-4 py-3 text-white"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discount Value
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usage Limit (Optional)
                </label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-cyber-violet text-white px-6 py-3 rounded-xl hover:bg-cyber-violet/80 transition-colors duration-300"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {editingId ? 'Update Promotion' : 'Create Promotion'}
                </Button>
                <Button
                  type="button"
                  onClick={cancelEdit}
                  variant="outline"
                  className="border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promotions List */}
      <div className="holographic rounded-xl p-6">
        <h4 className="font-semibold text-lg text-white mb-4">
          Active Promotions ({promotions.length})
        </h4>
        
        {promotions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No promotions created yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <motion.div
                key={promotion.id}
                className="bg-cyber-blue/20 rounded-xl p-4 border border-cyber-violet/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-semibold text-white">{promotion.title}</h5>
                      {promotion.code && (
                        <span className="px-2 py-1 bg-cyber-amber/20 text-cyber-amber rounded text-sm font-mono">
                          {promotion.code}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        promotion.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {promotion.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{promotion.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>
                        {promotion.discountType === 'percentage' ? `${promotion.discountValue}% off` : `₿${promotion.discountValue} off`}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>
                        Used: {promotion.usageCount}{promotion.usageLimit ? ` / ${promotion.usageLimit}` : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => startEdit(promotion)}
                      variant="ghost"
                      size="icon"
                      className="text-cyber-teal hover:text-white hover:bg-cyber-teal/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteMutation.mutate(promotion.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-white hover:bg-red-500/20"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}