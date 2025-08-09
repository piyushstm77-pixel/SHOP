import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Package, X, Check, Star, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ProductRedeemCodes } from '@/components/product-redeem-codes';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  images: string[];
  videoUrl: string | null;
  category: string;
  rating: string;
  inStock: boolean;
  specifications?: Record<string, string> | null;
  createdAt: string;
}

export function ProductManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    images: [''],
    videoUrl: '',
    category: '',
    rating: '',
    inStock: true,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/admin/products'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/products', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      setIsCreating(false);
      resetForm();
      toast({
        title: 'Product Created',
        description: 'New product has been successfully created.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      setEditingId(null);
      resetForm();
      toast({
        title: 'Product Updated',
        description: 'Product has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({
        title: 'Product Deleted',
        description: 'Product has been successfully removed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      images: [''],
      videoUrl: '',
      category: '',
      rating: '',
      inStock: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty image URLs
    const filteredImages = formData.images.filter(url => url.trim() !== '');
    
    const data = {
      ...formData,
      images: filteredImages,
      videoUrl: formData.videoUrl.trim() || null,
      price: formData.price,
      rating: formData.rating || "0.0",
      inStock: formData.inStock,
      specifications: null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      images: product.images?.length > 0 ? product.images : [''],
      videoUrl: product.videoUrl || '',
      category: product.category,
      rating: product.rating,
      inStock: product.inStock,
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, '']
    });
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        images: newImages
      });
    }
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({
      ...formData,
      images: newImages
    });
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
          Product Management
        </h3>
        <Button
          onClick={() => setIsCreating(true)}
          className="neon-border rounded-xl px-6 py-3 font-semibold text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300 animate-glow"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Create Form */}
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
                Add New Product
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
                  Product Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-cyber-blue/50 border border-cyber-violet/30 rounded-lg px-4 py-3 text-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="gadgets">Gadgets</option>
                  <option value="wearables">Wearables</option>
                  <option value="interfaces">Interfaces</option>
                </select>
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
                  Price (₿)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating (0-5)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  placeholder="4.5"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Main Image URL
                </label>
                <Input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Additional Images
                  </label>
                  <Button
                    type="button"
                    onClick={addImageField}
                    variant="outline"
                    size="sm"
                    className="text-cyber-teal border-cyber-teal hover:bg-cyber-teal/20"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Image
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        className="bg-cyber-blue/50 border-cyber-violet/30 flex-1"
                        placeholder="https://example.com/additional-image.jpg"
                      />
                      {formData.images.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeImageField(index)}
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video URL (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="bg-cyber-blue/50 border-cyber-violet/30"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports YouTube, Vimeo, or direct video links
                </p>
              </div>

              <div className="md:col-span-2 flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 text-cyber-violet bg-cyber-blue/50 border-cyber-violet/30 rounded"
                />
                <label htmlFor="inStock" className="text-sm font-medium text-gray-300">
                  In Stock
                </label>
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-cyber-violet text-white px-6 py-3 rounded-xl hover:bg-cyber-violet/80 transition-colors duration-300"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {editingId ? 'Update Product' : 'Create Product'}
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

      {/* Products List */}
      <div className="holographic rounded-xl p-6">
        <h4 className="font-semibold text-lg text-white mb-4">
          Products ({products.length})
        </h4>
        
        {products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="bg-cyber-blue/20 rounded-xl p-4 border border-cyber-violet/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="aspect-square bg-gray-800 rounded-lg mb-4 overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h5 className="font-semibold text-white text-sm">{product.name}</h5>
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-xs line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-cyber-amber font-bold">₿{product.price}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-cyber-amber fill-current" />
                      <span className="text-xs text-gray-400">{product.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500 capitalize">{product.category}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => startEditing(product)}
                        size="sm"
                        variant="ghost"
                        className="text-cyber-teal hover:bg-cyber-teal/20 text-xs px-2 py-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteMutation.mutate(product.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-400/20 text-xs px-2 py-1"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                    
                    <Button
                      onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                      size="sm"
                      variant="ghost"
                      className="text-cyber-violet hover:bg-cyber-violet/20 text-xs px-2 py-1"
                    >
                      <Gift className="h-3 w-3 mr-1" />
                      Codes
                      {expandedProduct === product.id ? 
                        <ChevronUp className="h-3 w-3 ml-1" /> : 
                        <ChevronDown className="h-3 w-3 ml-1" />
                      }
                    </Button>
                  </div>

                  {/* Expanded Redeem Codes Section */}
                  <AnimatePresence>
                    {expandedProduct === product.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                      >
                        <ProductRedeemCodes productId={product.id} productName={product.name} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}