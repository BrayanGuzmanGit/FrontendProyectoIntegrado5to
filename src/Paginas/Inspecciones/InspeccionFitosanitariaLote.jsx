import { useEffect, useState } from "react";
import BASE_URL from '@/services/api-entidades';
import BASE_URL_INSPECTIONS from '@/services/api-inspections';
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import "./InspeccionesFito.css";

function InspeccionFitosanitariaLote({
    idinspeccion,
    lote,
    onVolver,
    onGuardado
}) {

    // ─── Estados de pantalla ────────────────────────────────────────────────
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState(null);

    // ─── Datos del lote ──────────────────────────────────────────────────────
    const [estadoFenologico, setEstadoFenologico] = useState(lote?.estadoFenologico || "");
    const [cantidadPlantas, setCantidadPlantas] = useState(lote?.plantasencontradas || 0);

    // ─── Plagas ──────────────────────────────────────────────────────────────
    const [plagas, setPlagas] = useState([]);
    const [contadores, setContadores] = useState({});

    // ─── Fetch plagas del cultivo ────────────────────────────────────────────
    const obtenerPlaguasDelCultivo = async () => {
        const token = localStorage.getItem('token');
        try {
            setCargando(true);
            setError(null);

            // Obtener las plagas que afectan este cultivo
            const respuesta = await fetch(
                `${BASE_URL}/crops/cultivo-plaga/${lote.uidcultivo}`,
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
            const plagasData = (data.data || []).map(item => ({
                id: item.plaga.id,
                nombre: item.plaga.nombre_comun,
                nombre_cientifico: item.plaga.nombre_cientifico,
                imagen_url: item.plaga.url_img,
                descripcion: item.plaga.descripcion
            }));

            setPlagas(plagasData);

            // ─── Cargar conteos previos ────────────────────────────────────
            const contadoresIniciales = {};
            const conteosExistentes = lote.conteo_plagas || [];

            plagasData.forEach(plaga => {
                // Buscar si ya existe un conteo para esta plaga
                const conteoExistente = conteosExistentes.find(c => c.idplaga === plaga.id);
                contadoresIniciales[plaga.id] = conteoExistente ? conteoExistente.plantasinfestadas : 0;
            });

            setContadores(contadoresIniciales);
            setCargando(false);

        } catch (err) {
            console.error("Error cargando datos del lote:", err);
            setError(err.message);
            setCargando(false);
        }
    };

    useEffect(() => {
        if (!lote?.uidcultivo) {
            setCargando(false);
            return;
        }
        obtenerPlaguasDelCultivo();
    }, [lote?.uidcultivo]);

    // ─── Guardar conteos de plagas ───────────────────────────────────────────
    const guardarProcesoLote = async () => {
        const token = localStorage.getItem('token');
        try {
            setGuardando(true);
            setError(null);
            setMensajeExito(null);

            // Construir array de conteos de plagas
            const conteosPlagas = plagas
                .filter(plaga => contadores[plaga.id] > 0)
                .map(plaga => ({
                    idplaga: plaga.id,
                    plantasinfestadas: contadores[plaga.id]
                }));

            const body = {
                estadoFenologico: estadoFenologico || null,
                plantasencontradas: cantidadPlantas,
                porcentaje_infestacion: porcentajeInfestacion,
                conteo_plagas: conteosPlagas
            };
            console.log("Enviando datos al backend:", body);
            const respuesta = await fetch(
                `${BASE_URL_INSPECTIONS}/fitosanitaria/${idinspeccion}/lote/${lote.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(body)
                }
            );

            const data = await respuesta.json();
            if (!respuesta.ok) {
                throw new Error(data.message || "Error al guardar el proceso del lote");
            }

            setMensajeExito("✓ Proceso del lote guardado exitosamente");
            
            // Notificar al componente padre que se guardó
            setTimeout(() => {
                if (onGuardado) {
                    onGuardado(data.data);
                }
            }, 1000);

        } catch (err) {
            console.error("Error guardando proceso:", err);
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    // ─── Contadores ──────────────────────────────────────────────────────────
    const incrementar = (idPlaga) => {
        setContadores(prev => {
            const actual = prev[idPlaga] || 0;
            if (actual >= cantidadPlantas) return prev;
            return { ...prev, [idPlaga]: actual + 1 };
        });
    };

    const decrementar = (idPlaga) => {
        setContadores(prev => {
            const actual = prev[idPlaga] || 0;
            if (actual <= 0) return prev;
            return { ...prev, [idPlaga]: actual - 1 };
        });
    };

    // ─── Cálculo infestación ─────────────────────────────────────────────────
    const totalInfestadas = Math.min(
        Object.values(contadores).reduce((sum, val) => sum + val, 0),
        cantidadPlantas
    );
    const porcentajeInfestacion = cantidadPlantas > 0
        ? Math.min(((totalInfestadas / cantidadPlantas) * 100), 100).toFixed(1)
        : 0;

    const hayAlerta = parseFloat(porcentajeInfestacion) >= 20;

    const colorBarra =
        porcentajeInfestacion < 10 ? "#4caf50" :
        porcentajeInfestacion < 20 ? "#ff9800" :
        "#e53935";

    // ─── Agrupación de plagas en filas de máximo 3 ───────────────────────────
    const filasDePlagas = [];
    for (let i = 0; i < plagas.length; i += 3) {
        filasDePlagas.push(plagas.slice(i, i + 3));
    }

    // ─── Renders condicionales ───────────────────────────────────────────────
    if (cargando) return <div className="estado-pantalla">Cargando datos del lote...</div>;
    if (error && plagas.length === 0) return (
        <div className="estado-pantalla error-texto">
            <div>Error: {error}</div>
            <button onClick={onVolver} style={{ marginTop: '10px' }}>Volver</button>
        </div>
    );

    // ─── Vista principal ─────────────────────────────────────────────────────
    return (
        <div className="contenedor-inspecciones contenedor-lote-fito">

            {/* Botón Volver */}
            <div className="volver-container">
                <button className="fab-back" onClick={onVolver} title="Volver">
                    <ArrowLeft size={28} />
                </button>
            </div>

            {/* ── CABECERA DEL LOTE ── */}
            <div className="cabecera-lote-card">

                {/* Bloque central: ID del lote + campos del formulario */}
                <div className="bloque-central-cabecera">
                    <h2 className="titulo-lote">Lote {lote.cultivo.nombre_comun?.substring(0, 8)}</h2>

                    <div className="campo-formulario-lote">
                        <label className="label-campo">Estado Fenológico:</label>
                        <div className="input-con-tooltip">
                            <input
                                type="text"
                                className="input-lote"
                                value={estadoFenologico}
                                onChange={(e) => setEstadoFenologico(e.target.value)}
                                placeholder="Ej: Floración, Fructificación, Crecimiento..."
                            />
                            <span className="tooltip-fenologico">
                                Fase de desarrollo del cultivo en este lote
                            </span>
                        </div>
                    </div>

                    <div className="campo-formulario-lote">
                        <label className="label-campo">Plantas encontradas:</label>
                        <input
                            type="number"
                            className="input-lote input-numero"
                            value={cantidadPlantas}
                            onChange={(e) => setCantidadPlantas(parseInt(e.target.value) || 0)}
                            min={0}
                            placeholder="Cantidad de plantas"
                        />
                    </div>
                </div>

            </div>

            {/* ── SECCIÓN DE PLAGAS ── */}
            <div className="seccion-plagas-card">
                <h3 className="titulo-seccion-plagas">Conteo de Plagas</h3>
                <p className="subtitulo-plagas">
                    Registre la cantidad de plantas infestadas por cada tipo de plaga
                </p>

                {plagas.length === 0 ? (
                    <p className="sin-plagas">No hay plagas asociadas a este cultivo.</p>
                ) : (
                    filasDePlagas.map((fila, indexFila) => (
                        <div key={indexFila} className="fila-plagas">
                            {fila.map((plaga) => (
                                <div key={plaga.id} className="tarjeta-plaga-conteo">

                                    <div className="nombre-plaga">{plaga.nombre}</div>
                                    <div className="cientifico-plaga">{plaga.nombre_cientifico}</div>
                                    {plaga.descripcion && (
                                        <div className="descripcion-plaga">{plaga.descripcion}</div>
                                    )}

                                    <div className="contenedor-imagen-plaga">
                                        {plaga.imagen_url ? (
                                            <img
                                                src={plaga.imagen_url}
                                                alt={plaga.nombre}
                                                className="img-plaga"
                                            />
                                        ) : (
                                            <div className="img-plaga placeholder-plaga">🪲</div>
                                        )}

                                        {/* Controles del contador */}
                                        <div className="controles-contador">
                                            <button
                                                className="btn-contador decrementar"
                                                onClick={() => decrementar(plaga.id)}
                                                disabled={(contadores[plaga.id] || 0) <= 0}
                                                title="Disminuir"
                                            >
                                                −
                                            </button>
                                            <span className="valor-contador">
                                                {contadores[plaga.id] || 0}
                                            </span>
                                            <button
                                                className="btn-contador incrementar"
                                                onClick={() => incrementar(plaga.id)}
                                                disabled={contadores[plaga.id] >= cantidadPlantas}
                                                title={`Máximo: ${cantidadPlantas} plantas`}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    ))
                )}

                {/* ── BARRA DE INFESTACIÓN ── */}
                {plagas.length > 0 && (
                    <>
                        <div className="bloque-infestacion">
                            <span className="label-infestacion">Porcentaje de infestación:</span>
                            <div className="barra-wrapper">
                                <div
                                    className="barra-progreso"
                                    style={{
                                        width: `${porcentajeInfestacion}%`,
                                        backgroundColor: colorBarra,
                                        transition: 'width 0.4s ease, background-color 0.4s ease'
                                    }}
                                />
                                <span className="porcentaje-label" style={{ color: colorBarra }}>
                                    {porcentajeInfestacion}%
                                </span>
                            </div>
                        </div>

                        {/* ── ALERTA ── */}
                        {hayAlerta && (
                            <div className="alerta-infestacion">
                                <AlertTriangle size={20} />
                                <span>
                                    <strong>¡Nivel de infestación alto!</strong> El {porcentajeInfestacion}% de plantas
                                    están infestadas. Se recomienda tomar medidas de control.
                                </span>
                            </div>
                        )}
                    </>
                )}

            </div>

            {/* ── FEEDBACK ── */}
            {error && <div className="mensaje-error">❌ {error}</div>}
            {mensajeExito && <div className="mensaje-exito"><CheckCircle size={18} /> {mensajeExito}</div>}

            {/* ── BOTONES ── */}
            <div className="bloque-botones-finales">
                <button
                    className="btn-final guardar"
                    onClick={guardarProcesoLote}
                    disabled={guardando || cantidadPlantas === 0}
                >
                    {guardando ? "⏳ Guardando..." : "💾 Guardar Proceso del Lote"}
                </button>
                <button
                    className="btn-final secundario"
                    onClick={onVolver}
                    disabled={guardando}
                >
                    ← Volver sin guardar
                </button>
            </div>

        </div>
    );
}

export default InspeccionFitosanitariaLote;