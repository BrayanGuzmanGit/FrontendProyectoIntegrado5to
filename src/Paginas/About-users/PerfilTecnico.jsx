import React, { useState, useEffect } from 'react';
import fotoDefecto from '@/assets/principales/perfil.webp';
import BASE_URL from '@/services/api-entidades';
import './Perfiles.css';
import {Eye, EyeOff} from 'lucide-react';


function PerfilTecnico() {

    useEffect(() => {
        document.title = "Perfil usuario";
    }, []);

    // ─── Leer datos del usuario desde localStorage ──────────────────────────
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');

    // ==================== ESTADOS ====================
    const [isEditing, setIsEditing]                = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    // ─── Ubicaciones ────────────────────────────────────────────────────────
    const [departamentos, setDepartamentos]                   = useState([]);
    const [municipios, setMunicipios]                         = useState([]);
    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
    const [municipioSeleccionado, setMunicipioSeleccionado]   = useState(usuarioGuardado.id_municipio || '');

    // ─── Estado del formulario inicializado con los datos reales ────────────
    const [formData, setFormData] = useState({
        cc:                 usuarioGuardado.cc                  || '',
        tarjetaProfesional: usuarioGuardado.tarjeta_profesional || '',
        nombres:            usuarioGuardado.nombre              || '',
        apellidos:          usuarioGuardado.apellido            || '',
        direccion:          usuarioGuardado.direccion_residencia || '',
        telefono:           usuarioGuardado.telefono            || '',
        correo:             usuarioGuardado.correo_electronico  || '',
        clave:              usuarioGuardado.clave               || '',
    });

    // ─── Cargar departamentos y municipios desde el backend ─────────────────
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

                    // Una vez cargados los municipios, buscamos el departamento
                    // al que pertenece el municipio actual del usuario
                    const munActual = muns.data.find(
                        m => m.id_municipio === Number(usuarioGuardado.id_municipio)
                    );
                    if (munActual) {
                        setDepartamentoSeleccionado(munActual.id_departamento);
                    }
                }
            } catch (error) {
                console.error("Error al cargar ubicaciones:", error);
            }
        };

        cargarUbicaciones();
    }, []);

    // ─── Municipios filtrados según departamento seleccionado ───────────────
    const municipiosFiltrados = municipios.filter(
        mun => mun.id_departamento === Number(departamentoSeleccionado)
    );

    // ─── Nombre del municipio actual para mostrar cuando no se edita ────────
    const nombreMunicipioActual = municipios.find(
        m => m.id_municipio === Number(municipioSeleccionado)
    )?.nombre || '';

    // ─── Actualizar campo al escribir ───────────────────────────────────────
    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDepartamentoChange = (e) => {
        setDepartamentoSeleccionado(e.target.value);
        setMunicipioSeleccionado(''); // resetea municipio al cambiar departamento
    };

    const alternarContrasena = () => setMostrarContrasena(prev => !prev);

    // ─── Campos del formulario ───────────────────────────────────────────────
    const campos = [
        { label: 'CC:',                  name: 'cc',                 val: formData.cc,                 disabled: true },
        { label: 'Tarjeta profesional:', name: 'tarjetaProfesional', val: formData.tarjetaProfesional, disabled: true },
        { label: 'Nombres:',             name: 'nombres',            val: formData.nombres },
        { label: 'Apellidos:',           name: 'apellidos',          val: formData.apellidos },
        { label: 'Dirección:',           name: 'direccion',          val: formData.direccion },
        { label: 'Teléfono:',            name: 'telefono',           val: formData.telefono },
        { label: 'Correo:',              name: 'correo',             val: formData.correo },
    ];

    return (
        <div className="contenedor-pantalla-perfil">
            <main className="contenido-principal">
                <section className="card">
                    <h2 className="card-title">Información Personal</h2>

                    <div className="contenedor-avatar">
                        <img src={fotoDefecto} alt="Perfil" className="imagen-perfil" />
                    </div>

                    <form >{/* falta onSubmit={guardarCambios} */}

                        {campos.map((item) => (
                            <div className="form-group" key={item.name}>
                                <label className="label-base">{item.label}</label>
                                <input
                                    className='input-base'
                                    type="text"
                                    name={item.name}
                                    value={item.val}
                                    onChange={manejarCambio}
                                    disabled={item.disabled || !isEditing}
                                />
                            </div>
                        ))}

                        {/* ── Campo Departamento (solo visible al editar) ───── */}
                        {isEditing && (
                            <div className="form-group">
                                <label className="label-base">Departamento:</label>
                                <select
                                    className="input-base"
                                    value={departamentoSeleccionado}
                                    onChange={handleDepartamentoChange}
                                >
                                    <option value="">Seleccione departamento</option>
                                    {departamentos.map((dep) => (
                                        <option key={dep.id_departamento} value={dep.id_departamento}>
                                            {dep.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* ── Campo Municipio ───────────────────────────────── */}
                        <div className="form-group">
                            <label className="label-base">Municipio:</label>
                            {isEditing ? (
                                <select
                                    className="input-base"
                                    value={municipioSeleccionado}
                                    onChange={(e) => setMunicipioSeleccionado(e.target.value)}
                                    disabled={!departamentoSeleccionado}
                                >
                                    <option value="">Seleccione municipio</option>
                                    {municipiosFiltrados.map((mun) => (
                                        <option key={mun.id_municipio} value={mun.id_municipio}>
                                            {mun.nombre}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={nombreMunicipioActual}
                                    disabled
                                    className='input-base'
                                />
                            )}
                        </div>

                        {/* ── Campo Contraseña ─────────────────────────────── */}
                        <div className="form-group">
                            <label className="label-base">Contraseña:</label>
                            <div className="contenedor-contrasena">
                                <input
                                    className='input-base'
                                    type={mostrarContrasena ? 'text' : 'password'}
                                    name="clave"
                                    value={formData.clave}
                                    onChange={manejarCambio}
                                    disabled={!isEditing}
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

                        <div className="contenedor-botones">
                            <button
                                type="button"
                                className=" btn-secundary"
                                onClick={() => setIsEditing(prev => !prev)}
                            >
                                {isEditing ? 'Cancelar' : 'Editar perfil'}
                            </button>

                            <button
                                type="submit"
                                className={`btn-secundary ${isEditing ? 'activo' : ''}`}
                                disabled={!isEditing}
                            >
                                Guardar cambios
                            </button>
                        </div>

                    </form>
                </section>
            </main>
        </div>
    );
}

export default PerfilTecnico;