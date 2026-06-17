// components/MisTickets.js - Tickets del usuario autenticado
import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/api';

function MisTickets() {
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cancelando, setCancelando] = useState(null);

  useEffect(() => { cargarTickets(); }, []);

  const cargarTickets = async () => {
    try {
      const { data } = await ticketService.misTickets();
      setTickets(data.tickets);
    } catch {
      setError('Error al cargar tus tickets');
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar este ticket?')) return;
    setCancelando(id);
    try {
      await ticketService.cancelar(id);
      setTickets(tickets.map(t => t.id === id ? { ...t, estado: 'cancelado' } : t));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    } finally {
      setCancelando(null);
    }
  };

  const estadoColor = { confirmado: '#22c55e', reservado: '#f59e0b', cancelado: '#ef4444' };

  if (cargando) return <div className="cargando">Cargando tus tickets...</div>;
  if (error) return <div className="alerta error">{error}</div>;

  return (
    <div className="tickets-container">
      <h1>Mis Tickets</h1>
      {tickets.length === 0 ? (
        <p className="sin-resultados">No tienes tickets aún.</p>
      ) : (
        <div className="tickets-lista">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-estado" style={{ borderLeftColor: estadoColor[ticket.estado] }}>
                <div className="ticket-info">
                  <h3>{ticket.evento?.nombre}</h3>
                  <p>📅 {new Date(ticket.evento?.fecha).toLocaleDateString('es-CO')}</p>
                  <p>📍 {ticket.evento?.lugar}</p>
                  <p className="codigo">🎟️ {ticket.codigo_unico}</p>
                  <p>💰 ${parseFloat(ticket.precio_pagado).toLocaleString('es-CO')} COP</p>
                </div>
                <div className="ticket-acciones">
                  <span className="badge" style={{ background: estadoColor[ticket.estado] }}>
                    {ticket.estado.toUpperCase()}
                  </span>
                  {ticket.estado === 'confirmado' && (
                    <button className="btn-danger" onClick={() => handleCancelar(ticket.id)} disabled={cancelando === ticket.id}>
                      {cancelando === ticket.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MisTickets;
