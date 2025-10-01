import { useReadContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { FaucetTokenABI, FAUCET_TOKEN_ADDRESS } from '../contracts/FaucetTokenABI';

// Note: For write operations, use useWriteContract directly in components
// This is just a reference - the actual implementation should be in the component
// following the pattern from Counter.tsx example

// Check if address has claimed
export function useHasClaimed(address?: string) {
  return useReadContract({
    address: FAUCET_TOKEN_ADDRESS as `0x${string}`,
    abi: FaucetTokenABI,
    functionName: 'hasAddressClaimed',
    args: address ? [address] : undefined,
    chainId: sepolia.id,
  });
}

// Get faucet users
export function useFaucetUsers() {
  return useReadContract({
    address: FAUCET_TOKEN_ADDRESS as `0x${string}`,
    abi: FaucetTokenABI,
    functionName: 'getFaucetUsers',
    chainId: sepolia.id,
  });
}

// Get faucet amount per claim
export function useFaucetAmount() {
  return useReadContract({
    address: FAUCET_TOKEN_ADDRESS as `0x${string}`,
    abi: FaucetTokenABI,
    functionName: 'getFaucetAmount',
    chainId: sepolia.id,
  });
}

// Get user token balance
export function useBalance(address?: string) {
  return useReadContract({
    address: FAUCET_TOKEN_ADDRESS as `0x${string}`,
    abi: FaucetTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: sepolia.id,
  });
}
