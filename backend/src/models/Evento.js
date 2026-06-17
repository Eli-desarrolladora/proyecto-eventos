// models/Evento.js - Modelo de Evento con Sequelize
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Evento = sequelize.define('Evento', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre del evento es requerido' },
        len: { args: [3, 200], msg: 'El nombre debe tener entre 3 y 200 caracteres' },
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'La fecha debe ser válida' },
        isFuture(value) {
          if (new Date(value) <= new Date()) {
            throw new Error('La fecha debe ser futura');
          }
        },
      },
    },
    lugar: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'La capacidad debe ser al menos 1' },
        isInt: { msg: 'La capacidad debe ser un número entero' },
      },
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'El precio no puede ser negativo' },
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'eventos',
    timestamps: true,
  });

  // Método virtual: tickets disponibles
  Evento.prototype.ticketsDisponibles = async function () {
    const { Ticket } = sequelize.models;
    const vendidos = await Ticket.count({
      where: { evento_id: this.id, estado: ['confirmado', 'reservado'] },
    });
    return this.capacidad - vendidos;
  };

  return Evento;
};
