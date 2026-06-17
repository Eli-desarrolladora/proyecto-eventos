# EventosPro - Sistema de Gestión de Eventos con Ticketing

## 🛠 Tecnologías
- **Backend**: Node.js + Express + Sequelize + PostgreSQL
- **Frontend**: React + React Router + Axios
- **Seguridad**: JWT, Helmet, express-rate-limit, express-validator

## 🚀 Instalación

### 1. Clonar y configurar el backend
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
npm install
npm run dev
```

### 2. Configurar la base de datos
Crear base de datos en PostgreSQL:
```sql
CREATE DATABASE eventos_db;
```
Sequelize crea las tablas automáticamente al iniciar.

### 3. Iniciar el frontend
```bash
cd frontend
npm install
npm start
```

## 📡 Endpoints de la API

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Público | Registrar usuario |
| POST | /api/auth/login | Público | Iniciar sesión |
| GET | /api/auth/perfil | Autenticado | Ver perfil |
| GET | /api/eventos | Público | Listar eventos |
| GET | /api/eventos/:id | Público | Ver evento |
| POST | /api/eventos | Admin | Crear evento |
| PUT | /api/eventos/:id | Admin | Actualizar evento |
| DELETE | /api/eventos/:id | Admin | Eliminar evento |
| POST | /api/tickets/comprar | Autenticado | Comprar ticket |
| GET | /api/tickets/mis-tickets | Autenticado | Ver mis tickets |
| DELETE | /api/tickets/:id/cancelar | Autenticado | Cancelar ticket |
| GET | /api/tickets | Admin | Ver todos los tickets |

## 🔐 Seguridad implementada
- **Helmet.js**: Headers HTTP seguros
- **JWT**: Autenticación stateless
- **bcryptjs**: Hash de contraseñas (salt rounds: 12)
- **Rate limiting**: 100 req/15min global, 5 intentos de login/15min
- **express-validator**: Validación y sanitización de inputs
- **CORS**: Solo permite el frontend autorizado
- **Soft delete**: Los eventos no se borran físicamente
- **Transacciones**: Compra de tickets con bloqueo de concurrencia

## 👤 Crear usuario administrador
En la consola de PostgreSQL:
```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'tu@email.com';
```
