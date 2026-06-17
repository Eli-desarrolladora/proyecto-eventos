// components/EventosList.js - Lista pública de eventos
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventoService } from '../services/api';

function EventosList() {
  const [eventos, setEventos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const estaAutenticado = !!localStorage.getItem('token');

  useEffect(() => {
    cargarEventos();
  }, [pagina]);

  const cargarEventos = async () => {
    try {
      setCargando(true);
      const { data } = await eventoService.listar(pagina);
      setEventos(data.eventos);
      setTotalPaginas(data.totalPaginas);
    } catch {
      setError('Error al cargar eventos');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(precio);

  if (cargando) return <div className="cargando">Cargando eventos...</div>;
  if (error) return <div className="alerta error">{error}</div>;

  return (
    <div className="eventos-container">
      <h1>Eventos Disponibles</h1>
      {eventos.length === 0 ? (
        <p className="sin-resultados">No hay eventos disponibles en este momento.</p>
      ) : (
        <div className="eventos-grid">
          {eventos.map((evento) => (
            <div key={evento.id} className="evento-card">
              <div className="evento-header">
                <h3>{evento.nombre}</h3>
                <span className="precio">{formatearPrecio(evento.precio)}</span>
              </div>
              <p className="evento-descripcion">{evento.descripcion}</p>
              <div className="evento-detalles">
                <span>📅 {formatearFecha(evento.fecha)}</span>
                <span>📍 {evento.lugar}</span>
                <span>🎟️ {evento.capacidad} lugares</span>
              </div>
              <button
                className="btn-primary"
                onClick={() => estaAutenticado ? navigate(`/eventos/${evento.id}/comprar`) : navigate('/login')}
              >
                {estaAutenticado ? 'Comprar Ticket' : 'Inicia sesión para comprar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="paginacion">
          <button onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>← Anterior</button>
          <span>Página {pagina} de {totalPaginas}</span>
          <button onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>Siguiente →</button>
        </div>
      )}
    </div>
  );
}

export default EventosList;
