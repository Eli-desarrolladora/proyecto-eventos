// components/Login.js - Formulario de login y registro
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Login() {
  const [modo, setModo] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      let respuesta;
      if (modo === 'login') {
        respuesta = await authService.login({ email: form.email, password: form.password });
      } else {
        respuesta = await authService.register(form);
      }
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
      navigate('/eventos');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errores?.[0]?.msg || 'Error al procesar la solicitud';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>

        {error && <div className="alerta error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {modo === 'register' && (
            <div className="campo">
              <label>Nombre</label>
              <input type="text" name="nombre" value={form.nombre}
                onChange={handleChange} required placeholder="Tu nombre completo" />
            </div>
          )}
          <div className="campo">
            <label>Correo electrónico</label>
            <input type="email" name="email" value={form.email}
              onChange={handleChange} required placeholder="correo@ejemplo.com" />
          </div>
          <div className="campo">
            <label>Contraseña</label>
            <input type="password" name="password" value={form.password}
              onChange={handleChange} required placeholder={modo === 'register' ? 'Mín. 8 caracteres, 1 mayúscula y 1 número' : '••••••••'} />
          </div>
          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Procesando...' : (modo === 'login' ? 'Ingresar' : 'Registrarme')}
          </button>
        </form>

        <p className="cambiar-modo">
          {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button className="btn-link" onClick={() => { setModo(modo === 'login' ? 'register' : 'login'); setError(''); }}>
            {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
