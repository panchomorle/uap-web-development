import { ethers } from 'ethers';
import { config } from '../config/index.js';
import { FaucetTokenABI } from './abi.js';

let provider: ethers.JsonRpcProvider;
let signer: ethers.Wallet;
let faucetContract: ethers.Contract;

export function initializeBlockchain() {
  try {
    // Initialize provider
    provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    // Initialize signer
    signer = new ethers.Wallet(config.privateKey, provider);
    
    // Initialize contract
    faucetContract = new ethers.Contract(
      config.contractAddress,
      FaucetTokenABI,
      signer
    );
    
    console.log('✅ Blockchain initialized successfully');
    console.log('📍 Contract Address:', config.contractAddress);
    console.log('🔗 RPC URL:', config.rpcUrl);
    console.log('👤 Signer Address:', signer.address);
    
  } catch (error) {
    console.error('❌ Failed to initialize blockchain:', error);
    throw error;
  }
}

export function getProvider() {
  if (!provider) {
    throw new Error('Blockchain not initialized. Call initializeBlockchain() first.');
  }
  return provider;
}

export function getSigner() {
  if (!signer) {
    throw new Error('Blockchain not initialized. Call initializeBlockchain() first.');
  }
  return signer;
}

export function getFaucetContract() {
  if (!faucetContract) {
    throw new Error('Blockchain not initialized. Call initializeBlockchain() first.');
  }
  return faucetContract;
}

// Contract interaction functions
export async function claimTokensForAddress(address: string) {
  try {
    const contract = getFaucetContract();
    
    // Call claimTokens function
    const tx = await contract.claimTokens({ from: address });
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error: any) {
    console.error('Error claiming tokens:', error);
    throw new Error(`Failed to claim tokens: ${error.message}`);
  }
}

export async function checkAddressClaimed(address: string): Promise<boolean> {
  try {
    const contract = getFaucetContract();
    const hasClaimed = await contract.hasAddressClaimed(address);
    return hasClaimed;
  } catch (error: any) {
    console.error('Error checking claim status:', error);
    throw new Error(`Failed to check claim status: ${error.message}`);
  }
}

export async function getAddressBalance(address: string): Promise<string> {
  try {
    const contract = getFaucetContract();
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, 18);
  } catch (error: any) {
    console.error('Error getting balance:', error);
    throw new Error(`Failed to get balance: ${error.message}`);
  }
}

export async function getFaucetUsers(): Promise<string[]> {
  try {
    const contract = getFaucetContract();
    const users = await contract.getFaucetUsers();
    return users;
  } catch (error: any) {
    console.error('Error getting faucet users:', error);
    throw new Error(`Failed to get faucet users: ${error.message}`);
  }
}

export async function getFaucetAmount(): Promise<string> {
  try {
    const contract = getFaucetContract();
    const amount = await contract.getFaucetAmount();
    return ethers.formatUnits(amount, 18);
  } catch (error: any) {
    console.error('Error getting faucet amount:', error);
    throw new Error(`Failed to get faucet amount: ${error.message}`);
  }
}
