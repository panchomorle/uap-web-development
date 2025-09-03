# Dockerfile optimizado para una aplicación Next.js
# Etapa 1: Build
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias y lockfile
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Instalar dependencias solo para producción/build
RUN npm install --frozen-lockfile --production=false

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine AS runner

# Establecer directorio de trabajo
WORKDIR /app

# Copiar solo los archivos necesarios desde la etapa de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Variables de entorno recomendadas para Next.js
ENV NODE_ENV=production
# Puedes agregar aquí tus variables de entorno personalizadas, por ejemplo:
# ENV NEXT_PUBLIC_API_URL=https://api.example.com

# Exponer el puerto por defecto de Next.js
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
