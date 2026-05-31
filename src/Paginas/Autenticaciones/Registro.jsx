import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/principales/logo-principal.webp';
import BASE_URL from '@/services/api-entidades';
import './Registro.css';
import {Eye, EyeOff} from 'lucide-react';

/**
 * Componente de Registro de usuarios para el sistema ICA
 */
function Registro() {
    useEffect(() => {
        document.title = "Registro - ICA";
    }, []);

    // ==================== ESTADOS ====================
    const [tipoUsuario, setTipoUsuario] = useState('Productor');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);

    // Estados para campos del formulario
    const [nit, setNit] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [tarjetaProfesional, setTarjetaProfesional] = useState('');

    // Estados para ubicaciones (desde backend)
    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
    const [municipioSeleccionado, setMunicipioSeleccionado] = useState('');

    const esTecnico = tipoUsuario === 'Tecnico';

    // ==================== FUNCIONES ====================

    const alternarContrasena = () => setMostrarContrasena(!mostrarContrasena);
    const alternarConfirmarContrasena = () => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena);

    // Cargar Departamentos y Municipios desde el backend
    useEffect(() => {
        const cargarUbicaciones = async () => {
            try {
                const [depRes, munRes] = await Promise.all([
                    fetch(`${BASE_URL}/locations/departamentos`),
                    fetch(`${BASE_URL}/locations/municipios`)
                ]);

                if (depRes.ok) {
                    const deps = await depRes.json();
                    setDepartamentos(deps.data);
                }

                if (munRes.ok) {
                    const muns = await munRes.json();
                    setMunicipios(muns.data);
                }
            } catch (error) {
                console.error("Error al cargar departamentos y municipios:", error);
                alert("No se pudieron cargar los departamentos. Verifica tu conexión.");
            }
        };

        cargarUbicaciones();
    }, []);

    // Filtra municipios según el departamento seleccionado
    const municipiosFiltrados = municipios.filter(
        mun => mun.id_departamento === Number(departamentoSeleccionado)
    );

    const handleDepartamentoChange = (e) => {
        setDepartamentoSeleccionado(e.target.value);
        setMunicipioSeleccionado('');
    };

    const handleTipoUsuarioChange = (e) => {
        const nuevoTipo = e.target.value;
        setTipoUsuario(nuevoTipo);

        if (nuevoTipo !== 'Tecnico') {
            setDepartamentoSeleccionado('');
            setMunicipioSeleccionado('');
            setTarjetaProfesional('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ── Logs de diagnóstico ──
        console.log("tipoUsuario al submit:", tipoUsuario);
        console.log("tarjetaProfesional al submit:", tarjetaProfesional);

        if (password !== confirmarPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        if (tipoUsuario === 'Tecnico' && !tarjetaProfesional) {
            alert("La tarjeta profesional es obligatoria para técnicos");
            return;
        }

        if (tipoUsuario === 'Tecnico' && !departamentoSeleccionado) {
            alert("Debes seleccionar un departamento");
            return;
        }

        if (tipoUsuario === 'Tecnico' && !municipioSeleccionado) {
            alert("Debes seleccionar un municipio");
            return;
        }

        const formData = {
            cc: nit,
            nombre,
            apellido,
            direccion_residencia: direccion,
            telefono,
            correo_electronico: email,
            clave: password,
            rol: tipoUsuario,
            // ← usamos tipoUsuario directamente, no esTecnico
            tarjeta_profesional: tipoUsuario === 'Tecnico' ? tarjetaProfesional : null,
            id_municipio: tipoUsuario === 'Tecnico' ? Number(municipioSeleccionado) : null,
        };

        console.log("formData a enviar:", formData); // ── verifica el objeto completo

        try {
            const response = await fetch(`${BASE_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Respuesta del backend:", data);

            if (response.ok) {
                alert("¡Registro exitoso!, favor espere a que se le acepte la solicitud de ingreso");
            } else {
                alert(data.message || "Error al registrar usuario");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Error de conexión con el servidor. Inténtalo más tarde.");
        }
    };


    // ==================== RENDER ====================
    return (
        <div className="contenedor-pagina-registro">
            <div className="contenedor-logo-card">
                <div className="card">
                <header className="cabecera-logo">
                    <img src={logo} alt="Logo ICA" className="logo-principal" />
                </header>

            
                <main>
                    <h1 className="card-title">Registro</h1>

                    <form onSubmit={handleSubmit}>
                        <label className='label-base' htmlFor="tipo_usuario">Tipo de usuario:</label>
                        <select
                            className="input-base"
                            id="tipo_usuario"
                            value={tipoUsuario}
                            onChange={handleTipoUsuarioChange}
                        >
                            <option value="Productor">Productor</option>
                            <option value="Propietario">Propietario</option>
                            <option value="Tecnico">Técnico</option>
                        </select>

                        <label className="label-base" htmlFor="nit">(*) Cédula / NIT:</label>
                        <input
                            className='input-base'
                            type="text"
                            id="nit"
                            value={nit}
                            onChange={e => setNit(e.target.value)}
                            required
                        />

                        <label className='label-base' htmlFor="nombre">(*) Nombres:</label>
                        <input
                            className='input-base'
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            required
                        />

                        <label className='label-base' htmlFor="apellido">(*) Apellidos:</label>
                        <input
                            className='input-base'
                            type="text"
                            id="apellido"
                            value={apellido}
                            onChange={e => setApellido(e.target.value)}
                            required
                        />

                        <label className='label-base' htmlFor="direccion">(*) Dirección:</label>
                        <input
                            className='input-base'
                            type="text"
                            id="direccion"
                            value={direccion}
                            onChange={e => setDireccion(e.target.value)}
                            required
                        />

                        <label className='label-base' htmlFor="telefono">(*) Nro Telefónico:</label>
                        <input
                            className='input-base'
                            type="tel"
                            id="telefono"
                            value={telefono}
                            onChange={e => setTelefono(e.target.value)}
                            required
                        />

                        <label className='label-base' htmlFor="email">(*) Correo Electrónico:</label>
                        <input
                            className='input-base'
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />

                        {/* Campo Contraseña */}
                        <label className='label-base' htmlFor="password">(*) Contraseña:</label>
                        <div className="contenedor-contrasena">
                            <input
                                className='input-base'
                                type={mostrarContrasena ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
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

                        {/* Campo Confirmar Contraseña */}
                        <label className='label-base' htmlFor="confirm_password">(*) Confirmar Contraseña:</label>
                        <div className="contenedor-contrasena">
                            <input
                                className='input-base'
                                type={mostrarConfirmarContrasena ? "text" : "password"}
                                id="confirm_password"
                                value={confirmarPassword}
                                onChange={e => setConfirmarPassword(e.target.value)}
                                required
                            />
                            <span
                                className="boton-visibilidad"
                                onClick={alternarConfirmarContrasena}
                                role="button"
                                aria-label={mostrarConfirmarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {mostrarConfirmarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>

                        {/* Campos solo para Técnicos */}
                        {esTecnico && (
                            <>
                                <label className='label-base' htmlFor="tarjeta_profesional">(*) Tarjeta profesional:</label>
                                <input
                                    className='input-base'
                                    type="text"
                                    id="tarjeta_profesional"
                                    value={tarjetaProfesional}
                                    onChange={(e) => setTarjetaProfesional(e.target.value)}
                                    required
                                />

                                <label className='label-base' htmlFor="departamento">(*) Departamento:</label>
                                <select
                                    className='input-base'
                                    id="departamento"
                                    value={departamentoSeleccionado}
                                    onChange={handleDepartamentoChange}
                                    required
                                >
                                    <option value="">Seleccione departamento</option>
                                    {departamentos.map((dep) => (
                                        <option key={dep.id_departamento} value={dep.id_departamento}>
                                            {dep.nombre}
                                        </option>
                                    ))}
                                </select>

                                <label className='label-base' htmlFor="municipio">(*) Municipio:</label>
                                <select
                                    className='input-base'
                                    id="municipio"
                                    value={municipioSeleccionado}
                                    onChange={(e) => setMunicipioSeleccionado(e.target.value)}
                                    disabled={!departamentoSeleccionado}
                                    required
                                >
                                    <option value="">Seleccione municipio</option>
                                    {municipiosFiltrados.map((mun) => (
                                        <option key={mun.id_municipio} value={mun.id_municipio}>
                                            {mun.nombre}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        <button type="submit" className="btn-primary">Crear cuenta</button>
                    </form>

                    <p className="texto-registro-login">
                        ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
                    </p>
                </main>
            </div>
            </div>
        </div>
    );
}

export default Registro;