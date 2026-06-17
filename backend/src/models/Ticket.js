// models/Ticket.js - Modelo de Ticket con Sequelize
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    evento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'eventos', key: 'id' },
    },
    codigo_unico: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      unique: true,
    },
    estado: {
      type: DataTypes.ENUM('reservado', 'confirmado', 'cancelado'),
      defaultValue: 'confirmado',
    },
    precio_pagado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_compra: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'tickets',
    timestamps: true,
  });

  // Hook: generar código único antes de crear
  Ticket.beforeCreate((ticket) => {
    if (!ticket.codigo_unico) {
      ticket.codigo_unico = uuidv4();
    }
  });

  return Ticket;
};
