# Faucet DApp Development Scripts

# Backend scripts
backend-dev:
	cd backend && npm run dev

backend-build:
	cd backend && npm run build

backend-start:
	cd backend && npm start

# Frontend scripts  
frontend-dev:
	npm run dev

frontend-build:
	npm run build

# Development setup
setup:
	npm install
	cd backend && npm install
	@echo "Setup complete! Don't forget to:"
	@echo "1. Copy .env.example to .env (both frontend and backend)"
	@echo "2. Fill in your environment variables"
	@echo "3. Run 'make dev' to start both frontend and backend"

# Start both frontend and backend in development
dev:
	@echo "Starting both frontend and backend..."
	@echo "Frontend will be at http://localhost:5173"
	@echo "Backend will be at http://localhost:3001"
	cd backend && npm run dev &
	npm run dev

# Clean node_modules
clean:
	rm -rf node_modules
	rm -rf backend/node_modules

.PHONY: backend-dev backend-build backend-start frontend-dev frontend-build setup dev clean
