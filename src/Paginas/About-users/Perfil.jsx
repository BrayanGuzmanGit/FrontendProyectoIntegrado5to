import React, { useState, useEffect } from 'react';
import fotoDefecto from '@/assets/principales/perfil.webp';
import BASE_URL from '@/services/api-entidades';
import './Perfiles.css';
import {Eye, EyeOff} from 'lucide-react';

function Perfil() {

    useEffect(() => {
        document.title = "Perfil usuario";
    }, []);

    const [isEditing, setIsEditing]                = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    // ─── Leer datos del usuario desde localStorage ──────────────────────────
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');

    // ─── Estado del formulario inicializado con los datos reales ────────────
    const [formData, setFormData] = useState({
        cc:        usuarioGuardado.cc                   || '',
        nombres:   usuarioGuardado.nombre               || '',
        apellidos: usuarioGuardado.apellido             || '',
        direccion: usuarioGuardado.direccion_residencia  || '',
        telefono:  usuarioGuardado.telefono             || '',
        correo:    usuarioGuardado.correo_electronico    || '',
        clave:     usuarioGuardado.clave                || '',
    });

    const alternarContrasena = () => setMostrarContrasena(prev => !prev);

    // ─── Actualizar campo al escribir ───────────────────────────────────────
    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

        // ─── funcion para guardar los cambios ───────
    const guardarCambios = async (e) => {
        e.preventDefault(); // Evita que la página se recargue al enviar el formulario

        // 1. Obtener el token de autenticación
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No estás autenticado');
            return;
        }

        // 2. Para enviarle los datos a el backend
        const datosParaBackend = {
            nombre: formData.nombres,
            apellido: formData.apellidos,
            direccion: formData.direccion,
            telefono: formData.telefono,
            email: formData.correo,
            password: formData.clave
        };

        try {
            // 3. Hacer la petición PATCH al backend
            const respuesta = await fetch(`${BASE_URL}/users/editProfile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Aquí enviamos el token
                },
                body: JSON.stringify(datosParaBackend)
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                alert('Perfil actualizado con éxito');
                
                // 4. Actualizar localStorage para que al recargar no se pierdan los cambios
                // Actualizamos solo los campos que cambiaron, conservando el resto (ej. el token)
                const usuarioActualizado = {
                    ...usuarioGuardado,
                    nombre: formData.nombres,
                    apellido: formData.apellidos,
                    direccion_residencia: formData.direccion,
                    telefono: formData.telefono,
                    correo_electronico: formData.correo,
                    clave: formData.clave
                };
                localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

                // 5. Apagar el modo edición
                setIsEditing(false);
            } else {
                // Mostrar el error que viene del backend (ej. Zod o tu AppError)
                alert(`Error: ${data.message || 'No se pudo actualizar la información'}`);
            }

        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de conexión con el servidor');
        }
    };

    // ─── Campos del formulario ───────────────────────────────────────────────
    const campos = [
        { label: 'CC:',        name: 'cc',        val: formData.cc,        disabled: true },
        { label: 'Nombres:',   name: 'nombres',   val: formData.nombres },
        { label: 'Apellidos:', name: 'apellidos', val: formData.apellidos },
        { label: 'Dirección:', name: 'direccion', val: formData.direccion },
        { label: 'Teléfono:',  name: 'telefono',  val: formData.telefono },
        { label: 'Correo:',    name: 'correo',    val: formData.correo },
    ];

    return (
        <div className="contenedor-pantalla-perfil">
            <main className="contenido-principal">
                <section className="card">
                    <h2 className="card-title">Información Personal</h2>

                    <div className="contenedor-avatar">
                        <img src={fotoDefecto} alt="Perfil" className="imagen-perfil" />
                    </div>

                    <form onSubmit={guardarCambios}>
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
                                className="btn-secundary"
                                onClick={() => setIsEditing(prev => !prev)}
                            >
                                {isEditing ? 'Cancelar' : 'Editar perfil'}
                            </button>

                            <button
                                type="submit"
                                className="btn-secundary"
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

export default Perfil;