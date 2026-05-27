import React, { useEffect, useState } from 'react';
import BASE_URL from '@/services/api-entidades';
import './Usuarios.css';

/**
 * Componente para visualizar todos los usuarios activos.
 * 1. Consulta todos los usuarios desde el backend
 * 2. Filtra solo los activos
 * 3. Permite filtrar por nombre o cédula
 */
function UsuariosActivos() {

    // Estado que almacenará la lista de usuarios
    const [usuarios, setUsuarios] = useState([]);

    // Estado para manejar carga
    const [loading, setLoading] = useState(true);

    // Estado para manejar errores
    const [error, setError] = useState(null);

    // Filtros
    const [filtroTipo, setFiltroTipo] = useState(''); // 'nombre' o 'cedula'
    const [filtroValor, setFiltroValor] = useState(''); // valor del filtro
    const token = localStorage.getItem('token');

    // llamar a la función obtenerUsuarios después de que el componente se carga en la pantalla
    useEffect(() => {
        obtenerUsuarios();
    }, []);

    // Función flecha para obtener usuarios desde el backend
    const obtenerUsuarios = async () => {
        try {
            setLoading(true);

           const response = await fetch(`${BASE_URL}/users/all`, {
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
            // Filtrar solo usuarios activos
            const usuariosActivos = (data.data || []).filter(user => user.estado === 'Activo');
            setUsuarios(usuariosActivos);
            setLoading(false);

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // función para filtrar usuarios por nombre o cédula
    const usuariosFiltrados = usuarios.filter(usuario => {
        if (!filtroTipo || !filtroValor) return true; // si no hay filtro, mostrar todos

        const valor = filtroValor.toLowerCase();
        if (filtroTipo === 'nombre') {
            const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase();
            return nombreCompleto.startsWith(valor);
        } else if (filtroTipo === 'cedula') {
            return (usuario.cc || '').toString().toLowerCase().startsWith(valor);
        }
        return true;
    });

    // ordenar usuarios alfabéticamente por nombre
    const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
        const nombreA = (a.nombre || '').toLowerCase();
        const nombreB = (b.nombre || '').toLowerCase();
        return nombreA.localeCompare(nombreB);
    });

    //condicional mientras carga
    if (loading) { return <p>Cargando usuarios...</p>;}

    //si hay error, mostrar mensaje
    if (error) {return <p>Error: {error}</p>;}

    return (
        <div className="contenedor-usuarios">
            <h2>Usuarios Registrados</h2>

            {/* Filtros */}
            <div className="filtros">
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                    <option value="">Sin filtro</option>
                    <option value="nombre">Filtrar por nombre</option>
                    <option value="cedula">Filtrar por cédula</option>
                </select>

                {filtroTipo && (
                    <input
                        type="text"
                        placeholder={`Buscar por ${filtroTipo}`}
                        value={filtroValor}
                        onChange={(e) => setFiltroValor(e.target.value)}
                    />
                )}
            </div>

            {/* Tabla de usuarios */}
            <table className="tabla-usuarios">
                <thead>
                    <tr>
                        <th>Cédula</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Correo electrónico</th>
                        <th>Rol</th>
                        <th>Estado</th>
                    </tr>
                </thead>

                <tbody>
                    {usuariosOrdenados.length === 0 ? ( //si no hay usuarios con esas características, mostrar mensaje
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        No se encontraron usuarios con esas características
                            </td>
                        </tr>

                    ) : (
                    usuariosOrdenados.map(usuario => (//si hay usuarios, hacer map para mostrar
                        <tr key={ usuario.cc}>

                            <td>{usuario.cc}</td>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.apellido}</td>
                            <td>{usuario.correo_electronico || usuario.correo || '—'}</td>
                            <td>{usuario.rol}</td>
                            <td className={`estado ${usuario.estado?.toString().toLowerCase()}`}>
                                {usuario.estado}
                            </td>

                        </tr>
                    ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default UsuariosActivos;