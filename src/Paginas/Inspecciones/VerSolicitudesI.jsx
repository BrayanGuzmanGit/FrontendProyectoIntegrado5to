import React, { useEffect, useState } from 'react';
import BASE_URL_INSPECTIONS from '@/services/api-inspections';
import BASE_URL from '@/services/api-entidades';
import '../Autenticaciones/SolicitudesUsuarios.css';
import './SolicitudInspeccion.css';
 
/**
 * Componente para visualizar solicitudes de inspecciones.
 * Maneja dos vistas internas:
 *   - 'lista'     → tabla de solicitudes
 *   - 'programar' → formulario para programar la inspección seleccionada
 */
function VerSolicitudesI() {
 
    // ── Vista activa ──────────────────────────────────────────────────────────
    const [vista, setVista] = useState('lista'); // 'lista' | 'programar'
 
    // ── Estados de la lista ───────────────────────────────────────────────────
    const [solicitudes, setSolicitudes]   = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [filtroTipo, setFiltroTipo]     = useState('');
 
    // ── Estados del formulario de programar ───────────────────────────────────
    const [solicitudActual, setSolicitudActual]       = useState(null); // { idsolicitud, idMunicipio }
    const [tecnicos, setTecnicos]                     = useState([]);
    const [cargandoTecnicos, setCargandoTecnicos]     = useState(false);
    const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState('');
    const [fechaInspeccion, setFechaInspeccion]       = useState('');
    const [enviando, setEnviando]                     = useState(false);
 
    // Fechas límite para el campo de fecha
    const hoy = new Date();
    const fechaMin = hoy.toISOString().split('T')[0];
    const fechaMaxDate = new Date(hoy);
    fechaMaxDate.setMonth(fechaMaxDate.getMonth() + 1);
    const fechaMax = fechaMaxDate.toISOString().split('T')[0];
 
    const token = localStorage.getItem('token');
 
 
    // ── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        document.title = "Solicitudes de inspección";
        obtenerSolicitudes();
    }, []);
 
 
    // ── Obtener solicitudes ───────────────────────────────────────────────────
    const obtenerSolicitudes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL_INSPECTIONS}/solicitudes`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!response.ok) {
                const { message } = await response.json()
                console.log("Razon de error:", message)
                return;
            }
            const data = await response.json();
            setSolicitudes(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
 
 
    // ── Filtrar y ordenar ─────────────────────────────────────────────────────
    const prioridadTipo = { 'inspeccion tecnica': 1, 'inspeccion fitosanitaria': 2 };
 
    const solicitudesOrdenadas = [...solicitudes]
        .filter(s => {
            const tipo = s.tipo_inspeccion?.toString().toLowerCase() || '';
            return filtroTipo === '' || tipo === filtroTipo;
        })
        .sort((a, b) => {
            const tipoA = a.tipo_inspeccion?.toString().toLowerCase() || '';
            const tipoB = b.tipo_inspeccion?.toString().toLowerCase() || '';
            return (prioridadTipo[tipoA] || 999) - (prioridadTipo[tipoB] || 999);
        });
 
 
    // ── Aprobar: consulta municipio y cambia a vista 'programar' ─────────────
    const aprobarSolicitud = async (idlugarproduccion, idsolicitud) => {
        try {
            const response = await fetch(`${BASE_URL}/locations/lugarMunicipio/${idlugarproduccion}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
            });
 
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Respuesta del servidor:', errorData);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
 
            const data = await response.json();
            const idMunicipio = data.data;
 
            if (!idMunicipio) {
                alert("No se pudo obtener el municipio del lugar de producción.");
                return;
            }
 
            // Guardar contexto y cargar técnicos antes de cambiar vista
            setSolicitudActual({ idsolicitud, idMunicipio });
            setTecnicoSeleccionado('');
            setFechaInspeccion('');
            await cargarTecnicos(idMunicipio);
            setVista('programar');
 
        } catch (err) {
            console.error('Error al obtener municipio:', err);
            alert("Ocurrió un error al intentar aprobar la solicitud.");
        }
    };
 
 
    // ── Cargar técnicos según municipio ───────────────────────────────────────
    const cargarTecnicos = async (idMunicipio) => {
        try {
            setCargandoTecnicos(true);
            console.log('URL técnicos:', `${BASE_URL}/users/tecnicos/${idMunicipio}`);
            console.log('idMunicipio recibido:', idMunicipio);
            const response = await fetch(`${BASE_URL}/users/tecnicos/${idMunicipio}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
            const data = await response.json();
            setTecnicos(data.data || []);
        } catch (error) {
            console.error("Error cargando técnicos:", error);
        } finally {
            setCargandoTecnicos(false);
        }
    };
 
 
    // ── Enviar programación ───────────────────────────────────────────────────
    const handleProgramar = async (e) => {
        e.preventDefault();
        setEnviando(true);

        const formData = {
            idtecnico: tecnicoSeleccionado,
            fecha_inspeccion: fechaInspeccion,
            estado: 'Aprobado'
        };

        try {
            const response = await fetch(`${BASE_URL_INSPECTIONS}/solicitudes/${solicitudActual.idsolicitud}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(formData)
            });
 
            const data = await response.json();
 
            if (response.ok) {
                alert(data.message || "¡Inspección programada exitosamente!");
                // Volver a la lista y refrescar
                setVista('lista');
                obtenerSolicitudes();
            } else {
                alert(data.message || "Error al programar la inspección.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Error de conexión con el servidor. Inténtalo más tarde.");
        } finally {
            setEnviando(false);
        }
    };
 
 
    // ── Rechazar solicitud ────────────────────────────────────────────────────
    const rechazarSolicitud = async (idsolicitud) => {
        try {
            const nuevoEstado = 'Rechazado';
 
            // Actualización local optimista
            setSolicitudes(prev =>
                prev.map(s => s.idsolicitud === idsolicitud ? { ...s, estado: nuevoEstado } : s)
            );
 
            const payload = { estado: nuevoEstado };
 
            const response = await fetch(`${BASE_URL_INSPECTIONS}/solicitudes/${idsolicitud}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });
 
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            } else {
                const rta = await response.json();
                alert(rta.message);
            }
        } catch (err) {
            console.error('Error al rechazar solicitud:', err);
        }
    };
 
 
    // ── Renders condicionales ─────────────────────────────────────────────────
    if (loading) return <p>Cargando solicitudes...</p>;
    if (error)   return <p>Error: {error}</p>;
 
 
    // ── Vista: Programar inspección ───────────────────────────────────────────
    if (vista === 'programar') {
        return (
            <div className="card">
                <main>
                    <h1 className="card-title">Programar Inspección</h1>
 
                    <form onSubmit={handleProgramar}>
 
                        {/* Técnico */}
                        <div className="form-group">
                            <label htmlFor="tecnico" className="label-base">
                                (*) Técnico asignado:
                            </label>
                            <select
                                id="tecnico"
                                className="input-base"
                                value={tecnicoSeleccionado}
                                onChange={(e) => setTecnicoSeleccionado(e.target.value)}
                                required
                            >
                                <option value="" disabled>-- Seleccione un técnico --</option>
                                {cargandoTecnicos ? (
                                    <option disabled>Cargando técnicos...</option>
                                ) : tecnicos.length === 0 ? (
                                    <option disabled>No hay técnicos disponibles</option>
                                ) : (
                                    tecnicos.map((tecnico) => (
                                        <option key={tecnico.id} value={tecnico.id}>
                                            {tecnico.nombre} {tecnico.apellido}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
 
                        {/* Fecha */}
                        <div className="form-group">
                            <label htmlFor="fecha" className="label-base">
                                (*) Fecha de inspección:
                            </label>
                            <input
                                id="fecha"
                                type="date"
                                className="input-base"
                                value={fechaInspeccion}
                                min={fechaMin}
                                max={fechaMax}
                                onChange={(e) => setFechaInspeccion(e.target.value)}
                                required
                            />
                        </div>
 
                        {/* Botones */}
                        <div className="contenedor-botones">
                            <button
                                type="button"
                                className="btn eliminar"
                                onClick={() => setVista('lista')}
                                disabled={enviando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn aprobar"
                                disabled={enviando}
                            >
                                {enviando ? 'Programando...' : 'Programar'}
                            </button>
                        </div>
 
                    </form>
                </main>
            </div>
        );
    }
 
 
    // ── Vista: Lista de solicitudes ───────────────────────────────────────────
    return (
        <div className="contenedor-usuarios">
            <h2>Solicitudes de Inspección</h2>
 
            {/* Filtro por tipo */}
            <div className="filtros">
                <select onChange={(e) => setFiltroTipo(e.target.value)}>
                    <option value="">Todos los tipos</option>
                    <option value="inspeccion tecnica">Inspección Técnica</option>
                    <option value="inspeccion fitosanitaria">Inspección Fitosanitaria</option>
                </select>
            </div>
 
            {/* Tabla */}
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
                                <td>{solicitud.lugar?.nombre || '—'}</td>
                                <td>{solicitud.tipo_inspeccion || '—'}</td>
                                <td>{solicitud.comentarios || '—'}</td>
                                <td>{solicitud.fechasolicitud || solicitud.createdAt || '—'}</td>
                                <td className={`estado ${solicitud.estado?.toString().toLowerCase()}`}>
                                    {solicitud.estado || '—'}
                                </td>
                                <td>
                                    <button
                                        className="btn aprobar"
                                        onClick={() => aprobarSolicitud(
                                            solicitud.lugar.id,
                                            solicitud.idsolicitud
                                        )}
                                    >
                                        Aprobar
                                    </button>
 
                                    <button
                                        className="btn eliminar"
                                        onClick={() => rechazarSolicitud(solicitud.idsolicitud)}
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