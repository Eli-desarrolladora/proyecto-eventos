// routes/eventoRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { listarEventos, obtenerEvento, crearEvento, actualizarEvento, eliminarEvento } = require('../controllers/eventoController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

const router = express.Router();

const validarEvento = [
  body('nombre').trim().isLength({ min: 3, max: 200 }).withMessage('Nombre entre 3 y 200 caracteres'),
  body('fecha').isISO8601().withMessage('Fecha inválida').toDate(),
  body('lugar').trim().notEmpty().withMessage('El lugar es requerido'),
  body('capacidad').isInt({ min: 1 }).withMessage('Capacidad debe ser un entero positivo'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),
];

router.get('/', listarEventos);                                   // Público
router.get('/:id', obtenerEvento);                                // Público
router.post('/', verificarToken, soloAdmin, validarEvento, crearEvento);         // Solo admin
router.put('/:id', verificarToken, soloAdmin, validarEvento, actualizarEvento);  // Solo admin
router.delete('/:id', verificarToken, soloAdmin, eliminarEvento);                // Solo admin

module.exports = router;
