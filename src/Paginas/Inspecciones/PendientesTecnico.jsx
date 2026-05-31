import { useEffect, useState } from "react";
import BASE_URL_INSPECTIONS from '@/services/api-inspections';
import InspeccionFitosanitariaGeneral from "@/Paginas/Inspecciones/InspeccionFitosanitariaGeneral";
import InspeccionTecnica from "@/Paginas/Inspecciones/InspeccionTecnica";
import { ArrowLeft } from "lucide-react";

function InspeccionesPendientesTecnico(){

    // Parte de la lógica

    const [inspecciones, setInspecciones] = useState([]); // Almacena el arreglo de inspecciones
    const [cargando, setCargando] = useState(true); // Para mostrar un mensaje de "Cargando..." mientras llegan los datos
    const [error, setError] = useState(null); // Para mostrar errores de la API al usuario
    const [idFitoSeleccionada, setIdFitoSeleccionada] = useState(null); // para almacenar el id de la inspeccion fitosanitaria que se selecciona
    const [inspeccionTecnicaSeleccionada, setInspeccionTecnicaSeleccionada] = useState(null);

    // Parte de la petición API
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
            if (!respuesta.ok) {
                throw new Error('No se pudieron cargar las inspecciones pendientes.');
            }

            const data = await respuesta.json();
            console.log("Respuesta del servidor:", data);
            setInspecciones(data.data || data || []);
            setCargando(false);

        } catch (err) {
            console.error("Error en la petición:", err);
            setError(err.message);
            setCargando(false);
        }
    }

    useEffect(() => {
        document.title = "Mis Inspecciones";
        verPendientes();
    }, []);

    const manejarAccionBotones = (inspeccion, tipo) => {
        if (tipo === 'inspeccion tecnica') {
            setInspeccionTecnicaSeleccionada(inspeccion); // Lógica para inspección técnica
        } else {
            // Lógica para inspección fitosanitaria: Activamos la vista del detalle
            setIdFitoSeleccionada(inspeccion.idinspeccion);
        }
    };

    // Función para limpiar el estado y regresar a la lista de pendientes
    const regresarALista = () => {
        setIdFitoSeleccionada(null);
        setInspeccionTecnicaSeleccionada(null);
    }

    if (idFitoSeleccionada !== null) {
        return (
            <>
                {/* Agregamos el contenedor del botón volver aquí para que afecte a la ventana general */}
                <div className="volver-container">
                    <button className="fab-back" onClick={regresarALista}><ArrowLeft size={26} /> </button>
                </div>
                {/* Tu archivo de la tabla agrupada recibe el ID seleccionado */}
                <InspeccionFitosanitariaGeneral
                    idInspeccionSeleccionada={idFitoSeleccionada}
                    onVolver={regresarALista}
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
                    nombreLugar={
                        inspeccionTecnicaSeleccionada.lugarNombre
                    }
                    onVolver={regresarALista}
                />
            </>
        );
    }

    // Parte de la vista
    return (
        <div className="contenedor-usuarios">
            <h2>Inspecciones Pendientes</h2>
            <table className="tabla-usuarios">
                <thead>
                    <tr>
                        <th>Fecha de realización</th>
                        <th>Lugar de producción</th>
                        <th>Tipo de Inspección</th>
                        <th>Productor del lugar</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>

                    {/* CASO 1: Cargando */}
                    {cargando ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                Cargando inspecciones pendientes...
                            </td>
                        </tr>
                    ) :

                    /* CASO 2: Error */
                    error ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                Error: {error}
                            </td>
                        </tr>

                    ) :

                    /* CASO 3: Vacío */
                    inspecciones.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                No tienes inspecciones pendientes en este momento.
                            </td>
                        </tr>
                    ) : (

                        /* CASO 4: Renderizado de filas */
                        inspecciones.map((inspeccion) => {
                            const tipo = inspeccion.solicitud_inspeccion?.tipo_inspeccion?.toLowerCase() || '';
                            const estadoInspeccion = inspeccion.solicitud_inspeccion?.estado?.toLowerCase() || '';
                            // Evaluamos la clase de color base usando tu "if"
                            let claseBotonBase = '';
                            if (tipo === 'inspeccion tecnica') {
                                claseBotonBase = 'btn-tecnica';
                            } else {
                                claseBotonBase = 'btn-fitosanitaria';
                            }
                            // Control de estado terminado o finalizado
                            const estaTerminada = estadoInspeccion === 'terminada' || estadoInspeccion === 'finalizada' || estadoInspeccion === 'terminado';
                            // Si está terminada no le pasamos color extra para que el CSS maneje el estado disabled por defecto
                            const claseEstiloFinal = estaTerminada ? '' : claseBotonBase;
                            const textoBoton = estaTerminada ? 'Finalizada' : 'Iniciar';
                            return (
                                <tr key={inspeccion.idinspeccion}>
                                    <td>{inspeccion.fechainicioinspeccion || '--'}</td>
                                    <td>{inspeccion.lugarNombre || inspeccion.solicitud_inspeccion?.idlugarproduccion || '--'}</td>
                                    <td>{inspeccion.solicitud_inspeccion?.tipo_inspeccion || '--'}</td>
                                    <td>{inspeccion.productorNombre || '--'}</td>
                                    <td className={`estado ${inspeccion.estado?.toLowerCase()}`}>
                                        {inspeccion.estado || '--'}
                                    </td>
                                    <td>
                                        <button className={`btn-primary ${claseEstiloFinal}`}
                                            disabled={estaTerminada}
                                            onClick={() => manejarAccionBotones(inspeccion, tipo)}
                                        >{textoBoton}
                                        </button>
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