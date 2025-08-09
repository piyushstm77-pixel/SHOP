import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  emailVerified: boolean;
  lastLogin?: string;
}

interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export function useUser(onLoginSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ['/api/user/me'],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await apiRequest('POST', '/api/user/signup', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/me'] });
      toast({
        title: 'Account Created',
        description: `Welcome to NeoMarket, ${data.user.firstName || data.user.email}!`,
      });
      onLoginSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest('POST', '/api/user/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/me'] });
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.user.firstName || data.user.email}!`,
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
      await apiRequest('POST', '/api/user/logout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/me'] });
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    },
  });

  const isLoggedIn = !!user && !isError;

  return {
    user,
    isLoading,
    isLoggedIn,
    signup: signupMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isSigningUp: signupMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}