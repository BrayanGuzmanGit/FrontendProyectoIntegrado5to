import React, { useEffect, useState } from 'react';
import BASE_URL_INSPECTIONS from '@/services/api-inspections';
import '../Autenticaciones/SolicitudesUsuarios.css';

/**
 * Componente para visualizar solicitudes de inspecciones.
 * 1. Consulta las solicitudes de inspección desde el backend
 * 2. Las muestra filtradas por tipo de inspección
 */
function VerSolicitudesI() {

    // Estado que almacenará la lista de solicitudes
    const [solicitudes, setSolicitudes] = useState([]);

    // Estado para manejar carga
    const [loading, setLoading] = useState(true);

    // Estado para manejar errores
    const [error, setError] = useState(null);

    // Filtro por tipo de inspección
    const [filtroTipo, setFiltroTipo] = useState('');

    const token = localStorage.getItem('token');


    // Llamar a obtenerSolicitudes después de que el componente se carga
    useEffect(() => {
        document.title = "Solicitudes de inspección";
        obtenerSolicitudes();
    }, []);


    // Función para obtener solicitudes desde el backend
    const obtenerSolicitudes = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL_INSPECTIONS}/solicitudes`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener solicitudes');
            }

            const data = await response.json();

            console.log(data);

            setSolicitudes(data.data || []);
            setLoading(false);

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };


    // Filtrar solicitudes por tipo de inspección
    const solicitudesFiltradas = solicitudes.filter(solicitud => {
        const tipo = solicitud.tipo_inspeccion ? solicitud.tipo_inspeccion.toString().toLowerCase() : '';
        return filtroTipo === '' || tipo === filtroTipo;
    });


    // Prioridad de orden (por si se necesita más adelante)
    const prioridadTipo = {
        'inspeccion tecnica': 1,
        'inspeccion fitosanitaria': 2
    };

    // Ordenar solicitudes por tipo
    const solicitudesOrdenadas = [...solicitudesFiltradas].sort((a, b) => {
        const tipoA = a.tipo_inspeccion ? a.tipo_inspeccion.toString().toLowerCase() : '';
        const tipoB = b.tipo_inspeccion ? b.tipo_inspeccion.toString().toLowerCase() : '';
        return (prioridadTipo[tipoA] || 999) - (prioridadTipo[tipoB] || 999);
    });


    /**
     * Función para cambiar el estado de una solicitud
     * @param {number} id - id de la solicitud
     * @param {string} nuevoEstado - nuevo estado a asignar
     */
    const cambiarEstado = async (id, nuevoEstado) => {
        try {

            // === ACTUALIZACIÓN LOCAL (UX rápida) ===
            setSolicitudes(prevSolicitudes =>
                prevSolicitudes.map(solicitud =>
                    solicitud.id === id
                        ? { ...solicitud, estado: nuevoEstado }
                        : solicitud
                )
            );

            const token = localStorage.getItem('token');
            const payload = { estado: nuevoEstado };

            console.log('Enviando:', JSON.stringify(payload));

            const response = await fetch(`${BASE_URL_INSPECTIONS}/users/${id}/status`, {
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


    // Condicional mientras carga
    if (loading) { return <p>Cargando solicitudes...</p>; }

    // Si hay error, mostrar mensaje
    if (error) { return <p>Error: {error}</p>; }


    return (
        <div className="contenedor-usuarios">
            <h2>Solicitudes de Inspección</h2>

            {/* Filtro por tipo de inspección */}
            <div className="filtros">
                <select onChange={(e) => setFiltroTipo(e.target.value)}>
                    <option value="">Todos los tipos</option>
                    <option value="inspeccion tecnica">Inspección Técnica</option>
                    <option value="inspeccion fitosanitaria">Inspección Fitosanitaria</option>
                </select>
            </div>

            {/* Tabla de solicitudes */}
            <table className="tabla-usuarios">
                <thead>
                    <tr>
                        <th>Lugar de producción</th>
                        <th>Tipo</th>
                        <th>Motivo</th>
                        <th>Fecha de solicitud</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {solicitudesOrdenadas.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                No se encontraron solicitudes con esas características
                            </td>
                        </tr>

                    ) : (
                        solicitudesOrdenadas.map((solicitud, index) => (
                            <tr key={solicitud.idsolicitud || index}>
                                <td>{solicitud.idlugarproduccion || '—'}</td>
                                <td>{solicitud.tipo_inspeccion || '—'}</td>
                                <td>{solicitud.comentarios || '—'}</td>
                                <td>{solicitud.fechasolicitud || solicitud.createdAt || '—'}</td>
                                <td className={`estado ${solicitud.estado?.toString().toLowerCase()}`}>
                                    {solicitud.estado || '—'}
                                </td>
                                <td>
                                    {/* Botón aprobar */}
                                    <button
                                        className="btn aprobar"
                                        onClick={() => cambiarEstado(solicitud.id, 'Aprobado')}
                                    >
                                        Aprobar
                                    </button>

                                    {/* Botón rechazar */}
                                    <button
                                        className="btn eliminar"
                                        onClick={() => cambiarEstado(solicitud.id, 'Rechazado')}
                                    >
                                        Rechazar
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default VerSolicitudesI;