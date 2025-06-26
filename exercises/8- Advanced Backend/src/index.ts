import express from 'express';
import cors from 'cors';
import { boardRoutes } from './routes/board.route';
import { taskRoutes } from './routes/task.route';
import { authRoutes } from './routes/auth.route';
import cookieParser from 'cookie-parser';
import { permissionRoutes } from './routes/permission.route';
import { database } from './db/connection';

const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, // URL del frontend
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
}));

app.use(express.json());
app.use(cookieParser("secret"));

app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/permissions', permissionRoutes)

// Inicializar base de datos y luego iniciar servidor
async function startServer() {
  try {
    // Inicializar base de datos (incluye auto-migraciones si está habilitado)
    await database.initialize();
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Iniciar servidor
startServer();
