import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { apiService } from '../services/api';
import type { FaucetStatusResponse, FaucetInfoResponse } from '../services/api';

interface UseFaucetReturn {
  // Status data
  faucetStatus: FaucetStatusResponse | null;
  faucetInfo: FaucetInfoResponse | null;
  
  // Loading states
  isLoadingStatus: boolean;
  isLoadingInfo: boolean;
  isClaimingTokens: boolean;
  
  // Error states
  statusError: string | null;
  infoError: string | null;
  claimError: string | null;
  
  // Success states
  claimSuccess: boolean;
  claimTxHash: string | null;
  
  // Actions
  claimTokens: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  refreshInfo: () => Promise<void>;
  clearClaimState: () => void;
}

export function useFaucet(isAuthenticated: boolean): UseFaucetReturn {
  const { address } = useAccount();
  
  // Data states
  const [faucetStatus, setFaucetStatus] = useState<FaucetStatusResponse | null>(null);
  const [faucetInfo, setFaucetInfo] = useState<FaucetInfoResponse | null>(null);
  
  // Loading states
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  
  // Error states
  const [statusError, setStatusError] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  
  // Success states
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!address || !isAuthenticated) {
      setFaucetStatus(null);
      return;
    }

    setIsLoadingStatus(true);
    setStatusError(null);

    try {
      const status = await apiService.getFaucetStatus(address);
      setFaucetStatus(status);
    } catch (err: any) {
      console.error('Error fetching faucet status:', err);
      setStatusError(err.message || 'Failed to fetch faucet status');
      setFaucetStatus(null);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [address, isAuthenticated]);

  const refreshInfo = useCallback(async () => {
    setIsLoadingInfo(true);
    setInfoError(null);

    try {
      const info = await apiService.getFaucetInfo();
      setFaucetInfo(info);
    } catch (err: any) {
      console.error('Error fetching faucet info:', err);
      setInfoError(err.message || 'Failed to fetch faucet info');
      setFaucetInfo(null);
    } finally {
      setIsLoadingInfo(false);
    }
  }, []);

  const claimTokens = useCallback(async () => {
    if (!isAuthenticated || !address) {
      setClaimError('Authentication required');
      return;
    }

    setIsClaimingTokens(true);
    setClaimError(null);
    setClaimSuccess(false);
    setClaimTxHash(null);

    try {
      const result = await apiService.claimTokens();
      setClaimSuccess(true);
      setClaimTxHash(result.txHash);
      
      // Refresh status after successful claim
      setTimeout(() => {
        refreshStatus();
      }, 2000); // Wait a bit for blockchain to update
      
    } catch (err: any) {
      console.error('Error claiming tokens:', err);
      setClaimError(err.message || 'Failed to claim tokens');
    } finally {
      setIsClaimingTokens(false);
    }
  }, [isAuthenticated, address, refreshStatus]);

  const clearClaimState = useCallback(() => {
    setClaimError(null);
    setClaimSuccess(false);
    setClaimTxHash(null);
  }, []);

  // Auto-fetch data when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshStatus();
    } else {
      setFaucetStatus(null);
      setStatusError(null);
    }
  }, [isAuthenticated, refreshStatus]);

  // Auto-fetch general info on mount
  useEffect(() => {
    refreshInfo();
  }, [refreshInfo]);

  return {
    faucetStatus,
    faucetInfo,
    isLoadingStatus,
    isLoadingInfo,
    isClaimingTokens,
    statusError,
    infoError,
    claimError,
    claimSuccess,
    claimTxHash,
    claimTokens,
    refreshStatus,
    refreshInfo,
    clearClaimState,
  };
}
