import { useEffect, useState } from "react";
import BASE_URL from '@/services/api-entidades';
import { ArrowLeft, AlertTriangle } from "lucide-react";
import "./InspeccionesFito.css";

function InspeccionFitosanitariaLote({
    idInspeccionSeleccionada,
    idLote,
    id_cultivo,
    numero_lote,
    nombreCultivo,
    nombreCientifico,
    imagenCultivo,
    onVolver
}) {

    // ─── Estados de pantalla ────────────────────────────────────────────────
    const [cargando, setCargando]           = useState(true);
    const [guardando, setGuardando]         = useState(false);
    const [error, setError]                 = useState(null);
    const [mensajeExito, setMensajeExito]   = useState(null);

    // ─── Datos del lote ──────────────────────────────────────────────────────
    const [estadoFenologico, setEstadoFenologico] = useState("");
    const [cantidadPlantas, setCantidadPlantas]   = useState(0);

    // ─── Plagas ──────────────────────────────────────────────────────────────
    const [plagas, setPlagas]       = useState([]);
    const [contadores, setContadores] = useState({});

    // ─── Fetch ───────────────────────────────────────────────────────────────
    const obtenerDatosLote = async () => {
        const token = localStorage.getItem('token');
        try {
            setCargando(true);
            setError(null);
            console.log("TOKEN:", token);
            console.log("URL:", `${BASE_URL}/crops/cultivo-plaga/${id_cultivo}`);

            const respuesta = await fetch(
                `${BASE_URL}/crops/cultivo-plaga/${id_cultivo}`,
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
                console.log("ERROR BACKEND:", errorData);
                throw new Error(errorData.message || `Error ${respuesta.status}`);
            }

            const data = await respuesta.json();
            console.log(JSON.stringify(data, null, 2));
            
            // Procesar plagas: extraer del objeto anidado y transformar nombres
            const plagasRecibidas = (data.data || []).map(item => ({
                id: item.plaga.id,
                nombre: item.plaga.nombre_comun,
                nombre_cientifico: item.plaga.nombre_cientifico,
                imagen_url: item.plaga.url_img,
                descripcion: item.plaga.descripcion,
                contador: 0
            }));
            
            setPlagas(plagasRecibidas);

            // Inicializar contadores en 0 para cada plaga
            const contadoresIniciales = {};
            plagasRecibidas.forEach(plaga => {
                contadoresIniciales[plaga.id] = 0;
            });
            setContadores(contadoresIniciales);

        } catch (err) {
            console.error("Error cargando datos del lote:", err);
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (!id_cultivo) {
            setCargando(false);
            return;
        }
        obtenerDatosLote();
    }, [id_cultivo]);

    // ─── Guardar ─────────────────────────────────────────────────────────────
    const guardarInspeccion = async () => {
        const token = localStorage.getItem('token');
        try {
            setGuardando(true);
            setError(null);
            setMensajeExito(null);

            const plagasConContadores = plagas.map(plaga => ({
                id: plaga.id,
                contador: contadores[plaga.id] || 0
            }));

            const body = {
                estado_fenologico: estadoFenologico,
                cantidad_plantas: cantidadPlantas,
                plagas: plagasConContadores
            };

            const respuesta = await fetch(
                `${BASE_URL}/fitosanitaria/${idInspeccionSeleccionada}/lote/${idLote}`,
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
            if (!respuesta.ok) throw new Error(data.message || "Error al guardar la inspección.");

            setMensajeExito("Inspección guardada correctamente.");

        } catch (err) {
            console.error("Error guardando inspección:", err);
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
    if (error && plagas.length === 0) return <div className="estado-pantalla error-texto">Error: {error}</div>;

    // ─── Vista principal ─────────────────────────────────────────────────────
    return (
        <div className="contenedor-inspecciones contenedor-lote-fito">

            {/* Botón Volver */}
            <div className="volver-container">
                <button className="fab-back" onClick={onVolver}>
                    <ArrowLeft size={28} />
                </button>
            </div>

            {/* ── CABECERA DEL LOTE ── */}
            <div className="cabecera-lote-card">

                {/* Bloque izquierdo: info del cultivo */}
                <div className="columna-cultivo-info">
                    {imagenCultivo && (
                        <img
                            src={imagenCultivo}
                            alt={nombreCultivo}
                            className="img-cultivo"
                        />
                    )}
                    <div className="texto-cultivo-cabecera">
                        <span className="nombre-cultivo">{nombreCultivo}</span>
                        <span className="cientifico-cultivo">{nombreCientifico}</span>
                    </div>
                </div>

                {/* Separador vertical */}
                <div className="separador-cabecera" />

                {/* Bloque central: ID del lote + campos del formulario */}
                <div className="bloque-central-cabecera">
                    <h2 className="titulo-lote">Lote Nro {numero_lote}</h2>

                    <div className="campo-formulario-lote">
                        <label className="label-campo">Estado Fenológico:</label>
                        <div className="input-con-tooltip">
                            <input
                                type="text"
                                className="input-base"
                                value={estadoFenologico}
                                onChange={(e) => setEstadoFenologico(e.target.value)}
                                placeholder="campo para rellenar"
                            />
                            <span className="tooltip-fenologico">
                                El estado fenológico es la fase de crecimiento de la planta. Describa el estado general del cultivo.
                            </span>
                        </div>
                    </div>

                    <div className="campo-formulario-lote">
                        <label className="label-campo">Cantidad de plantas encontradas:</label>
                        <input
                            type="number"
                            className="input-base input-numero"
                            value={cantidadPlantas}
                            min={0}
                            onChange={(e) => setCantidadPlantas(parseInt(e.target.value) || 0)}
                            placeholder="campo para rellenar"
                        />
                    </div>
                </div>

            </div>

            {/* ── SECCIÓN DE PLAGAS ── */}
            <div className="seccion-plagas-card">
                <h3 className="titulo-seccion-plagas">Plagas</h3>
                <p className="subtitulo-plagas">
                    Indique el tipo de plaga(s) que encontró por cada planta examinada
                </p>

                {plagas.length === 0 ? (
                    <p className="sin-plagas">No hay plagas asociadas a este cultivo.</p>
                ) : (
                    filasDePlagas.map((fila, indexFila) => (
                        <div key={indexFila} className="fila-plagas">
                            {fila.map((plaga) => (
                                <div key={plaga.id} className="tarjeta-plaga">

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

                                        {/* Controles del contador superpuestos sobre la imagen */}
                                        <div className="controles-contador">
                                            <button
                                                className="btn-contador incrementar"
                                                onClick={() => incrementar(plaga.id)}
                                                disabled={contadores[plaga.id] >= cantidadPlantas}
                                                title={`Máximo: ${cantidadPlantas} plantas`}
                                            >
                                                +
                                            </button>
                                            <span className="valor-contador">
                                                {contadores[plaga.id] || 0}
                                            </span>
                                            <button
                                                className="btn-contador decrementar"
                                                onClick={() => decrementar(plaga.id)}
                                                disabled={(contadores[plaga.id] || 0) <= 0}
                                            >
                                                −
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    ))
                )}

                {/* ── BARRA DE INFESTACIÓN ── */}
                <div className="bloque-infestacion">
                    <span className="label-infestacion">Porcentaje de infestación del lote:</span>
                    <div className="barra-wrapper">
                        <div
                            className="barra-progreso"
                            style={{
                                width: `${porcentajeInfestacion}%`,
                                backgroundColor: colorBarra,
                                transition: 'width 0.4s ease, background-color 0.4s ease'
                            }}
                        />
                        <span
                            className="porcentaje-label"
                            style={{ color: colorBarra }}
                        >
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
                            del lote están infestadas.
                        </span>
                    </div>
                )}

            </div>

            {/* ── FEEDBACK ── */}
            {error && <div className="mensaje-error">{error}</div>}
            {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}

            {/* ── BOTÓN GUARDAR ── */}
            <div className="bloque-botones-finales">
                <button
                    className="btn-final guardar"
                    onClick={guardarInspeccion}
                    disabled={guardando || cantidadPlantas === 0}
                >
                    {guardando ? "Guardando..." : "Guardar Inspección"}
                </button>
            </div>

        </div>
    );
}

export default InspeccionFitosanitariaLote;