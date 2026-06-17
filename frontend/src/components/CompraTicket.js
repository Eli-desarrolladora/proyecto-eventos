// components/CompraTicket.js - Pantalla de compra de ticket
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventoService, ticketService } from '../services/api';

function CompraTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(null);

  useEffect(() => {
    eventoService.obtener(id)
      .then(({ data }) => setEvento(data))
      .catch(() => setError('Evento no encontrado'))
      .finally(() => setCargando(false));
  }, [id]);

  const handleComprar = async () => {
    setComprando(true);
    setError('');
    try {
      const { data } = await ticketService.comprar(parseInt(id));
      setExito(data.ticket);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la compra');
    } finally {
      setComprando(false);
    }
  };

  if (cargando) return <div className="cargando">Cargando...</div>;
  if (error && !evento) return <div className="alerta error">{error}</div>;

  if (exito) return (
    <div className="compra-exito">
      <div className="ticket-confirmado">
        <h2>✅ ¡Ticket Confirmado!</h2>
        <div className="ticket-codigo">
          <p>Código de ticket:</p>
          <strong>{exito.codigo_unico}</strong>
        </div>
        <p>Evento: <strong>{exito.evento?.nombre}</strong></p>
        <p>Fecha: <strong>{new Date(exito.evento?.fecha).toLocaleDateString('es-CO')}</strong></p>
        <p>Lugar: <strong>{exito.evento?.lugar}</strong></p>
        <p>Precio pagado: <strong>${parseFloat(exito.precio_pagado).toLocaleString('es-CO')}</strong></p>
        <button className="btn-primary" onClick={() => navigate('/mis-tickets')}>Ver mis tickets</button>
      </div>
    </div>
  );

  return (
    <div className="compra-container">
      <h2>Confirmar Compra</h2>
      {error && <div className="alerta error">{error}</div>}
      {evento && (
        <div className="resumen-compra">
          <h3>{evento.nombre}</h3>
          <p>📅 {new Date(evento.fecha).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>📍 {evento.lugar}</p>
          <p>🎟️ Disponibles: {evento.tickets_disponibles}</p>
          <div className="precio-total">
            <span>Total a pagar:</span>
            <strong>${parseFloat(evento.precio).toLocaleString('es-CO')} COP</strong>
          </div>
          <div className="botones">
            <button className="btn-secondary" onClick={() => navigate('/eventos')}>Cancelar</button>
            <button className="btn-primary" onClick={handleComprar} disabled={comprando || evento.tickets_disponibles === 0}>
              {comprando ? 'Procesando...' : evento.tickets_disponibles === 0 ? 'Sin disponibilidad' : 'Confirmar Compra'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompraTicket;
