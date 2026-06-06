import { useEffect, useState } from "react";
import BASE_URL_INSPECTIONS from '@/services/api-inspections';
import InspeccionFitosanitariaGeneral from "@/Paginas/Inspecciones/InspeccionFitosanitariaGeneral";
import InspeccionTecnica from "@/Paginas/Inspecciones/InspeccionTecnica";
import { ArrowLeft } from "lucide-react";

function InspeccionesPendientesTecnico(){

    const [inspecciones, setInspecciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [inspeccionTecnicaSeleccionada, setInspeccionTecnicaSeleccionada] = useState(null);
    const [inspeccionFitoSeleccionada, setInspeccionFitoSeleccionada] = useState(null);
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
            console.log('Respuesta del backend:', data.data);
            setInspecciones(data.data || data || []);
            setCargando(false);
        } catch (err) {
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
            // ✅ Ruta corregida: solicitud_inspeccion.tipo_inspeccion
            const tipo   = s.solicitud_inspeccion?.tipo_inspeccion?.toLowerCase() || '';
            const estado = s.estado?.toLowerCase() || '';
            const coincideTipo   = filtroTipo   === '' || tipo   === filtroTipo;
            const coincideEstado = filtroEstado === '' || estado === filtroEstado;  
            return coincideTipo && coincideEstado;
        })
        .sort((a, b) => {
            const estadoA = a.estado?.toLowerCase() || '';
            const estadoB = b.estado?.toLowerCase() || '';
            return (prioridadEstado[estadoA] || 999) - (prioridadEstado[estadoB] || 999); // "en proceso" primero
        });

    const manejarAccionBotones = (inspeccion, tipo) => {
        if (tipo === 'inspeccion tecnica') {
            setInspeccionTecnicaSeleccionada(inspeccion);
        } else {
            setInspeccionFitoSeleccionada(inspeccion);
        }
    };

    const refrescarInspecciones = () => {
        verPendientes();
    };

    const regresarALista = () => {
        setInspeccionTecnicaSeleccionada(null);
        setInspeccionFitoSeleccionada(null);
    };

    if (inspeccionFitoSeleccionada !== null) {
        return (
            <>
                <div className="volver-container">
                    <button className="fab-back" onClick={regresarALista}><ArrowLeft size={26} /></button>
                </div>
                <InspeccionFitosanitariaGeneral
                    inspeccionCompleta={inspeccionFitoSeleccionada}
                    onVolver={regresarALista}
                    onRefresh={refrescarInspecciones}
                />
            </>
        );
    }

    if (inspeccionTecnicaSeleccionada !== null) {
        return (
            <>
                <div className="volver-container">
                    <button className="fab-back" onClick={regresarALista}><ArrowLeft size={26} /></button>
                </div>
                <InspeccionTecnica
                    idInspeccionSeleccionada={inspeccionTecnicaSeleccionada.idinspeccion}
                    nombreLugar={inspeccionTecnicaSeleccionada.lugarNombre}
                    onVolver={regresarALista}
                />
            </>
        );
    }

    return (
        <div className="contenedor-usuarios">
            <h2>Inspecciones Pendientes</h2>

            <div className="filtros">
                {/* Filtro tipo */}
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                    <option value="">Todos los tipos</option>
                    <option value="inspeccion tecnica">Inspección Técnica</option>
                    <option value="inspeccion fitosanitaria">Inspección Fitosanitaria</option>
                </select>

                {/* 🆕 Filtro estado */}
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
                        <th>direccion del lugar</th>
                        <th>municipio del lugar</th>
                        <th>Tipo de Inspección</th>
                        <th>Productor del lugar</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {cargando ? (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Cargando inspecciones pendientes...</td></tr>
                    ) : error ? (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Error: {error}</td></tr>
                    ) : solicitudesOrdenadas.length === 0 ? (   // ✅ usa la lista filtrada
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No hay inspecciones que coincidan con los filtros.</td></tr>
                    ) : (
                        solicitudesOrdenadas.map((inspeccion) => {   // ✅ usa la lista filtrada
                            const tipo = inspeccion.solicitud_inspeccion?.tipo_inspeccion?.toLowerCase() || '';
                            const estadoInspeccion = inspeccion.solicitud_inspeccion?.estado?.toLowerCase() || '';
                            let claseBotonBase = tipo === 'inspeccion tecnica' ? 'btn-tecnica' : 'btn-fitosanitaria';
                            const estaTerminada = ['terminada', 'finalizada', 'terminado'].includes(estadoInspeccion);
                            const claseEstiloFinal = estaTerminada ? '' : claseBotonBase;
                            const textoBoton = estaTerminada ? 'Finalizada' : 'Iniciar';
                            return (
                                <tr key={inspeccion.idinspeccion}>
                                    <td>{inspeccion.fechainicioinspeccion || '--'}</td>
                                    <td>{inspeccion.lugarNombre || '--'}</td>
                                    <td>{inspeccion.solicitud_inspeccion?.direccionLugar?.direccion || '--'}</td>
                                    <td>{inspeccion.solicitud_inspeccion?.direccionLugar?.municipio || '--'}</td>
                                    <td>{inspeccion.solicitud_inspeccion?.tipo_inspeccion || '--'}</td>
                                    <td>{inspeccion.productorNombre || '--'}</td>
                                    <td className={`estado ${inspeccion.estado?.toLowerCase()}`}>
                                        {inspeccion.estado || '--'}
                                    </td>
                                    <td>
                                        <button
                                            className={`btn-primary ${claseEstiloFinal}`}
                                            disabled={estaTerminada}
                                            onClick={() => manejarAccionBotones(inspeccion, tipo)}
                                        >{textoBoton}</button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default InspeccionesPendientesTecnico;