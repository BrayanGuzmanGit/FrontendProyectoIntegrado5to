import { useEffect, useState } from "react";
import BASE_URL_INSPECTIONS from '@/services/api-inspections';

function InspeccionesPendientesProductor(){

    const [inspecciones, setInspecciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');

    const verPendientes = async () => {
        const token = localStorage.getItem('token');
        try {
            setCargando(true);
            setError(null);
            const respuesta = await fetch(`${BASE_URL_INSPECTIONS}/tecnica/asignadas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                }
            });
            if (!respuesta.ok) throw new Error('No se pudieron cargar las inspecciones pendientes.');
            const data = await respuesta.json();
            setInspecciones(data.data || data || []);
            setCargando(false);
        } catch (err) {
            console.error("Error en la petición:", err);
            setError(err.message);
            setCargando(false);
        }
    };

    useEffect(() => {
        document.title = "Mis Inspecciones";
        verPendientes();
    }, []);

    // ── Filtrar y ordenar ────────────────────────────────────────────────────
    const prioridadEstado = { 'en proceso': 1, 'pendiente': 2 };

    const solicitudesOrdenadas = [...inspecciones]
        .filter(s => {
            const tipo   = s.solicitud_inspeccion?.tipo_inspeccion?.toLowerCase() || '';
            const estado = s.estado?.toLowerCase() || '';
            const coincideTipo   = filtroTipo   === '' || tipo   === filtroTipo;
            const coincideEstado = filtroEstado === '' || estado === filtroEstado;
            return coincideTipo && coincideEstado;
        })
        .sort((a, b) => {
            const estadoA = a.estado?.toLowerCase() || '';
            const estadoB = b.estado?.toLowerCase() || '';
            return (prioridadEstado[estadoA] || 999) - (prioridadEstado[estadoB] || 999);
        });

    return (
        <div className="contenedor-usuarios">
            <h2>Inspecciones Pendientes</h2>

            <div className="filtros">
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                    <option value="">Todos los tipos</option>
                    <option value="inspeccion tecnica">Inspección Técnica</option>
                    <option value="inspeccion fitosanitaria">Inspección Fitosanitaria</option>
                </select>

                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="en proceso">En Proceso</option>
                    <option value="pendiente">Pendiente</option>
                </select>
            </div>

            <table className="tabla-usuarios">
                <thead>
                    <tr>
                        <th>Fecha de realización</th>
                        <th>Lugar de producción</th>
                        <th>Tipo de Inspección</th>
                        <th>Técnico encargado</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {cargando ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Cargando inspecciones pendientes...</td></tr>
                    ) : error ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Error: {error}</td></tr>
                    ) : solicitudesOrdenadas.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No hay inspecciones que coincidan con los filtros.</td></tr>
                    ) : (
                        solicitudesOrdenadas.map((inspeccion) => (
                            <tr key={inspeccion.idinspeccion}>
                                <td>{inspeccion.fechainicioinspeccion || '--'}</td>
                                <td>{inspeccion.lugarNombre || inspeccion.solicitud_inspeccion?.idlugarproduccion || '--'}</td>
                                <td>{inspeccion.solicitud_inspeccion?.tipo_inspeccion || '--'}</td>
                                <td>{inspeccion.tecnicoNombre || '--'}</td>
                                <td className={`estado ${inspeccion.estado?.toLowerCase()}`}>
                                    {inspeccion.estado || '--'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default InspeccionesPendientesProductor;