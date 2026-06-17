// models/Usuario.js - Modelo de Usuario con Sequelize
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre no puede estar vacío' },
        len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { msg: 'Este correo ya está registrado' },
      validate: {
        isEmail: { msg: 'Debe ser un correo electrónico válido' },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('usuario', 'admin'),
      defaultValue: 'usuario',
    },
  }, {
    tableName: 'usuarios',
    timestamps: true,
    // No devolver password_hash en consultas por defecto
    defaultScope: {
      attributes: { exclude: ['password_hash'] },
    },
    scopes: {
      conPassword: { attributes: {} }, // Para login: incluye password_hash
    },
  });

  // ─── Método de instancia: verificar contraseña ───────────────────────────
  Usuario.prototype.verificarPassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  // ─── Hook: hashear contraseña antes de guardar ───────────────────────────
  Usuario.beforeCreate(async (usuario) => {
    if (usuario.password_hash) {
      usuario.password_hash = await bcrypt.hash(usuario.password_hash, 12);
    }
  });

  Usuario.beforeUpdate(async (usuario) => {
    if (usuario.changed('password_hash')) {
      usuario.password_hash = await bcrypt.hash(usuario.password_hash, 12);
    }
  });

  return Usuario;
};
