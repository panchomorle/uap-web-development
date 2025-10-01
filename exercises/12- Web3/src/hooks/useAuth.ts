import { useState, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { apiService } from '../services/api';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  token: string | null;
}

export function useAuth(): UseAuthReturn {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('auth_token')
  );

  const isAuthenticated = Boolean(token && isConnected && address);

  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get SIWE message from backend
      console.log('Getting SIWE message for address:', address);
      const { message } = await apiService.getMessage(address);

      // Step 2: Sign the message with user's wallet
      console.log('Signing message with wallet...');
      const signature = await signMessageAsync({ message });

      // Step 3: Send signature to backend for verification
      console.log('Verifying signature with backend...');
      const authResponse = await apiService.signIn(message, signature, address);

      setToken(authResponse.token);
      console.log('Authentication successful!');

    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
      setToken(null);
      apiService.clearToken();
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, signMessageAsync]);

  const signOut = useCallback(() => {
    setToken(null);
    setError(null);
    apiService.clearToken();
    console.log('Signed out successfully');
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    token,
  };
}
