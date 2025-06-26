import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../constants/constants';
import { useToast } from './useToast';
import { useRouter } from '@tanstack/react-router';

interface User {
  id: string;
  email: string;
}

interface AuthResponse {
  isAuthenticated: boolean;
  user: User | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const checkAuthStatus = async (): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/auth/check-status`, {
      credentials: 'include', // Incluye las cookies en la request
    });
    
    if (!response.ok) {
      throw new Error('Failed to check auth status');
    }
    
    return response.json();
};

const login = async (credentials: LoginCredentials): Promise<User> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
};

const logout = async (): Promise<void> => {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
};

const register = async (credentials: LoginCredentials): Promise<User> => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
}

const queryKey = ['auth'];

export const useAuth = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const router = useRouter();

    const { data, isLoading, isError, error } = useQuery<AuthResponse>({
        queryKey,
        queryFn: checkAuthStatus,
        staleTime: 1000 * 60 * 5, // 5 minutos - tiempo que considera los datos como "frescos"
        gcTime: 1000 * 60 * 30, // 30 minutos - tiempo que mantiene en cache después de no usarse
        retry: false, // No reintentar en errores de autenticación
        retryOnMount: false, // No reintentar al montar el componente
        refetchOnWindowFocus: false, // No refetch al enfocar la ventana
        refetchOnMount: false, // No refetch al montar el componente
        refetchOnReconnect: false, // No refetch al reconectar
        refetchInterval: false, // Desactivar refetch automático por intervalo
        // Solo refetch si los datos están marcados como stale y se necesitan
        refetchIntervalInBackground: false,
    });

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (user) => {
            queryClient.setQueryData(queryKey, { isAuthenticated: true, user });
            router.navigate({ to: '/' })
        },
        onError: (error) => {
            toast.error("Login failed: " + (error instanceof Error ? error.message : 'Unknown error'));
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.setQueryData(queryKey, { isAuthenticated: false, user: null });
            router.navigate({ to: "/login" })
        },
        onError: (error) => {
            toast.error("Logout failed: " + (error instanceof Error ? error.message : 'Unknown error'));
        },
    });

    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: () => {
            toast.success('Registration successful');
            router.navigate({ to: "/login" })
        },
        onError: (error) => {
            toast.error("Registration failed: " + (error instanceof Error ? error.message : 'Unknown error'));
        },
    });

    return {
        user: data?.user || null,
        isAuthenticated: data?.isAuthenticated || false,
        isLoading,
        isError,
        error,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        register: registerMutation.mutate,
    };
};