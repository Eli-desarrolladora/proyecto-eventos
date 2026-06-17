// components/Navbar.js - Barra de navegación
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/eventos" className="nav-brand">🎭 EventosPro</Link>
      <div className="nav-links">
        <Link to="/eventos">Eventos</Link>
        {token && <Link to="/mis-tickets">Mis Tickets</Link>}
        {token && usuario.rol === 'admin' && <Link to="/dashboard">Dashboard</Link>}
        {token ? (
          <div className="nav-usuario">
            <span>Hola, {usuario.nombre}</span>
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        ) : (
          <Link to="/login" className="btn-nav">Ingresar</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
