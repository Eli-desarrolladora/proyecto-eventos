// controllers/eventoController.js - CRUD de eventos
const { validationResult } = require('express-validator');
const { Evento, Ticket } = require('../models');
const { Op } = require('sequelize');

const listarEventos = async (req, res, next) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await Evento.findAndCountAll({
      where: { activo: true, fecha: { [Op.gt]: new Date() } },
      order: [['fecha', 'ASC']],
      limit: limite,
      offset,
    });

    res.json({
      total: count,
      pagina,
      totalPaginas: Math.ceil(count / limite),
      eventos: rows,
    });
  } catch (error) {
    next(error);
  }
};

const obtenerEvento = async (req, res, next) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento || !evento.activo) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    const disponibles = await evento.ticketsDisponibles();
    res.json({ ...evento.toJSON(), tickets_disponibles: disponibles });
  } catch (error) {
    next(error);
  }
};

const crearEvento = async (req, res, next) => {
  try {
    console.log('BODY RECIBIDO: - eventoController.js:45', req.body);

    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      console.log('ERRORES DE VALIDACION: - eventoController.js:49', errores.array());
      return res.status(400).json({ errores: errores.array() });
    }

    const evento = await Evento.create(req.body);
    res.status(201).json({ mensaje: 'Evento creado exitosamente', evento });
  } catch (error) {
    console.error('ERROR AL CREAR EVENTO: - eventoController.js:56', error.message);
    console.error('DETALLE: - eventoController.js:57', error);
    next(error);
  }
};

const actualizarEvento = async (req, res, next) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    await evento.update(req.body);
    res.json({ mensaje: 'Evento actualizado', evento });
  } catch (error) {
    next(error);
  }
};

const eliminarEvento = async (req, res, next) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    await evento.update({ activo: false });
    res.json({ mensaje: 'Evento eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listarEventos, obtenerEvento, crearEvento, actualizarEvento, eliminarEvento };
