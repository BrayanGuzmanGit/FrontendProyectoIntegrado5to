import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, TriangleAlert } from 'lucide-react';
import BASE_URL_INSPECTIONS from '@/services/api-inspections'; 
import "./InspeccionesTec.css";

function InspeccionTecnica({ idInspeccionSeleccionada, nombreLugar }) {
    // 1. ESTADOS DEL COMPONENTE
    const [listaAreas, setListaAreas] = useState([]); 
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [idAreaAbierta, setIdAreaAbierta] = useState(null); 

    // Petición API para obtener los datos del lugar de producción
    const obtenerAreas = async () => {
        const token = localStorage.getItem('token');
        try {
            setCargando(true);
            setError(null);
            
            const respuesta = await fetch(`${BASE_URL_INSPECTIONS}/${idInspeccionSeleccionada}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!respuesta.ok) {
                throw new Error('No se pudo acceder a la información del formulario.');
            }

            const data = await respuesta.json();
            setListaAreas(data.data || data); 
            setCargando(false);

        } catch (err) {
            console.error("Error cargando formulario:", err);
            setError(err.message);
            setCargando(false);
        }
    };

    // Dispara la consulta al montar o cambiar el ID
    useEffect(() => {
        if (idInspeccionSeleccionada) {
            obtenerAreas();
        }
    }, [idInspeccionSeleccionada]);

    // Cambia el estado para abrir o cerrar el contenedor al hacer clic
    const alternarAcordeon = (id) => {
        setIdAreaAbierta(idAreaAbierta === id ? null : id); 
    };

    // Guarda si el técnico presionó "Sí" o "No"
    const manejarCumplimiento = (idArea, valorCumple) => {
        setListaAreas(listaAreas.map(area => 
            area.id === idArea ? { ...area, cumple: valorCumple } : area
        ));
    };

    // Guarda el texto de las observaciones
    const manejarComentario = (idArea, texto) => {
        setListaAreas(listaAreas.map(area => 
            area.id === idArea ? { ...area, comentarios: texto } : area
        ));
    };

    // CÁLCULOS DINÁMICOS
    const areasTotales = listaAreas.length;
    const areasRevisadas = listaAreas.filter(area => area.cumple !== null).length;
    const faltanPorMonitorear = areasTotales - areasRevisadas;

    if (cargando) {
        return <div className="cargando-texto">Cargando el formulario...</div>;
    }

    if (error) {
        return <div className="error-texto">Error: {error}</div>;
    }

    return (
        <div className="contenedor-principal">
            
            {/* Advertencia dinámica */}
            {faltanPorMonitorear > 0 && (
                <div className="banner-advertencia">
                    <TriangleAlert size={22} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Faltan {faltanPorMonitorear} áreas por monitorear. Asegúrate de visitarlas todas.
                </div>
            )}

            {/* Contenedor Morado Principal */}
            <section>
                <h2 className="card-title">
                    Inspección Técnica del lugar de Producción: {nombreLugar}
                </h2>
                <div className="card-inspeccion-tecnica">

                    {/* Recorremos la lista de áreas dinámicas */}
                    {listaAreas.map((area) => {
                        const estaAbierto = idAreaAbierta === area.id;

                        return (
                            <div key={area.id} className="bloque-acordeon-area">
                                
                                {/* Encabezado del acordeón */}
                                <div className="header-acordeon" onClick={() => alternarAcordeon(area.id)}>
                                    <span>{area.nombre_area}</span>
                                    <span className="icono-flecha">
                                        {estaAbierto ? <ChevronUp size={26} /> : <ChevronDown size={26} />}
                                    </span>
                                </div>

                                {/* Contenedor de transición (Siempre en el DOM para animar) */}
                                <div className={`body-acordeon-desplegado ${estaAbierto ? 'abierto' : ''}`}>
                                    
                                    {/* Wrapper interno que protege el diseño de 2 columnas de la animación */}
                                    <div className="grid-interno-acordeon">
                                        
                                        {/* Subsección Izquierda: Imagen y Referencia por URL */}
                                        <div className="seccion-referencia">
                                            <h4>{area.nombre_area}</h4>
                                            <p className="subtexto">Imagen de referencia</p>
                                            <div className="cuadro-imagen">
                                                {area.imagen_url ? (
                                                    <img 
                                                        src={area.imagen_url} 
                                                        alt={`Referencia de ${area.nombre_area}`}
                                                        style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '40px' }}>🏞️</span> // Respaldo si no hay URL en la BD
                                                )}
                                            </div>
                                        </div>

                                        {/* Subsección Derecha: El formulario interactivo */}
                                        <div className="seccion-formulario">
                                            <p className="pregunta">¿Cumple con los requisitos?</p>
                                            
                                            {/* Botones de Sí y No */}
                                            <div className="contenedor-switches">
                                                <button 
                                                    type="button"
                                                    className={`btn-switch si ${area.cumple === true ? 'activo-verde' : ''}`}
                                                    onClick={() => manejarCumplimiento(area.id, true)}
                                                >
                                                    Sí
                                                </button>
                                                <button 
                                                    type="button"
                                                    className={`btn-switch no ${area.cumple === false ? 'activo-rojo' : ''}`}
                                                    onClick={() => manejarCumplimiento(area.id, false)}
                                                >
                                                    No
                                                </button>
                                            </div>

                                            <p className="indicacion-comentario">Coméntanos por qué</p>
                                            
                                            <textarea
                                                className="textarea-comentarios"
                                                value={area.comentarios || ""}
                                                onChange={(e) => manejarComentario(area.id, e.target.value)}
                                                placeholder={
                                                    area.cumple === false
                                                        ? "Ej: La zona no está techada, no cuenta con avisos de advertencia, el piso no es impermeable, etc."
                                                        : "Ej: Las herramientas están organizadas, kit de emergencias al día, plaguicidas separados de los fertilizantes, etc."
                                                }
                                            />
                                        </div>

                                    </div> {/* Fin grid-interno-acordeon */}
                                </div> {/* Fin body-acordeon-desplegado */}
                            </div>
                        );
                    })}

                    {/* Botones de acción finales */}
                    <div className="bloque-botones-finales">
                        <button className="btn-final guardar">Guardar cambios</button>
                        <button className="btn-final informe">Generar Informe</button>
                    </div>

                </div>
            </section>
        </div>
    );
}

export default InspeccionTecnica;