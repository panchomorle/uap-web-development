interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface AuthResponse {
  token: string;
  address: string;
  message?: string;
}

interface MessageResponse {
  message: string;
  nonce: string;
}

interface ClaimResponse {
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  address: string;
  message: string;
}

interface FaucetStatusResponse {
  address: string;
  hasClaimed: boolean;
  balance: string;
  faucetAmount: string;
  totalUsers: number;
  users: string[];
}

interface FaucetInfoResponse {
  faucetAmount: string;
  totalUsers: number;
  recentUsers: string[];
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getAuthHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      throw new Error(error.message || 'Network error');
    }
  }

  // Auth endpoints
  async getMessage(address: string): Promise<MessageResponse> {
    const response = await this.makeRequest<MessageResponse>('/auth/message', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get sign-in message');
    }

    return response.data;
  }

  async signIn(message: string, signature: string, address: string): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ message, signature, address }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Authentication failed');
    }

    // Store token automatically
    this.setToken(response.data.token);

    return response.data;
  }

  // Faucet endpoints
  async claimTokens(): Promise<ClaimResponse> {
    const response = await this.makeRequest<ClaimResponse>('/faucet/claim', {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to claim tokens');
    }

    return response.data;
  }

  async getFaucetStatus(address: string): Promise<FaucetStatusResponse> {
    const response = await this.makeRequest<FaucetStatusResponse>(`/faucet/status/${address}`);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get faucet status');
    }

    return response.data;
  }

  async getFaucetInfo(): Promise<FaucetInfoResponse> {
    const response = await this.makeRequest<FaucetInfoResponse>('/faucet/info');

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get faucet info');
    }

    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ message: string; timestamp: string; environment: string }> {
    const response = await this.makeRequest<{ message: string; timestamp: string; environment: string }>('/health');

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Health check failed');
    }

    return response.data;
  }
}

export const apiService = new ApiService();
export type { 
  ApiResponse, 
  AuthResponse, 
  MessageResponse, 
  ClaimResponse, 
  FaucetStatusResponse, 
  FaucetInfoResponse 
};
