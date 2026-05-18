import React, { useEffect, useState } from 'react';
import BASE_URL from '@/services/api-entidades';
import './SolicitudesUsuarios.css';


/**
 * Componente para visualizar y gestionar usuarios.
 * 1. Consulta los usuarios (productores, técnicos o propietarios) desde el backend
 * 2. Los almacena en el estado pendiente y puede cambiar su estado a aprobado o eliminado
 */
function UsuariosFuncionario() {

    // Estado que almacenará la lista de usuarios
    const [usuarios, setUsuarios] = useState([]);
    
    // Estado para manejar carga 
    const [loading, setLoading] = useState(true);

    // Estado para manejar errores
    const [error, setError] = useState(null);

    // Filtros
    const [filtroRol, setFiltroRol] = useState(''); //por rol
    const [filtroEstado, setFiltroEstado] = useState(''); //por estado
    const token = localStorage.getItem('token');


    // llamar a la función obtenerUsuarios después de que el componente se carga en la pantalla
    useEffect(() => {
        document.title = "Solicitudes acceso";
        obtenerUsuarios();
    }, []);


    // Función flecha para obtener usuarios desde el backend
    const obtenerUsuarios = async () => {
        try {
            setLoading(true);

           const response = await fetch(`${BASE_URL}/users/pending`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }

            const data = await response.json();

            console.log(data);

            // El backend devuelve { status, message, data: [...] }
            setUsuarios(data.data || []);
            setLoading(false);

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };


    // función para filtrar usuarios por rol y estado
    const usuariosFiltrados = usuarios.filter(usuario => {
        const rol = usuario.rol ? usuario.rol.toString().toLowerCase() : '';
        const estado = usuario.estado ? usuario.estado.toString().toLowerCase() : '';

        return (
            (filtroRol === '' || rol === filtroRol) &&
            (filtroEstado === '' || estado === filtroEstado)
        );
    });


    // función para priorizar el orden en que aparecen los usuarios
    const prioridadEstado = {
        pendiente: 1,
        aprobado: 2,
        eliminado: 3
    };

    // ordenar usuarios por estado. Se ordena una copia, no el estado original para evitar mutaciones
    const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
        const estadoA = a.estado ? a.estado.toString().toLowerCase() : '';
        const estadoB = b.estado ? b.estado.toString().toLowerCase() : '';
        return (prioridadEstado[estadoA] || 999) - (prioridadEstado[estadoB] || 999);
    });


    /**
     * Función para cambiar el estado de un usuario
     * @param {number} cc - cédula del usuario
     * @param {string} nuevoEstado - 'aprobado' o 'eliminado'
     */
    const cambiarEstado = async (cc, nuevoEstado) => {
        try {

            // === ACTUALIZACIÓN LOCAL (UX rápida) ===
            setUsuarios(prevUsuarios =>
                prevUsuarios.map(user =>
                    user.cc === cc
                        ? { ...user, estado: nuevoEstado }
                        : user
                )
            );

            const token = localStorage.getItem('token');
            const payload = { estado: nuevoEstado };
            
            console.log('Enviando:', JSON.stringify(payload));
            
            // parte del backend para actualizar el estado del usuario en la base de datos
            const response = await fetch(`${BASE_URL}/users/${cc}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Respuesta del servidor:', errorData);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

        } catch (err) {
            console.error('Error al actualizar estado:', err);
        }
    };


    //condicional mientras carga
    if (loading) { return <p>Cargando usuarios...</p>;}

    //si hay error, mostrar mensaje
    if (error) {return <p>Error: {error}</p>;}


    return (
        <div className="contenedor-usuarios">
            <h2>Gestión de Usuarios</h2>

            {/* Filtros */}
            <div className="filtros">

                {/* Filtro por rol */}
                <select onChange={(e) => setFiltroRol(e.target.value)}>
                    <option value="">Todos los roles</option>
                    <option value="productor">Productor</option>
                    <option value="tecnico">Técnico</option>
                    <option value="propietario">Propietario</option>
                </select>


            </div>


            {/* Tabla de usuarios */}
            <table className="tabla-usuarios">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Correo electrónico</th>
                        <th>Rol</th>
                        <th>Fecha de solicitud</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {usuariosOrdenados.length === 0 ? ( //si no hay usuarios con esas características, mostrar mensaje
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        No se encontraron usuarios con esas características
                            </td>
                        </tr>

                    ) : (
                    usuariosOrdenados.map(usuario => (//si hay usuarios, hacer map para mostrar 
                        <tr key={ usuario.cc}>

                            <td>{usuario.nombre}</td>
                            <td>{usuario.apellido}</td>
                            <td>{usuario.correo_electronico || usuario.correo || '—'}</td>
                            <td>{usuario.rol}</td>
                            <td>{usuario.fecha || usuario.createdAt || '—'}</td>
                            <td className={`estado ${usuario.estado?.toString().toLowerCase()}`}>
                                {usuario.estado}
                            </td>
                            

                            <td>
                                {/* Botón aprobar */}
                                <button
                                    className="btn aprobar"
                                    onClick={() => cambiarEstado(usuario.cc, 'Activo')}
                                >
                                    Activar
                                </button>

                                {/* Botón eliminar */}
                                <button
                                    className="btn eliminar"
                                    onClick={() => cambiarEstado(usuario.cc, 'Eliminado')}
                                >
                                    Eliminar
                                </button>
                            </td>

                        </tr>
                    )))}
                </tbody>
            </table>
        </div>
    );
}

export default UsuariosFuncionario;