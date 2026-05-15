import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '@/assets/principales/logo-principal.webp';
import BASE_URL from '@/services/api-entidades';
import './Login.css';
import {Eye, EyeOff} from 'lucide-react';

function Login() {

  // ─── Título de la pestaña ───────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Inicio de Sesión - ICA';
  }, []);

  // ─── Hook de navegación (react-router) ─────────────────────────────────────
  // Necesario para redirigir al usuario luego de un login exitoso.
  const navigate = useNavigate();

  // ─── Estado del formulario ──────────────────────────────────────────────────
  // Cada campo del formulario tiene su propio estado controlado.
  const [tipoUsuario, setTipoUsuario] = useState('Productor');
  const [usuario, setUsuario]         = useState('');
  const [contrasena, setContrasena]   = useState('');

  // Estado para mostrar u ocultar la contraseña en el input
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Estado para manejar errores que se muestran debajo del formulario
  const [mensajeError, setMensajeError] = useState('');

  // Estado para deshabilitar el botón mientras se espera respuesta del backend
  const [cargando, setCargando] = useState(false);

  // ─── Alternar visibilidad de contraseña ────────────────────────────────────
  const alternarContrasena = () => {
    setMostrarContrasena(prev => !prev);
  };


  // ─── Manejador del envío del formulario ────────────────────────────────────
  const manejarEnvio = async (evento) => {
  evento.preventDefault();

  // ── Validación básica del lado del cliente ──────────────────────────────
  if (!usuario.trim() || !contrasena.trim()) {
    setMensajeError('Por favor completa todos los campos.');
    return;
  }

  setMensajeError('');
  setCargando(true);

  try {
    // ── Petición al backend ───────────────────────────────────────────────
    // El backend espera: { email, password }
    // El tipoUsuario se maneja desde el frontend con el selector
    const respuesta = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    usuario,    // tu campo "usuario" mapea a "email" en el backend
        password: contrasena, // tu campo "contrasena" mapea a "password"
        rol: tipoUsuario
      }),
    });

    const datos = await respuesta.json();
    console.log(datos)

    // ── Manejo de la respuesta ────────────────────────────────────────────
    // El backend responde { status: 'success', data: { session: { access_token }, user: { rol, estado } } }
    if (datos.status !== 'success') {
      // El backend rechazó las credenciales — usa el mensaje que venga o uno genérico
      throw new Error(datos.message || datos.mensaje || 'Credenciales incorrectas.');
    }

    // ── Guardar el token JWT en localStorage ─────────────────────────────
    const token = datos.data.session.access_token;
    const user  = datos.data.user;

    localStorage.setItem('token',    token);
    localStorage.setItem('rol',      user.rol);
    localStorage.setItem('estado',   user.estado);

    // Guarda el objeto completo del usuario como JSON
    localStorage.setItem('usuario',  JSON.stringify(user));

    // ── Redirigir según el tipo de usuario seleccionado en el formulario ──
    // Puedes también usar datos.data.user.rol si el backend lo determina
    const rutas = {
      Productor:   '/menu-productor',
      Propietario: '/menu-propietario',
      Tecnico:     '/menu-tecnico',
      Funcionario: '/menu-funcionario',
    };
    navigate(rutas[tipoUsuario] ?? '/menu-funcionario');

  } catch (error) {
    setMensajeError(error.message || 'Ocurrió un error. Intenta de nuevo.');
  } finally {
    setCargando(false);
  }
};

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="contenedor-pagina-login">
      <div className="contenedor-logo-card">

        {/* Logo institucional */}
        <div className="encabezado-logo">
          <img src={logo} alt="Logo ICA" className="logo-principal" />
        </div>

        {/* Tarjeta del formulario */}
        <div className="card">
          <h2 className="card-title">Iniciar Sesión</h2>

          {/*
           * onSubmit apunta al manejador asíncrono que llama al backend.
           * El atributo noValidate desactiva la validación nativa del
           * navegador para que la manejemos nosotros con el estado.
           */}
          <form onSubmit={manejarEnvio} noValidate>

            {/* ── Campo: Tipo de usuario ────────────────────────────────── */}
            <div className="form-group">
              <label className="label-base" htmlFor="tipo-usuario">Tipo de usuario:</label>
              <select
                className="input-base"
                id="tipo-usuario"
                name="tipo-usuario"
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
              >
                <option value="Productor">Productor</option>
                <option value="Propietario">Propietario</option>
                <option value="Tecnico">Técnico</option>
                <option value="Funcionario">Funcionario</option>
              </select>
            </div>

            {/* ── Campo: Nombre de usuario ──────────────────────────────── */}
            <div className="form-group">
              <label className="label-base" htmlFor="usuario">Correo electrónico:</label>
              <input
              className="input-base"
                type="text"
                id="usuario"
                name="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
              />
            </div>

            {/* ── Campo: Contraseña con botón de visibilidad ────────────── */}
            <div className="form-group">
              <label className="label-base" htmlFor="contrasena">Contraseña:</label>
              <div className="contenedor-contrasena">
                <input
                 className="input-base"
                  type={mostrarContrasena ? 'text' : 'password'}
                  id="contrasena"
                  name="contrasena"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <span
                    className="boton-visibilidad"
                    onClick={alternarContrasena}
                    role="button"
                    aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                    {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            {/* ── Mensaje de error (visible solo si hay error) ──────────── */}
            {mensajeError && (
              <p className="mensaje-error" role="alert">
                {mensajeError}
              </p>
            )}

            {/* ── Pie del formulario: botón y enlace de registro ─────────── */}
            <div className="pie-formulario">
              {/*
               * El botón se deshabilita mientras cargando === true para
               * evitar envíos duplicados durante la petición al backend.
               */}
              <button
                type="submit"
                className="btn-primary"
                disabled={cargando}
              >
                {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>

              <p className="texto-registro-login">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/registro">Crear una cuenta</Link>
              </p>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;