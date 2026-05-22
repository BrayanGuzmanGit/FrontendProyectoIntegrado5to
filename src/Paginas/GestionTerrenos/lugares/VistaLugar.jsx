import React from 'react';
import { Pencil, Trash } from 'lucide-react';
import { LogicaLugar } from './logicaLugar';
import PrediosAsociados from '@/Paginas/GestionTerrenos/predios/PrediosAsociados';
import VistaLote from '@/Paginas/GestionTerrenos/lotes/VistaLote';


function VistaLugar() {

    const {
        listaLugares, pantallaActual, datosFormulario, lugarSeleccionado, estaCargando,
        verPredios, lugarPredios, verLotes, lugarLotes, manejarVerLotes, volverDesdeLotes,
        manejarAgregar, manejarEditar, manejarEliminar,manejarCambio, enviarFormulario,
        confirmarEliminar,obtenerDatos, cancelarFormulario, manejarVerPredios, volverDesdePredios
    } = LogicaLugar();

        if (verPredios) { /*para el botón de predios asociados*/
            return (
                <PrediosAsociados lugar={lugarPredios} onVolver={volverDesdePredios}/>
            );
        }

        if (verLotes) { /*para el botón de ltoes actuales */
            return (
                <VistaLote lugar={lugarLotes} onVolver={volverDesdeLotes}/>
            );
        }

    return (
        <section className="card">
            {/* Título principal del módulo */}
            <h2 className="card-title"> Lugares de Producción</h2>
            {pantallaActual === 'lista' && (
                <>
                    {/* Mientras llegan los datos desde el backend */}
                    {estaCargando ? (<p>Cargando...</p>) : 
                        /*Si el arreglo está vacío,mostramos un mensaje al usuario.*/
                        listaLugares.length === 0 ? (<p>No hay lotes registrados a este lugar.</p>) : (
                        listaLugares.map((lugar) => (
                            <div key={lugar.id} className="horizontal-card">
                                <div className="card-left-section">
                                    {/* Nombre principal del lugar */}
                                    <h3>{lugar.nombre}</h3>

                                    <div className="card-actions">
                                        {/* Al hacer clic en editar, enviamos el lugar completo hacia la lógica.*/}
                                        <button className="icon-btn edit-btn" onClick={() => manejarEditar(lugar)}>
                                            <Pencil size={18}/>Editar
                                        </button>

                                        <button className="icon-btn delete-btn" onClick={() => manejarEliminar(lugar)}>
                                            <Trash size={18}/>Eliminar
                                        </button>
                                    </div>
                                </div>

                                <div className="card-details-section">
                                    {/*obtenerDatos() transforma el objeto del lugar en un arreglo
                                        más fácil de renderizar: [ { label, valor }, { label, valor }]*/}

                                    {obtenerDatos(lugar).map((dato, index) => (
                                        <p key={index}>
                                            <strong>{dato.label}:</strong>
                                            {' '} {dato.valor}
                                        </p>
                                    ))}
                                </div>

                                {/* Botones secundarios */}
                                <div className="card-button-section">
                                    <button className="btn-secundary" onClick={() => manejarVerPredios(lugar)}>
                                        Predios asociados
                                    </button>
                                    <button className="btn-secundary" onClick={() => manejarVerLotes(lugar)}>Lotes actuales</button>
                                </div>
                            </div>
                        ))

                    )}
                        {/* Botón para agregar un nuevo lugar */}
                    <button className="fab-add" onClick={manejarAgregar}>
                        +
                    </button>
                </>
            )}
            {/* Formulario crear / editar */}
            {(pantallaActual === 'crear' ||pantallaActual === 'editar') && (
                <div className="form-card">
                    <h3 className="section-title">
                        {pantallaActual === 'editar'? 'Editar Lugar de Producción': 'Crear Lugar de Producción'}
                    </h3>

                    <form onSubmit={enviarFormulario}>
                        <input
                            className="input-base"
                            name="nombre"
                            value={datosFormulario.nombre}
                            onChange={manejarCambio}
                            placeholder="Nombre del lugar"
                            required
                        />
                        <div className="contenedor-botones">
                            <button type="submit" className="btn-secundary">
                                {pantallaActual === 'editar' ? 'Guardar cambios' : 'Crear'}
                            </button>

                            {/* Cancelar */}
                            <button type="button" className="btn-secundary cancel"onClick={cancelarFormulario}
                            >Cancelar</button>

                        </div>
                    </form>
                </div>

            )}

            {/* Modal eliminar */}
            {pantallaActual === 'eliminar' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p> ¿Está seguro de que desea eliminar el lugar?</p>
                        <p><strong>{lugarSeleccionado?.nombre}</strong></p>

                        <div className="contenedor-botones">
                            <button className="btn-secundary" onClick={confirmarEliminar}
                            >Eliminar
                            </button>

                            <button className="btn-secundary cancel" onClick={cancelarFormulario}
                            >Cancelar</button>

                        </div>

                    </div>

                </div>

            )}
        </section>
    );
}

export default VistaLugar;