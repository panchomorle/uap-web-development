import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAuth } from "../hooks/useAuth";
import { useFaucet } from "../hooks/useFaucet";

function shortenAddress(address: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

function formatTokens(value: string | undefined) {
  if (!value) return "0";
  const num = parseFloat(value);
  return num.toLocaleString();
}

export function Faucet() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // Authentication
  const { isAuthenticated, isLoading: isAuthLoading, error: authError, signIn, signOut } = useAuth();

  // Faucet operations
  const {
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
    clearClaimState,
  } = useFaucet(isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear claim state when component mounts
  useEffect(() => {
    clearClaimState();
  }, [clearClaimState]);

  // Auto sign-out when wallet disconnects
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      signOut();
    }
  }, [isConnected, isAuthenticated, signOut]);

  if (!mounted) return null;

  // Not connected to wallet
  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>🚰 Faucet Token DApp</h2>
        <p>Connect your wallet to claim free tokens on Sepolia testnet!</p>
        <button
          onClick={() => open()}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Connected but not authenticated
  if (isConnected && !isAuthenticated) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h2>🚰 Faucet Token DApp</h2>
        
        {/* Wallet Info */}
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "15px", 
          borderRadius: "8px", 
          marginBottom: "20px" 
        }}>
          <p><strong>Connected:</strong> {shortenAddress(address || '')}</p>
          <button
            onClick={() => disconnect()}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px"
            }}
          >
            Disconnect
          </button>
        </div>

        {/* Authentication Section */}
        <div style={{ 
          backgroundColor: "#fff3cd", 
          padding: "20px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          textAlign: "center"
        }}>
          <h3>🔐 Authentication Required</h3>
          <p>Please sign a message to authenticate with the faucet:</p>
          
          <button
            onClick={signIn}
            disabled={isAuthLoading}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: isAuthLoading ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isAuthLoading ? "not-allowed" : "pointer",
              marginTop: "10px"
            }}
          >
            {isAuthLoading ? "Signing..." : "🔐 Sign In with Ethereum"}
          </button>

          {authError && (
            <div style={{ 
              backgroundColor: "#f8d7da", 
              color: "#721c24",
              padding: "10px", 
              borderRadius: "5px", 
              marginTop: "15px" 
            }}>
              <p><strong>Authentication Error:</strong> {authError}</p>
            </div>
          )}
        </div>

        {/* General Faucet Info (Public) */}
        {faucetInfo && (
          <div style={{ 
            backgroundColor: "#e9ecef", 
            padding: "20px", 
            borderRadius: "8px", 
            marginBottom: "20px" 
          }}>
            <h3>📊 Faucet Information</h3>
            <p><strong>Amount per Claim:</strong> {formatTokens(faucetInfo.faucetAmount)} tokens</p>
            <p><strong>Total Users:</strong> {faucetInfo.totalUsers}</p>
            {faucetInfo.recentUsers.length > 0 && (
              <div>
                <p><strong>Recent Claims:</strong></p>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {faucetInfo.recentUsers.slice(0, 5).map((user, index) => (
                    <div key={index}>{shortenAddress(user)}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isLoadingInfo && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Loading faucet information...</p>
          </div>
        )}

        {infoError && (
          <div style={{ 
            backgroundColor: "#f8d7da", 
            color: "#721c24",
            padding: "15px", 
            borderRadius: "8px", 
            marginBottom: "20px" 
          }}>
            <p><strong>Error:</strong> {infoError}</p>
          </div>
        )}
      </div>
    );
  }

  // Authenticated - show full faucet interface
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>🚰 Faucet Token DApp</h2>
      
      {/* Wallet Info */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "15px", 
        borderRadius: "8px", 
        marginBottom: "20px" 
      }}>
        <p><strong>Connected:</strong> {shortenAddress(address || '')}</p>
        <p><strong>Status:</strong> ✅ Authenticated</p>
        <button
          onClick={() => {
            signOut();
            disconnect();
          }}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Disconnect & Sign Out
        </button>
      </div>

      {/* Token Info */}
      {isLoadingStatus ? (
        <div style={{ 
          backgroundColor: "#e9ecef", 
          padding: "20px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          textAlign: "center"
        }}>
          <p>Loading your faucet status...</p>
        </div>
      ) : faucetStatus ? (
        <div style={{ 
          backgroundColor: "#e9ecef", 
          padding: "20px", 
          borderRadius: "8px", 
          marginBottom: "20px" 
        }}>
          <h3>📊 Your Token Information</h3>
          <p><strong>Faucet Amount per Claim:</strong> {formatTokens(faucetStatus.faucetAmount)} tokens</p>
          <p><strong>Your Token Balance:</strong> {formatTokens(faucetStatus.balance)} tokens</p>
          <p><strong>Already Claimed:</strong> {faucetStatus.hasClaimed ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Total Faucet Users:</strong> {faucetStatus.totalUsers}</p>
        </div>
      ) : statusError ? (
        <div style={{ 
          backgroundColor: "#f8d7da", 
          color: "#721c24",
          padding: "15px", 
          borderRadius: "8px", 
          marginBottom: "20px" 
        }}>
          <p><strong>Error loading status:</strong> {statusError}</p>
        </div>
      ) : null}

      {/* Claim Button */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <button
          onClick={claimTokens}
          disabled={isClaimingTokens || faucetStatus?.hasClaimed || !faucetStatus}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            backgroundColor: 
              faucetStatus?.hasClaimed ? "#6c757d" : 
              isClaimingTokens ? "#6c757d" : 
              "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: 
              isClaimingTokens || faucetStatus?.hasClaimed || !faucetStatus 
                ? "not-allowed" 
                : "pointer",
            opacity: 
              isClaimingTokens || faucetStatus?.hasClaimed || !faucetStatus 
                ? 0.6 
                : 1,
          }}
        >
          {isClaimingTokens
            ? "Claiming Tokens..."
            : faucetStatus?.hasClaimed
            ? "Already Claimed"
            : !faucetStatus
            ? "Loading..."
            : "🎁 Claim Free Tokens"}
        </button>
      </div>

      {/* Claim Success */}
      {claimSuccess && claimTxHash && (
        <div style={{ 
          backgroundColor: "#d1ecf1", 
          padding: "15px", 
          borderRadius: "8px", 
          marginBottom: "20px" 
        }}>
          <p style={{ color: "green", fontWeight: "bold" }}>✅ Tokens claimed successfully!</p>
          <p><strong>Transaction Hash:</strong> {claimTxHash}</p>
          <p><em>Your balance will update shortly...</em></p>
        </div>
      )}

      {/* Claim Error */}
      {claimError && (
        <div style={{ 
          backgroundColor: "#f8d7da", 
          color: "#721c24",
          padding: "15px", 
          borderRadius: "8px", 
          marginBottom: "20px" 
        }}>
          <p><strong>Claim Error:</strong> {claimError}</p>
          <button
            onClick={clearClaimState}
            style={{
              padding: "5px 10px",
              fontSize: "12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              marginTop: "5px"
            }}
          >
            Clear Error
          </button>
        </div>
      )}

      {/* Users List */}
      {faucetStatus && faucetStatus.users.length > 0 && (
        <div style={{ 
          backgroundColor: "#fff3cd", 
          padding: "20px", 
          borderRadius: "8px" 
        }}>
          <h3>👥 Recent Addresses that claimed tokens ({faucetStatus.totalUsers} total)</h3>
          <div style={{ 
            maxHeight: "200px", 
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "10px"
          }}>
            {faucetStatus.users.map((user, index) => (
              <div key={index} style={{ 
                padding: "5px 0", 
                borderBottom: index < faucetStatus.users.length - 1 ? "1px solid #eee" : "none"
              }}>
                {user}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
