import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/hooks/use-admin';
import { useLocation } from 'wouter';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  
  const { login, isLoggingIn, isLoggedIn } = useAdmin(() => {
    setLocation('/admin');
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      setLocation('/admin');
    }
  }, [isLoggedIn, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      login({ username, password });
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-cyber-black via-cyber-blue/10 to-cyber-violet/10 flex items-center justify-center">
      <motion.div
        className="holographic rounded-2xl p-8 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-cyber-violet/20 rounded-full flex items-center justify-center"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="text-cyber-violet h-8 w-8" />
          </motion.div>
          <h1 className="font-orbitron font-bold text-3xl text-white mb-2">
            Admin Access
          </h1>
          <p className="text-gray-400">
            Secure neural authentication required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="w-full bg-cyber-blue/50 border-cyber-violet/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyber-violet focus:ring-1 focus:ring-cyber-violet"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter secure password"
                className="w-full bg-cyber-blue/50 border-cyber-violet/30 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-cyber-violet focus:ring-1 focus:ring-cyber-violet"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isLoggingIn || !username || !password}
            className="w-full neon-border rounded-xl py-4 font-orbitron font-bold text-lg text-cyber-teal hover:bg-cyber-violet/20 transition-all duration-300 animate-glow"
          >
            <Lock className="mr-2 h-5 w-5" />
            {isLoggingIn ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Default credentials: admin / admin123</p>
        </div>
      </motion.div>
    </div>
  );
}