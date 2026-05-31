import { useState, useEffect } from "react";  // ← añadir useEffect
import { ArrowLeft, ChevronDown, ChevronUp, TriangleAlert } from 'lucide-react';
import BASE_URL_INSPECTIONS from '@/services/api-inspections'; 
import "./InspeccionesTec.css";

// ─── Clave única por inspección ──────────────────────────────────────────────
const claveStorage = (id) => `inspeccion_tecnica_${id}`;

// ─── Estado inicial vacío (extraído para reutilizarlo) ───────────────────────
const formularioVacio = {
    areaacopio: null, arearesiduosvegetales: null, areaalmacenamientoinsumos: null,
    areadosificacion: null, areapreparacionmezclas: null,
    areaalmacenamientoequiposyherramientas: null, arearesiduosmezclasylavado: null,
    areasanitariaylavamanos: null,                        // ← faltaba en el original

    comentarioAcopio: "", comentarioResiduosvegetales: "",
    comentarioAlmacenamientoinsumos: "", comentarioDosificacion: "",
    comentarioPreparacionmezclas: "", comentarioEquiposyherramientas: "",
    comentarioResiduosmezclasylavado: "", comentarioSanitariaylavamanos: ""
};

function InspeccionTecnica({ idInspeccionSeleccionada, nombreLugar }) {

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [idAreaAbierta, setIdAreaAbierta] = useState(null); 

    // ── }inicializar desde localStorage si existe ──────────────────
    const [formulario, setFormulario] = useState(() => {
        try {
            const guardado = localStorage.getItem(claveStorage(idInspeccionSeleccionada));
            return guardado ? JSON.parse(guardado) : formularioVacio;
        } catch {
            return formularioVacio;
        }
    });

    // ──sincronizar localStorage cada vez que cambia el formulario ─
    useEffect(() => {
        try {
            localStorage.setItem(
                claveStorage(idInspeccionSeleccionada),
                JSON.stringify(formulario)
            );
        } catch (e) {
            console.warn("No se pudo guardar en localStorage:", e);
        }
    }, [formulario, idInspeccionSeleccionada]);

    const guardarInspeccion = async (estado) => {
        const token = localStorage.getItem('token');
        try {
            const body = {
                idinspeccion: idInspeccionSeleccionada,
                ...formulario,
                estado: estado
            };

            const respuesta = await fetch(
                `${BASE_URL_INSPECTIONS}/tecnica/asignadas`,
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
                throw new Error(data.message || "Error al guardar");
            }

            // ── CAMBIO 3: al terminar, limpiar el borrador guardado ─────────
            if (estado === "Terminada") {
                localStorage.removeItem(claveStorage(idInspeccionSeleccionada));
            }

            alert(
                estado === "Terminada"
                    ? "Informe generado correctamente"
                    : "Cambios guardados. Puedes retomar esta inspección cuando quieras."
            );
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };


    // Cambia el estado para abrir o cerrar el contenedor al hacer clic
    const alternarAcordeon = (id) => {
        setIdAreaAbierta(idAreaAbierta === id ? null : id); 
    };

    // Guarda si el técnico presionó "Sí" o "No"
    const manejarCumplimiento = (campo, valor) => {
        setFormulario(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Guarda el texto de las observaciones
    const manejarComentario = (campo, texto) => {
        setFormulario(prev => ({
            ...prev,
            [campo]: texto
        }));
    };

    
    if (error) {
        return <div className="error-texto">Error: {error}</div>;
    }

    const areas = [
        {   id: 1, //solo para reconocer desde el front
            nombre: "Área de Acopio", // el texto que muestra al usuario el front
            campo: "areaacopio", //nombre exacto del backend
            comentario: "comentarioAcopio", //nombre exacto del backend
            url_imagen: "https://www.gob.mx/cms/uploads/article/main_image/38326/CENTROS_DE_ACOPIO_Y_MERMAS.jpg" //url traída desde aquí
        },
        {   id: 2,
            nombre: "Área de Residuos Vegetales",
            campo: "arearesiduosvegetales",
            comentario: "comentarioResiduosvegetales",
            url_imagen: "https://www.gob.mx/cms/uploads/article/main_image/38326/CENTROS_DE_ACOPIO_Y_MERMAS.jpg" //url traída desde aquí
        },
        {    id: 3,
            nombre: "Área de Almacenamiento de Insumos",
            campo: "areaalmacenamientoinsumos",
            comentario: "comentarioAlmacenamientoinsumos",
            url_imagen: "https://www.gob.mx/cms/uploads/article/main_image/38326/CENTROS_DE_ACOPIO_Y_MERMAS.jpg" //url traída desde aquí
        },
        {   id: 4,
            nombre: "Área de Dosificación",
            campo: "areadosificacion",
            comentario: "comentarioDosificacion",
            url_imagen: "https://www.gob.mx/cms/uploads/article/main_image/38326/CENTROS_DE_ACOPIO_Y_MERMAS.jpg" //url traída desde aquí
        },
        {   id: 5,
            nombre: "Área de Preparación de Mezclas",
            campo: "areapreparacionmezclas",
            comentario: "comentarioPreparacionmezclas",
            url_imagen: "https://www.gob.mx/cms/uploads/article/main_image/38326/CENTROS_DE_ACOPIO_Y_MERMAS.jpg" //url traída desde aquí
        },
        {   id: 6,
            nombre: "Área de Equipos y Herramientas",
            campo: "areaalmacenamientoequiposyherramientas",
            comentario: "comentarioEquiposyherramientas",
            url_imagen: "https://www.gob.mx/cms/uploads/article/main_image/38326/CENTROS_DE_ACOPIO_Y_MERMAS.jpg" //url traída desde aquí
        },
        {   id: 7,
            nombre: "Área de Residuos de Mezclas y Lavado",
            campo: "arearesiduosmezclasylavado",
            comentario: "comentarioResiduosmezclasylavado",
            url_imagen: "https://www.gob.mx/cms/uploads/article/main_image/38326/CENTROS_DE_ACOPIO_Y_MERMAS.jpg" //url traída desde aquí
        },
        {   id: 8,
            nombre: "Área Sanitaria y Lavamanos",
            campo: "areasanitariaylavamanos",
            comentario: "comentarioSanitariaylavamanos",
            url_imagen: "https://www.gob.mx/cms/uploads/article/main_image/38326/CENTROS_DE_ACOPIO_Y_MERMAS.jpg" //url traída desde aquí
        }
    ];

    return (
        <div className="contenedor-principal">

            {/* Contenedor Morado Principal */}
            <section>
                <h2 className="card-title">
                    Inspección Técnica del lugar de Producción: {nombreLugar}
                </h2>
                <div className="card-inspeccion-tecnica">

                    {/* Recorremos la lista de áreas dinámicas */}
                    {areas.map((area) => {
                        const estaAbierto = idAreaAbierta === area.id;

                        return (
                            <div key={area.id} className="bloque-acordeon-area">
                                
                                {/* Encabezado del acordeón */}
                                <div className="header-acordeon" onClick={() => alternarAcordeon(area.id)}>
                                    <span>{area.nombre}</span>
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
                                            <h4>{area.nombre}</h4>
                                            <p className="subtexto">Imagen de referencia</p>
                                            <div className="cuadro-imagen">
                                                {area.url_imagen ? (
                                                    <img 
                                                        src={area.url_imagen} 
                                                        alt={`Referencia de ${area.nombre}`}
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
                                                    className={`btn-switch si ${formulario[area.campo] === true? 'activo-verde' : ''}`}
                                                    onClick={() => manejarCumplimiento(area.campo, true)}
                                                >
                                                    Sí
                                                </button>
                                                <button 
                                                    type="button"
                                                    className={`btn-switch no ${formulario[area.campo] === false ? 'activo-rojo' : ''}`}
                                                    onClick={() => manejarCumplimiento(area.campo, false)}
                                                >
                                                    No
                                                </button>
                                            </div>

                                            <p className="indicacion-comentario">Coméntanos por qué</p>
                                            
                                            <textarea
                                                className= "input-base textarea-base"
                                                value={formulario[area.comentario]||''}
                                                onChange={(e) => manejarComentario(area.comentario, e.target.value)}
                                                placeholder={
                                                    formulario[area.campo] === false
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
                        <button className="btn-final guardar" onClick={() => guardarInspeccion("En proceso")}>Guardar cambios</button>
                        <button className="btn-final informe"  onClick={() => guardarInspeccion("Terminada")}>Generar Informe</button>
                    </div>

                </div>
            </section>
        </div>
    );
}

export default InspeccionTecnica;