import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, LogOut, Plus, Edit, Trash2, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/use-admin';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PromotionManager } from '@/components/promotion-manager';
import { ProductManager } from '@/components/product-manager';
import { RedeemCodeManager } from '@/components/redeem-code-manager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [, setLocation] = useLocation();
  const { admin, logout, isLoggedIn } = useAdmin();

  // Redirect if not logged in
  if (!isLoggedIn) {
    setLocation('/admin/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'promotions', label: 'Promotions', icon: DollarSign },
    { id: 'products', label: 'Products', icon: Users },
    { id: 'redeem-codes', label: 'Redeem Codes', icon: Shield },
  ];

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isLoggedIn,
  });

  const displayStats = [
    { label: 'Total Products', value: (stats as any)?.totalProducts?.toString() || '0', change: '+12%', color: 'text-cyber-amber' },
    { label: 'In Stock', value: (stats as any)?.inStockProducts?.toString() || '0', change: '+8%', color: 'text-cyber-teal' },
    { label: 'Active Promotions', value: (stats as any)?.activePromotions?.toString() || '0', change: '+15%', color: 'text-cyber-violet' },
    { label: 'Total Promotions', value: (stats as any)?.totalPromotions?.toString() || '0', change: '+2', color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-cyber-black via-cyber-blue/5 to-cyber-violet/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyber-violet/20 rounded-full flex items-center justify-center">
              <Shield className="text-cyber-violet h-6 w-6" />
            </div>
            <div>
              <h1 className="font-orbitron font-bold text-3xl text-white">
                Admin Control Center
              </h1>
              <p className="text-gray-400">
                Welcome back, {admin?.username}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all duration-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="flex space-x-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl border transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-cyber-violet bg-cyber-violet/20 text-cyber-violet'
                    : 'border-cyber-teal/30 text-cyber-teal hover:bg-cyber-teal/20'
                }`}
                variant="outline"
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="holographic rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                      <span className="text-green-400 text-sm font-semibold">
                        {stat.change}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="holographic rounded-xl p-6">
                <h3 className="font-orbitron font-bold text-xl text-white mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab('promotions')}
                    className="neon-border rounded-xl p-4 h-auto flex flex-col items-center space-y-2 text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Create Promotion</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('products')}
                    className="neon-border rounded-xl p-4 h-auto flex flex-col items-center space-y-2 text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300"
                  >
                    <Edit className="h-6 w-6" />
                    <span>Manage Products</span>
                  </Button>
                  <Button
                    className="neon-border rounded-xl p-4 h-auto flex flex-col items-center space-y-2 text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300"
                  >
                    <Calendar className="h-6 w-6" />
                    <span>View Analytics</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'promotions' && <PromotionManager />}

          {activeTab === 'products' && <ProductManager />}

          {activeTab === 'redeem-codes' && <RedeemCodeManager />}
        </motion.div>
      </div>
    </div>
  );
}