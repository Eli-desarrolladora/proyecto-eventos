// App.js - Enrutador principal
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EventosList from './components/EventosList';
import CompraTicket from './components/CompraTicket';
import MisTickets from './components/MisTickets';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

// Ruta protegida: requiere autenticación
const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// Ruta solo admin
const RutaAdmin = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  if (usuario.rol !== 'admin') return <Navigate to="/eventos" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/eventos" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/eventos" element={<EventosList />} />
          <Route path="/eventos/:id/comprar" element={
            <RutaProtegida><CompraTicket /></RutaProtegida>
          } />
          <Route path="/mis-tickets" element={
            <RutaProtegida><MisTickets /></RutaProtegida>
          } />
          <Route path="/dashboard" element={
            <RutaAdmin><Dashboard /></RutaAdmin>
          } />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
