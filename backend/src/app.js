// app.js - Punto de entrada principal del servidor
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { sequelize } = require('./models');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Importar rate limiters globales
const { globalLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── SEGURIDAD: Helmet (headers HTTP seguros) ───────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── PARSERS ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limitar tamaño del body
app.use(express.urlencoded({ extended: true }));

// ─── RATE LIMITING GLOBAL ───────────────────────────────────────────────────
app.use('/api/', globalLimiter);

// ─── RUTAS ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/tickets', ticketRoutes);

// ─── RUTA RAÍZ ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Sistema de Gestión de Eventos',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      eventos: '/api/eventos',
      tickets: '/api/tickets',
    },
  });
});

// ─── MANEJO DE RUTAS NO ENCONTRADAS ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── MANEJO GLOBAL DE ERRORES ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { detalle: err.message }),
  });
});

// ─── INICIAR SERVIDOR ───────────────────────────────────────────────────────
async function iniciarServidor() {
  try {
    // Sincronizar base de datos (alter: true actualiza tablas sin borrarlas)
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();

module.exports = app; // Para pruebas con Jest
