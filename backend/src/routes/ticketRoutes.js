// routes/ticketRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { comprarTicket, misTickets, cancelarTicket, listarTodosTickets } = require('../controllers/ticketController');
const { verificarToken, soloAdmin } = require('../middleware/auth');
const { compraLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/comprar', verificarToken, compraLimiter, [
  body('evento_id').isInt({ min: 1 }).withMessage('ID de evento inválido'),
], comprarTicket);

router.get('/mis-tickets', verificarToken, misTickets);
router.delete('/:id/cancelar', verificarToken, cancelarTicket);
router.get('/', verificarToken, soloAdmin, listarTodosTickets); // Solo admin

module.exports = router;
