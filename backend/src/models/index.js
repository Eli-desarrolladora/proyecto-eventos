const sequelize = require('../config/database');

const Usuario = require('./Usuario')(sequelize);
const Evento = require('./Evento')(sequelize);
const Ticket = require('./Ticket')(sequelize);

Usuario.hasMany(Ticket, { foreignKey: 'usuario_id', as: 'tickets' });
Ticket.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Evento.hasMany(Ticket, { foreignKey: 'evento_id', as: 'tickets' });
Ticket.belongsTo(Evento, { foreignKey: 'evento_id', as: 'evento' });

module.exports = { sequelize, Usuario, Evento, Ticket };