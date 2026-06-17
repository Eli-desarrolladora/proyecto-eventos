// controllers/ticketController.js - Compra y gestión de tickets
const { validationResult } = require('express-validator');
const { Ticket, Evento, Usuario } = require('../models');
const { sequelize } = require('../models');

/**
 * POST /api/tickets/comprar
 * Comprar ticket para un evento (transacción atómica)
 */
const comprarTicket = async (req, res, next) => {
  const transaccion = await sequelize.transaction();
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      await transaccion.rollback();
      return res.status(400).json({ errores: errores.array() });
    }

    const { evento_id } = req.body;

    // Bloquear fila del evento para evitar condición de carrera
    const evento = await Evento.findByPk(evento_id, { lock: true, transaction: transaccion });

    if (!evento || !evento.activo) {
      await transaccion.rollback();
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Verificar disponibilidad
    const vendidos = await Ticket.count({
      where: { evento_id, estado: ['confirmado', 'reservado'] },
      transaction: transaccion,
    });

    if (vendidos >= evento.capacidad) {
      await transaccion.rollback();
      return res.status(409).json({ error: 'No hay tickets disponibles para este evento' });
    }

    // Verificar que el usuario no tenga ya un ticket para este evento
    const ticketExistente = await Ticket.findOne({
      where: { usuario_id: req.usuario.id, evento_id, estado: ['confirmado', 'reservado'] },
      transaction: transaccion,
    });

    if (ticketExistente) {
      await transaccion.rollback();
      return res.status(409).json({ error: 'Ya tienes un ticket para este evento' });
    }

    // Crear el ticket
    const ticket = await Ticket.create({
      usuario_id: req.usuario.id,
      evento_id,
      precio_pagado: evento.precio,
      estado: 'confirmado',
    }, { transaction: transaccion });

    await transaccion.commit();

    res.status(201).json({
      mensaje: 'Ticket comprado exitosamente',
      ticket: {
        id: ticket.id,
        codigo_unico: ticket.codigo_unico,
        estado: ticket.estado,
        precio_pagado: ticket.precio_pagado,
        evento: { id: evento.id, nombre: evento.nombre, fecha: evento.fecha, lugar: evento.lugar },
      },
    });
  } catch (error) {
    await transaccion.rollback();
    next(error);
  }
};

/**
 * GET /api/tickets/mis-tickets
 * Ver tickets del usuario autenticado
 */
const misTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.findAll({
      where: { usuario_id: req.usuario.id },
      include: [{ model: Evento, as: 'evento', attributes: ['nombre', 'fecha', 'lugar'] }],
      order: [['fecha_compra', 'DESC']],
    });

    res.json({ tickets });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tickets/:id/cancelar
 * Cancelar un ticket
 */
const cancelarTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
    if (ticket.estado === 'cancelado') {
      return res.status(400).json({ error: 'El ticket ya está cancelado' });
    }

    await ticket.update({ estado: 'cancelado' });
    res.json({ mensaje: 'Ticket cancelado exitosamente' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tickets (solo admin)
 * Listar todos los tickets
 */
const listarTodosTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: Evento, as: 'evento', attributes: ['nombre', 'fecha'] },
        { model: Usuario, as: 'usuario', attributes: ['nombre', 'email'] },
      ],
      order: [['fecha_compra', 'DESC']],
    });
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
};

module.exports = { comprarTicket, misTickets, cancelarTicket, listarTodosTickets };
