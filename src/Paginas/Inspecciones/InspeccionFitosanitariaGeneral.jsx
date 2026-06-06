import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import BASE_URL_INSPECTIONS from '@/services/api-inspections';
import BASE_URL from '@/services/api-entidades';
import "./InspeccionesFito.css";
import "@/Paginas/GestionTerrenos/GestionarTerrenos.css";
import InspeccionFitosanitariaLote from "./InspeccionFitosanitariaLote";

function InspeccionFitosanitariaGeneral({ inspeccionCompleta, onVolver, onRefresh }) {

    const [loteSeleccionado, setLoteSeleccionado] = useState(null);
    const [terminandoInspeccion, setTerminandoInspeccion] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loteActualizado, setLoteActualizado] = useState(null);
    const [lotes, setLotes] = useState([]);
    const [cargandoLotes, setCargandoLotes] = useState(true);

    // Datos de la inspección
    const idinspeccion = inspeccionCompleta?.idinspeccion;
    const idlugarproduccion = inspeccionCompleta?.solicitud_inspeccion?.idlugarproduccion;
    const nombreLugar = inspeccionCompleta?.lugarNombre;
    const nombreProductor = inspeccionCompleta?.productorNombre;
    const tecnicoNombre = inspeccionCompleta?.tecnicoNombre;

    // ─── Cargar lotes del lugar ──────────────────────────────────────────
    useEffect(() => {
        const obtenerLotes = async () => {
            const token = localStorage.getItem('token');
            try {
                setCargandoLotes(true);
                setError(null);
                
                const respuesta = await fetch(
                    `${BASE_URL}/locations/lotes/${idlugarproduccion}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    }
                );

                if (!respuesta.ok) {
                    const errorData = await respuesta.json();
                    throw new Error(errorData.message || `Error ${respuesta.status}`);
                }

                const data = await respuesta.json();
                const lotesData = data.data || [];
                
                // Combinar lotes con datos de inspeccion_lote (estadoFenologico, conteo_plagas, etc)
                const lotesCombinados = lotesData.map(lote => {
                    const inspeccionLote = inspeccionCompleta?.inspeccion_lote?.find(
                        il => il.uidlote === lote.id
                    );
                    return {
                        ...lote,
                        // Datos específicos de la inspección
                        estadoFenologico: inspeccionLote?.estadoFenologico,
                        plantasencontradas: inspeccionLote?.plantasencontradas,
                        estado: inspeccionLote?.estado,
                        conteo_plagas: inspeccionLote?.conteo_plagas || []
                    };
                });
                console.log('Lotes combinados con datos de inspección:', lotesCombinados);
                setLotes(lotesCombinados);
                setCargandoLotes(false);

            } catch (err) {
                console.error('Error cargando lotes:', err);
                setError(err.message);
                setCargandoLotes(false);
            }
        };

        if (idlugarproduccion) {
            obtenerLotes();
        }
    }, [idlugarproduccion, inspeccionCompleta]);

    // ─── Calcular si todos los lotes están terminados ─────────────────────
    const todosLotesTerminados = lotes.length > 0 && 
        lotes.every(lote => lote.estado?.toLowerCase() === 'terminada');

    const lotesTerminados = lotes.filter(l => l.estado?.toLowerCase() === 'terminada').length;
    const lotesTotales = lotes.length;

    // ─── Terminar inspección fitosanitaria ───────────────────────────────
    const terminarInspeccion = async () => {
        const token = localStorage.getItem('token');
        try {
            if (!window.confirm('¿Está seguro que desea terminar esta inspección fitosanitaria? Esta acción no se puede deshacer.')) {
                return;
            }

            setTerminandoInspeccion(true);
            setError(null);

            const respuesta = await fetch(
                `${BASE_URL_INSPECTIONS}/fitosanitaria/${idinspeccion}/terminar`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ estado: 'Terminada' })
                }
            );

            const data = await respuesta.json();
            if (!respuesta.ok) {
                throw new Error(data.message || 'Error al terminar la inspección');
            }

            setSuccessMessage('✓ Inspección fitosanitaria completada exitosamente');
            setTimeout(() => {
                if (onRefresh) onRefresh();
                onVolver();
            }, 2000);

        } catch (err) {
            console.error('Error terminando inspección:', err);
            setError(err.message);
        } finally {
            setTerminandoInspeccion(false);
        }
    };

    // ─── Al guardar un lote, actualizar la data local ─────────────────────
    const handleLoteGuardado = (loteActualizadoData) => {
        setLoteActualizado(loteActualizadoData);
        setLoteSeleccionado(null);
    };

    // ─── Si un lote fue seleccionado, mostrar el componente de edición ────
    if (loteSeleccionado) {
        return (
            <InspeccionFitosanitariaLote
                idinspeccion={idinspeccion}
                lote={loteSeleccionado}
                onVolver={() => setLoteSeleccionado(null)}
                onGuardado={handleLoteGuardado}
            />
        );
    }

    // ─── Vista principal: listado de lotes ───────────────────────────────
    return (
        <div className="contenedor-inspecciones">
            
            {/* Cabecera general */}
            <div className="cabecera-inspeccion-fito">
                <div>
                    <h2 className="card-title">
                        Inspección Fitosanitaria: {nombreLugar}
                    </h2>
                    <div className="info-inspeccion-fito">
                        <p><strong>Productor:</strong> {nombreProductor}</p>
                        <p><strong>Técnico asignado:</strong> {tecnicoNombre}</p>
                        <p><strong>Estado general:</strong> 
                            <span className={`estado-badge ${inspeccionCompleta?.estado?.toLowerCase()}`}>
                                {inspeccionCompleta?.estado}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Barra de progreso ─────────────────────────────────────────────*/}
            <div className="barra-progreso-lotes">
                <div className="stats-progreso">
                    <span className="stat-item">
                        <CheckCircle size={20} className="icon-success" />
                        {lotesTerminados} de {lotesTotales} lotes completados
                    </span>
                    <span className="stat-item">
                        <Clock size={20} className="icon-warning" />
                        {lotesTotales - lotesTerminados} lotes pendientes
                    </span>
                </div>
                <div className="barra-progreso-visual">
                    <div
                        className="barra-relleno"
                        style={{
                            width: `${lotesTotales > 0 ? (lotesTerminados / lotesTotales) * 100 : 0}%`,
                            backgroundColor: todosLotesTerminados ? '#4caf50' : '#2196F3'
                        }}
                    />
                </div>
            </div>

            {/* Mensajes de feedback ───────────────────────────────────────────*/}
            {error && <div className="mensaje-error"><AlertCircle size={20} /> {error}</div>}
            {successMessage && <div className="mensaje-exito"><CheckCircle size={20} /> {successMessage}</div>}

            {/* Cabecera de tabla ──────────────────────────────────────────────*/}
            <div className="cabecera-global-grid-fito">
                <div className="col-cultivo">Cultivo / Lote</div>
                <div className="col-fenologico">Est. Fenológico</div>
                <div className="col-plantas">Plantas</div>
                <div className="col-estado">Estado</div>
                <div className="col-progreso">Progreso Plagas</div>
                <div className="col-accion">Acción</div>
            </div>

            {/* Listado de lotes ──────────────────────────────────────────────*/}
            {cargandoLotes ? (
                <div className="sin-lotes">
                    <p>Cargando lotes...</p>
                </div>
            ) : lotes.length === 0 ? (
                <div className="sin-lotes">
                    <p>No hay lotes registrados para esta inspección.</p>
                </div>
            ) : (
                lotes.map((lote) => {
                    const conteosPlagas = lote.conteo_plagas || [];
                    const totalPlantasInfestadas = conteosPlagas.reduce(
                        (sum, c) => sum + (c.plantasinfestadas || 0),
                        0
                    );
                    const porcentajeInfestacion = lote.plantasencontradas > 0
                        ? ((totalPlantasInfestadas / lote.plantasencontradas) * 100).toFixed(1)
                        : 0;

                    const estaTerminado = lote.estado?.toLowerCase() === 'terminada';
                    const tieneConteos = conteosPlagas.length > 0;

                    return (
                        console.log(lote),
                        <div key={lote.id} className="tarjeta-lote-inspeccion">

                            {/* Información del lote */}
                            <div className="fila-lote-registro-fito">

                                {/* Cultivo / Lote */}
                                <div className="col-cultivo">
                                    <div className="lote-numero">
                                        Lote {lote.cultivo.nombre_comun?.substring(0, 8)}
                                    </div>
                                    <div className="lote-detalle">
                                        {lote.estadoFenologico ? `Estado: ${lote.estadoFenologico}` : 'Sin detalles'}
                                    </div>
                                </div>

                                {/* Estado fenológico */}
                                <div className="col-fenologico">
                                    {lote.estadoFenologico || '--'}
                                </div>

                                {/* Plantas encontradas */}
                                <div className="col-plantas">
                                    {lote.plantasencontradas || 0}
                                </div>

                                {/* Estado del lote */}
                                <div className="col-estado">
                                    <span className={`badge-estado-fito ${estaTerminado ? 'completado' : 'pendiente'}`}>
                                        {estaTerminado ? '✓ Completado' : '⏳ Pendiente'}
                                    </span>
                                </div>

                                {/* Progreso de plagas */}
                                <div className="col-progreso">
                                    {tieneConteos ? (
                                        <div className="progreso-plagas-detalle">
                                            <span className="porcentaje-riesgo">{porcentajeInfestacion}%</span>
                                            <span className="detalles-plagas">
                                                {conteosPlagas.length} plagas contadas
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="sin-conteos">Sin conteos</span>
                                    )}
                                </div>

                                {/* Botón acción */}
                                <div className="col-accion">
                                    <button
                                        className={`btn-editar-lote ${estaTerminado ? 'completado' : 'activo'}`}
                                        onClick={() => setLoteSeleccionado(lote)}
                                    >
                                        {estaTerminado ? '✓ Ver' : 'Editar'}
                                    </button>
                                </div>

                            </div>

                        </div>
                    );
                })
            )}

            {/* Botón de terminar inspección ──────────────────────────────────*/}
            <div className="bloque-botones-finales">
                {!todosLotesTerminados && (
                    <div className="advertencia-terminar">
                        <AlertCircle size={20} />
                        <p>Complete todos los lotes ({lotesTerminados}/{lotesTotales}) para poder terminar la inspección</p>
                    </div>
                )}
                
                <button
                    className={`btn-final terminar-inspeccion ${todosLotesTerminados ? 'activo' : 'deshabilitado'}`}
                    onClick={terminarInspeccion}
                    disabled={!todosLotesTerminados || terminandoInspeccion}
                >
                    {terminandoInspeccion ? '⏳ Terminando...' : '✓ Terminar Inspección'}
                </button>
            </div>

        </div>
    );
}

export default InspeccionFitosanitariaGeneral;