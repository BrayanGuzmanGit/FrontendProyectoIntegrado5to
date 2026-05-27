import { useEffect, useState } from "react";
import BASE_URL_INSPECTIONS from '@/services/api-inspections';


function InspeccionesPendientesProductor(){

    //Parte de la lógica
    const [inspecciones, setInspecciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);


    //Parte de la petición  API
    const verPendientes= async ()=>{

        const token = localStorage.getItem('token');
        try {
            setCargando(true);
            setError(null); // Limpiamos errores previos (si los hay)

            const respuesta = await fetch(`${BASE_URL_INSPECTIONS}/tecnica/asignadas`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                }
            });
            
            if (!respuesta.ok) {// Si el servidor responde con un código de error (ej: 404, 500), salta directo al catch
                throw new Error('No se pudieron cargar las inspecciones pendientes.');
            }
            const data = await respuesta.json(); //para tranforma respuesta a json
            console.log("inspecciones pendientes del productor: "+data.data);

            // Guarda los datos obtenidos en el estado (usa data.data si viene envuelto, o data directamente)
            setInspecciones(data.data || data || []); 
            setCargando(false); // Apaga el estado de carga porque los datos ya llegaron con éxito

        } catch (err) {
                console.error("Error en la petición:", err); // Registra el error técnico exacto en la consola del navegador
                setError(err.message);                       // Guarda el texto del error en el estado para mostrárselo al usuario
                setCargando(false);                          // Apaga la carga para que el componente muestre la pantalla de error
            }
    }

    useEffect(() => {
        document.title = "Mis Inspecciones"; // Cambia el título de la pestaña del navegador
        verPendientes();                     // Dispara la petición a la API inmediatamente al cargar la pantalla
    }, []); // El array vacío [] asegura que esto se ejecute una sola vez al inicio


    //Parte de la vista
    return(
        <div className="contenedor-usuarios">
            <h2>Inspecciones Pendiente</h2>
                {/* Tabla donde se presenta la informacion de la inspección */}
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
                    {/* CASO 1: El estado sigue cargando datos de la API */}
                    {cargando ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                Cargando inspecciones pendientes...
                            </td>
                        </tr>
                    ) : 
                    /* CASO 2: La API respondió pero ocurrió un error */
                    error ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                Error: {error}
                            </td>
                        </tr>
                    ) : 
                    /* CASO 3: Terminó de cargar sin errores, pero el arreglo está vacío */
                    inspecciones.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                No tienes inspecciones pendientes en este momento.
                            </td>
                        </tr>
                    ) : (
                        /* CASO 4: Todo salió perfecto y mapeamos las filas reales */
                        inspecciones.map((inspeccion) => (
                            <tr key={inspeccion.idinspeccion}>
                                <td>{inspeccion.fechainicioinspeccion|| '--'}</td>
                                <td>{inspeccion.solicitud_inspeccion.idlugarproduccion || '--'}</td>
                                <td>{inspeccion.solicitud_inspeccion.tipo_inspeccion|| '--'}</td>
                                <td>{inspeccion.uidtecnico || '--'}</td>
                                <td className={`estado ${inspeccion.estado?.toLowerCase()}`}>
                                    {inspeccion.estado || '--'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

                
        </div>
    )

}
export default InspeccionesPendientesProductor;