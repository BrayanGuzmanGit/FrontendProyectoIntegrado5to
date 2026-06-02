import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import BASE_URL from '@/services/api-entidades';
import "./InspeccionesFito.css";
import "@/Paginas/GestionTerrenos/GestionarTerrenos.css";
import InspeccionFitosanitariaLote from "./InspeccionFitosanitariaLote";

function InspeccionFitosanitariaGeneral({ idLugarProduccion, nombreLugar}) {

    const [datosLugar, setDatosLugar] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);

    const obtenerDatosLugar = async () => {
        const token = localStorage.getItem('token');
        try {
            setCargando(true);
            setError(null);
            const respuesta = await fetch(`${BASE_URL}/locations/lotes/${idLugarProduccion}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!respuesta.ok) {
                throw new Error('No se pudo obtener información del formulario de Inspección Fitosanitaria.');
            }

            const data = await respuesta.json();
            console.log(JSON.stringify(data, null, 2));
            setDatosLugar(data.data || data);
            setCargando(false);

        } catch (err) {
            console.error("Error cargando formulario:", err);
            setError(err.message);
            setCargando(false);
        }
    };

    useEffect(() => {
        if (idLugarProduccion) {
            obtenerDatosLugar();
        }
    }, [idLugarProduccion]);

    if (cargando) return <div>Cargando datos del formulario...</div>;
    if (error) return <div className="error-texto">Error: {error}</div>;
    if (!datosLugar || datosLugar.length === 0) {
        return <div>No hay cultivos registrados para este lugar.</div>;
    }

    if (loteSeleccionado) {
        return (
            <InspeccionFitosanitariaLote
                idLugarProduccion={idLugarProduccion}
                idLote={loteSeleccionado.id}
                numero_lote={loteSeleccionado.numero_lote}
                id_cultivo={loteSeleccionado.uidcultivo}
                nombreCultivo={loteSeleccionado.nombreCultivo}
                nombreCientifico={loteSeleccionado.nombreCientifico}
                imagenCultivo={loteSeleccionado.url_img}
                onVolver={() => setLoteSeleccionado(null)}
            />
        );
    }

    // Agrupar lotes por cultivo
    const cultivosAgrupados = datosLugar.reduce((grupos, lote) => {
        const clave = lote.cultivo?.nombre_comun || 'Sin cultivo';
        if (!grupos[clave]) {
            grupos[clave] = {
                nombre_comun: lote.cultivo?.nombre_comun,
                nombre_cientifico: lote.cultivo?.nombre_cientifico,
                url_img: lote.cultivo?.url_img,
                lotes: []
            };
        }
        grupos[clave].lotes.push(lote);
        return grupos;
    }, {});

    const cultivosArray = Object.values(cultivosAgrupados);

    // Totales generales
    const totalExtensionGeneral = datosLugar.reduce(
        (total, lote) => total + parseFloat(lote.area || 0), 0
    ).toFixed(2);

    const totalPlantasGeneral = datosLugar.reduce(
        (total, lote) => total + parseInt(lote.cantidad_plantas || 0), 0
    );

    return (
        <div className="contenedor-inspecciones">
            <h2 className="card-title">
                Inspección del Lugar: {nombreLugar}
            </h2>

            {/* Cabecera */}
            <div className="cabecera-global-grid">
                <div className="txt-izquierda">Cultivo</div>
                <div>Lote</div>
                <div>Fecha Siembra</div>
                <div>Plantas</div>
                <div>Área [Ha]</div>
                <div>Inspección</div>
                <div>Acción</div>
            </div>

            {/* BLOQUES POR CULTIVO */}
            {cultivosArray.map((cultivo, index) => {

                const subtotalPlantas = cultivo.lotes.reduce(
                    (sum, l) => sum + parseInt(l.cantidad_plantas || 0), 0
                );

                const subtotalExtension = cultivo.lotes.reduce(
                    (sum, l) => sum + parseFloat(l.area || 0), 0
                ).toFixed(2);

                return (
                    <div key={index} className="tarjeta-cultivo-bloque">

                        {/* Columna izquierda: nombre + imagen */}
                        <div className="columna-cultivo-info">
                            <div className="nombre-cultivo">
                                {cultivo.nombre_comun}
                            </div>
                            <div className="cientifico-cultivo">
                                {cultivo.nombre_cientifico || ''}
                            </div>
                            {cultivo.url_img && (
                                <div className="img-cultivo">
                                    <img className="img-cultivo" src={cultivo.url_img} alt={cultivo.nombre_comun} />
                                </div>
                            )}
                        </div>

                        {/* Columna derecha: filas de lotes + subtotal */}
                        <div className="columna-lotes-listado">

                            {cultivo.lotes.map((lote) => (
                                <div key={lote.id} className="fila-lote-registro">

                                    <div className="id-destacado">
                                        {lote.numero_lote}
                                    </div>

                                    <div> {lote.fechasiembra || '--'} </div>

                                    <div> {Number(lote.cantidad_plantas || 0).toLocaleString()} </div>

                                    <div>  {lote.area || 0} Ha </div>

                                    <div>
                                        <span className={`badge-estado ${lote.estado?.toLowerCase() === 'terminada' ? 'terminada' : 'pendiente'}`}>
                                            {lote.estado || '—'}
                                        </span>
                                    </div>

                                    <div>
                                        <button
                                            className="btn-ver-lote"
                                            onClick={() =>
                                                setLoteSeleccionado({
                                                    id: lote.id,
                                                    numero_lote: lote.numero_lote,
                                                    uidcultivo: lote.uidcultivo,
                                                    nombreCultivo: cultivo.nombre_comun,
                                                    nombreCientifico: cultivo.nombre_cientifico,
                                                    url_img: cultivo.url_img
                                                })
                                            }
                                        >
                                            Ver
                                        </button>
                                    </div>

                                </div>
                            ))}

                            {/* Fila subtotal del cultivo */}
                            <div className="fila-subtotal-tarjeta">
                                <div className="txt-subtotal">Subtotal</div>
                                <div></div>
                                <div>{subtotalPlantas.toLocaleString()}</div>
                                <div>{subtotalExtension} Ha</div>
                                <div></div>
                                <div></div>
                            </div>

                        </div>
                    </div>
                );
            })}

            {/* Barra de total general */}
            <div className="barra-total-general">
                <div className="txt-izquierda">Total General</div>
                <div></div>
                <div></div>
                <div>{totalPlantasGeneral.toLocaleString()} plantas</div>
                <div>{totalExtensionGeneral} Ha</div>
                <div></div>
                <div></div>
            </div>

        </div>
    );
}

export default InspeccionFitosanitariaGeneral;