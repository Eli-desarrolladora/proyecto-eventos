// controllers/authController.js - Registro y login de usuarios
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { Usuario } = require('../models');

/**
 * Generar token JWT
 */
const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
const register = async (req, res) => {
  try {
    // Validar datos de entrada
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    const { nombre, email, password } = req.body;

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Crear usuario (el hook beforeCreate hashea la contraseña)
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password_hash: password, // El hook lo hashea automáticamente
    });

    const token = generarToken(nuevoUsuario);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
const login = async (req, res, next) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario con password (scope especial)
    const usuario = await Usuario.scope('conPassword').findOne({ where: { email } });
    if (!usuario) {
      // Mensaje genérico para no revelar si el email existe (seguridad OWASP)
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar contraseña
    const passwordValida = await usuario.verificarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generarToken(usuario);

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/perfil
 * Obtener perfil del usuario autenticado
 */
const perfil = async (req, res) => {
  res.json({ usuario: req.usuario });
};

module.exports = { register, login, perfil };
