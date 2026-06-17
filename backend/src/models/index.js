// models/index.js - Configuración de Sequelize y exportación de modelos
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'eventos_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Importar modelos
const Usuario = require('./Usuario')(sequelize);
const Evento = require('./Evento')(sequelize);
const Ticket = require('./Ticket')(sequelize);

// ─── RELACIONES ──────────────────────────────────────────────────────────────
// Un usuario puede tener muchos tickets
Usuario.hasMany(Ticket, { foreignKey: 'usuario_id', as: 'tickets' });
Ticket.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Un evento puede tener muchos tickets
Evento.hasMany(Ticket, { foreignKey: 'evento_id', as: 'tickets' });
Ticket.belongsTo(Evento, { foreignKey: 'evento_id', as: 'evento' });

module.exports = { sequelize, Usuario, Evento, Ticket };
