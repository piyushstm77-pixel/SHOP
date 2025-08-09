import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin?: string;
}

export function useAdmin(onLoginSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: admin, isLoading, isError } = useQuery<Admin>({
    queryKey: ['/api/admin/me'],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/admin/login', { username, password });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/me'] });
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.admin.username}!`,
      });
      onLoginSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/admin/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    },
  });

  const isLoggedIn = !!admin && !isError;

  return {
    admin,
    isLoading,
    isLoggedIn,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}