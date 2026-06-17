// models/index.js - Configuración de Sequelize y exportación de modelos
const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || 'eventos_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      }
    );

const Usuario = require('./Usuario')(sequelize);
const Evento = require('./Evento')(sequelize);
const Ticket = require('./Ticket')(sequelize);

Usuario.hasMany(Ticket, { foreignKey: 'usuario_id', as: 'tickets' });
Ticket.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Evento.hasMany(Ticket, { foreignKey: 'evento_id', as: 'tickets' });
Ticket.belongsTo(Evento, { foreignKey: 'evento_id', as: 'evento' });

module.exports = { sequelize, Usuario, Evento, Ticket };