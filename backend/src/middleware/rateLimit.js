// middleware/rateLimit.js - Configuración de rate limiting
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter global: 100 peticiones por IP cada 15 minutos
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,    // Incluye headers RateLimit-* estándar
  legacyHeaders: false,
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos',
  },
});

/**
 * Rate limiter para login: solo 5 intentos cada 15 minutos (previene fuerza bruta)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos de inicio de sesión, intenta de nuevo en 15 minutos',
  },
  skipSuccessfulRequests: true, // No contar logins exitosos
});

/**
 * Rate limiter para compra de tickets: 10 compras por usuario cada hora
 */
const compraLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.usuario?.id || req.ip, // Limitar por usuario si está autenticado
  message: {
    error: 'Has alcanzado el límite de compras por hora',
  },
});

module.exports = { globalLimiter, loginLimiter, compraLimiter };
