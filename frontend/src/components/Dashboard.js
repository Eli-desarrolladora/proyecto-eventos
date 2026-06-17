// components/Dashboard.js - Panel administrativo
import React, { useState, useEffect } from 'react';
import { eventoService, ticketService } from '../services/api';

function Dashboard() {
  const [eventos, setEventos] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState('eventos');
  const [form, setForm] = useState({ nombre: '', descripcion: '', fecha: '', lugar: '', capacidad: '', precio: '' });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    eventoService.listar().then(({ data }) => setEventos(data.eventos));
    ticketService.listarTodos().then(({ data }) => setTickets(data.tickets));
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError(''); setMensaje('');
    try {
      if (editando) {
        await eventoService.actualizar(editando, form);
        setMensaje('Evento actualizado exitosamente');
      } else {
        await eventoService.crear(form);
        setMensaje('Evento creado exitosamente');
      }
      const { data } = await eventoService.listar();
      setEventos(data.eventos);
      setForm({ nombre: '', descripcion: '', fecha: '', lugar: '', capacidad: '', precio: '' });
      setEditando(null);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errores?.[0]?.msg || 'Error al guardar');
    }
  };

  const handleEditar = (evento) => {
    setEditando(evento.id);
    setForm({
      nombre: evento.nombre, descripcion: evento.descripcion || '',
      fecha: evento.fecha?.slice(0, 16), lugar: evento.lugar,
      capacidad: evento.capacidad, precio: evento.precio,
    });
    setTab('form');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    await eventoService.eliminar(id);
    setEventos(eventos.filter(e => e.id !== id));
  };

  return (
    <div className="dashboard-container">
      <h1>Panel Administrativo</h1>

      <div className="stats-bar">
        <div className="stat"><strong>{eventos.length}</strong><span>Eventos activos</span></div>
        <div className="stat"><strong>{tickets.filter(t => t.estado === 'confirmado').length}</strong><span>Tickets vendidos</span></div>
        <div className="stat"><strong>{tickets.length}</strong><span>Total transacciones</span></div>
      </div>

      <div className="tabs">
        <button className={tab === 'eventos' ? 'active' : ''} onClick={() => setTab('eventos')}>Gestionar Eventos</button>
        <button className={tab === 'form' ? 'active' : ''} onClick={() => { setTab('form'); setEditando(null); setForm({ nombre: '', descripcion: '', fecha: '', lugar: '', capacidad: '', precio: '' }); }}>
          {editando ? 'Editar Evento' : '+ Nuevo Evento'}
        </button>
        <button className={tab === 'tickets' ? 'active' : ''} onClick={() => setTab('tickets')}>Ver Tickets</button>
      </div>

      {mensaje && <div className="alerta exito">{mensaje}</div>}
      {error && <div className="alerta error">{error}</div>}

      {tab === 'eventos' && (
        <table className="tabla-admin">
          <thead><tr><th>Nombre</th><th>Fecha</th><th>Lugar</th><th>Precio</th><th>Acciones</th></tr></thead>
          <tbody>
            {eventos.map(ev => (
              <tr key={ev.id}>
                <td>{ev.nombre}</td>
                <td>{new Date(ev.fecha).toLocaleDateString('es-CO')}</td>
                <td>{ev.lugar}</td>
                <td>${parseFloat(ev.precio).toLocaleString('es-CO')}</td>
                <td>
                  <button className="btn-small" onClick={() => handleEditar(ev)}>Editar</button>
                  <button className="btn-small danger" onClick={() => handleEliminar(ev.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'form' && (
        <form className="form-evento" onSubmit={handleGuardar}>
          <div className="campo"><label>Nombre</label><input name="nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
          <div className="campo"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
          <div className="campo"><label>Fecha y hora</label><input type="datetime-local" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required /></div>
          <div className="campo"><label>Lugar</label><input value={form.lugar} onChange={e => setForm({ ...form, lugar: e.target.value })} required /></div>
          <div className="campo"><label>Capacidad</label><input type="number" min="1" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })} required /></div>
          <div className="campo"><label>Precio (COP)</label><input type="number" min="0" step="0.01" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required /></div>
          <button type="submit" className="btn-primary">{editando ? 'Actualizar Evento' : 'Crear Evento'}</button>
        </form>
      )}

      {tab === 'tickets' && (
        <table className="tabla-admin">
          <thead><tr><th>Código</th><th>Evento</th><th>Usuario</th><th>Estado</th><th>Precio</th></tr></thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id}>
                <td className="codigo-pequeño">{t.codigo_unico?.slice(0, 8)}...</td>
                <td>{t.evento?.nombre}</td>
                <td>{t.usuario?.email}</td>
                <td><span className={`badge-${t.estado}`}>{t.estado}</span></td>
                <td>${parseFloat(t.precio_pagado).toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
