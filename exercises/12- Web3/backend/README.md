# Faucet DApp - Backend Development

## Quick Start

1. Copy environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your values:
- `PRIVATE_KEY`: Your Ethereum private key (for contract interactions)
- `JWT_SECRET`: A long, random string for JWT signing
- `RPC_URL`: Ethereum RPC endpoint (default: Sepolia)
- `CONTRACT_ADDRESS`: Faucet contract address

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

The backend will be available at http://localhost:3001

## API Endpoints

### Authentication
- `POST /auth/message` - Get SIWE message to sign
- `POST /auth/signin` - Verify signature and get JWT token

### Faucet (Protected)
- `POST /faucet/claim` - Claim tokens
- `GET /faucet/status/:address` - Get faucet status for address

### Public
- `GET /faucet/info` - Get general faucet information
- `GET /health` - Health check

## Environment Variables

### Required
- `PRIVATE_KEY` - Private key for contract interactions
- `JWT_SECRET` - Secret for JWT token signing

### Optional
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (default: development)
- `RPC_URL` - Ethereum RPC URL
- `CONTRACT_ADDRESS` - Faucet contract address
- `JWT_EXPIRES_IN` - JWT token expiration (default: 24h)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a secure JWT secret
3. Configure proper CORS origins
4. Use environment variables for all secrets
5. Consider using a process manager like PM2

## Security Notes

- Private keys should NEVER be committed to version control
- Use strong, random JWT secrets
- Configure CORS properly for production
- Rate limiting is enabled by default
- All authentication endpoints use SIWE for security
