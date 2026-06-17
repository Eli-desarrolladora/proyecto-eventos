// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { register, login, perfil } = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Validaciones para registro
const validarRegistro = [
  body('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre entre 2 y 100 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Debe tener al menos una mayúscula y un número'),
];

// Validaciones para login
const validarLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

router.post('/register', validarRegistro, register);
router.post('/login', loginLimiter, validarLogin, login); // Rate limit específico para login
router.get('/perfil', verificarToken, perfil);

module.exports = router;
