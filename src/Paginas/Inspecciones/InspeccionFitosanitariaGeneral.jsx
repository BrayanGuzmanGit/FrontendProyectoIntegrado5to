import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

// ==========================================================================
// CONFIGURACIONES, SERVICIOS Y ESTILOS
// ==========================================================================
import BASE_URL_INSPECTIONS from '@/services/api-inspections';
import "./InspeccionesFito.css"; // Estilos específicos de la sección de inspecciones
import "@/Paginas/GestionTerrenos/GestionarTerrenos.css"; // Estilos globales de tablas reutilizados

/**
 * COMPONENTE: PestanaGeneral
 * Renderiza la matriz de inspección fitosanitaria agrupada por cultivos y lotes utilizando tablas tradicionales.
 */
function PestanaGeneral({ idInspeccionSeleccionada }) {
    
    // Parte de la lógica
    const [datosLugar, setDatosLugar] = useState(null); // Contenedor del objeto de la finca { lugar, cultivos: [...] }
    const [cargando, setCargando] = useState(true);     // Estado controlador de la pantalla de espera
    const [error, setError] = useState(null);           // Captura de mensajes de error del servidor

    // Parte de la petición API fetch para comunicarse con el backend
    const obtenerDatosLugar = async () => {
        const token = localStorage.getItem('token');
        try {
            setCargando(true);
            setError(null);
            // Consultamos el endpoint extendiendo la URL base (agrega el slash final si tu endpoint lo requiere)
            const respuesta = await fetch(`${BASE_URL_INSPECTIONS}/${idInspeccionSeleccionada}`, {
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
            // Asignación segura considerando si el backend responde con un envoltorio '.data' o el objeto plano
            setDatosLugar(data.data || data); 
            setCargando(false);

        } catch (err) {
            console.error("Error cargando formulario:", err);
            setError(err.message);
            setCargando(false);
        }
    };

    // Dispara la consulta apenas se monte el componente en pantalla o cambie la inspección seleccionada
    useEffect(() => {
        if (idInspeccionSeleccionada) {
            obtenerDatosLugar();
        }
    }, [idInspeccionSeleccionada]);

    // ==========================================================================
    // MANEJO DE ESCENARIOS DE RENDERIZADO VISUAL (TEMPLATES DE CONTROL)
    // ==========================================================================
    
    // CASO A: Procesando la solicitud asíncrona
    if (cargando) {
        return <div>Cargando datos del formulario...</div>;
    }
    // CASO B: Error crítico en la comunicación o credenciales
    if (error) {
        return <div>Error: {error}</div>;
    }
    // CASO C: Respuesta vacía o estructura incompatible
    if (!datosLugar || !datosLugar.cultivos) {
        return <div>No hay cultivos registrados para este lugar.</div>;
    }
    
    // Suma la extensión acumulada de todos los lotes de todos los cultivos
    const extensionTotalGeneral = datosLugar.cultivos.reduce((totalGlobal, cultivo) => {
        const sumaLotesCultivo = cultivo.lotes?.reduce((subTotal, lote) => subTotal + parseFloat(lote.extension || 0), 0) || 0;
        return totalGlobal + sumaLotesCultivo;
    }, 0).toFixed(2);

    // Suma la cantidad total de plantas sembradas en toda la locación
    const totalPlantasGeneral = datosLugar.cultivos.reduce((totalGlobal, cultivo) => {
        const sumaPlantasCultivo = cultivo.lotes?.reduce((subTotal, lote) => subTotal + parseInt(lote.siembra_inicial || 0), 0) || 0;
        return totalGlobal + sumaPlantasCultivo;
    }, 0);

    // Parte de la vista
    return (
        <div className="contenedor-inspecciones">

            {/* Identificador Principal */}
            <h2 className="card-title">Inspección del Lugar: {datosLugar.lugar}</h2>
            
            {/* Tabla Principal del Módulo */}
            <table className="cabecera-global-grid">
                <thead>
                    <tr>
                        <th>Cultivo</th>
                        <th>Lote</th>
                        <th>Fecha de siembra</th>
                        <th>Siembra inicial [plantas]</th>
                        <th>Extensión [Ha]</th>
                        <th>Inspección</th>
                        <th></th> {/* Espacio reservado para el botón ver lote */}
                    </tr>
                </thead>

                <tbody>
                    {datosLugar.cultivos.map((cultivo, indexCultivo) => {
                        
                        // Configuración matemática del RowSpan para agrupar celdas verticalmente
                        const cantidadLotes = cultivo.lotes?.length || 0;
                        const totalFilasAgrupadas = cantidadLotes + 1; // Lotes del cultivo + la fila del subtotal interno

                        // Métricas dinámicas calculadas por sub-bloque de siembra
                        const subtotalPlantas = cultivo.lotes?.reduce((sum, lote) => sum + parseInt(lote.siembra_inicial || 0), 0) || 0;
                        const subtotalExtension = cultivo.lotes?.reduce((sum, lote) => sum + parseFloat(lote.extension || 0), 0).toFixed(2) || "0.00";

                        return (
                            <tr key={indexCultivo}> 
                                <td colSpan="7" style={{ padding: 0, border: 'none' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
                                        <tbody>
                                            
                                            {/* Inyección de filas individuales de los lotes */}
                                            {cultivo.lotes?.map((lote, indexLote) => (
                                                <tr key={lote.id}>
                                                    
                                                    {/* Agrupamiento vertical: Sólo se renderiza en la primera iteración del lote */}
                                                    {indexLote === 0 && (
                                                        <td rowSpan={totalFilasAgrupadas} className="columna-cultivo-info">
                                                            {lote.imagen_url && (
                                                                <img src={lote.imagen_url} alt={cultivo.nombre} className="img-cultivo" />
                                                            )}
                                                            <div className="nombre-cultivo">{cultivo.nombre}</div>
                                                            <div className="cientifico-cultivo">{cultivo.nombre_cientifico}</div>
                                                        </td>
                                                    )}

                                                    {/* Atributos específicos del lote actual */}
                                                    <td>{lote.id}</td>
                                                    <td>{lote.fecha_siembra || '--'}</td>
                                                    <td>{parseInt(lote.siembra_inicial || 0).toLocaleString()}</td>
                                                    <td>{lote.extension || '0'}</td>
                                                    
                                                    {/* Badge de estado dinámico */}
                                                    <td className={`estado-texto ${lote.estado?.toLowerCase()}`}>
                                                        {lote.estado}
                                                    </td>
                                                    
                                                    {/* Disparador de eventos */}
                                                    <td>
                                                        <button 
                                                            className="btn-ver-lote"
                                                            onClick={() => console.log(`Redireccionando al formulario del lote: ${lote.id}`)}
                                                        >Ver
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* Fila de Cierre: Subtotales locales del Cultivo */}
                                            <tr className="fila-subtotal-tarjeta">
                                                <td className="txt-subtotal">Subtotal</td>
                                                <td></td> 
                                                <td>{subtotalPlantas.toLocaleString()}</td>
                                                <td>{subtotalExtension}</td>
                                                <td></td> 
                                                <td></td> 
                                            </tr>

                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        );
                    })}

                    {/* Fila de Cierre Absoluto: Totales acumulados de la locación */}
                    <tr className="barra-total-general">
                        <td className="txt-izquierda">Total</td>
                        <td></td>
                        <td></td>
                        <td className="txt-izquierda">{totalPlantasGeneral.toLocaleString()} plantas</td>
                        <td className="txt-izquierda">{extensionTotalGeneral} Ha</td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default PestanaGeneral;