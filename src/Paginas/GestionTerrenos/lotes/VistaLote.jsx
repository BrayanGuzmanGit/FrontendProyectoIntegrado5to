import React from 'react';
import { Pencil, Trash } from 'lucide-react';
import { LogicaLote } from './logicaLote';
import PrediosAsociados from '@/Paginas/GestionTerrenos/predios/PrediosAsociados';
import {ArrowLeft} from 'lucide-react';


function VistaLote({lugar, onVolver}) {

    const {
        listaLotes, listaCultivos, estaCargando, pantallaActual, loteSeleccionado, datosFormulario,
        manejarCambio,  enviarFormulario,manejarAgregar, manejarEditar, manejarEliminar,
        cancelarFormulario, obtenerDatos,confirmarEliminar
    } = LogicaLote(lugar);


    return (
        <section className="card">
            {/* Botón para volver a la vista principal de lugares */}
            <div className="volver-container">
                <button className="fab-back" onClick={onVolver}> <ArrowLeft size={26} /> </button>
            </div>

            {/* Título principal del módulo */}
            <h2 className='section-title'> Lotes acutales de {lugar.nombre} </h2>
            {pantallaActual === 'lista' && (
                <>
                    {/* Mientras llegan los datos desde el backend */}
                    {estaCargando ? (<p>Cargando...</p>) : 
                        /*Si el arreglo está vacío,mostramos un mensaje al usuario.*/
                        listaLotes.length === 0 ? (<p>No hay registros.</p>) : (
                        listaLotes.map((lote) => (
                            <div key={lote.id} className="horizontal-card">
                                <div className="card-left-section">
                                    {/* Número del lote */}
                                    <h3>{lote.numero_lote}</h3>

                                    <div className="card-actions">
                                        {/* Al hacer clic en editar, enviamos el lote completo hacia la lógica.*/}
                                        <button className="icon-btn edit-btn" onClick={() => manejarEditar(lote)}>
                                            <Pencil size={18}/>Editar
                                        </button>

                                        <button className="icon-btn delete-btn" onClick={() => manejarEliminar(lote)}>
                                            <Trash size={18}/>Eliminar
                                        </button>
                                    </div>
                                </div>

                                <div className="card-details-section">
                                    {/*obtenerDatos() transforma el objeto del lote en un arreglo
                                        más fácil de renderizar: [ { label, valor }, { label, valor }]*/}

                                    {obtenerDatos(lote).map((dato, index) => (
                                        <p key={index}>
                                            <strong>{dato.label}:</strong>
                                            {' '} {dato.valor}
                                        </p>
                                    ))}
                                </div>

                            </div>
                        ))

                    )}
                        {/* Botón para agregar un nuevo lote */}
                    <button className="fab-add" onClick={manejarAgregar}>
                        +
                    </button>
                </>
            )}
            {/* Formulario crear / editar */}
            {(pantallaActual === 'crear' ||pantallaActual === 'editar') && (
                <div className="form-card">
                    <h3 className="section-title">
                        {pantallaActual === 'editar'? 'Editar Lote ': 'Crear Lote'}
                    </h3>

                    <form onSubmit={enviarFormulario}>
                        {/* Número del lote */}
                        <label className='label-base'>Numero de lote</label>
                        <input
                            className="input-base"
                            name="numero_lote"
                            placeholder="Número de lote"
                            value={datosFormulario.numero_lote}
                            onChange={manejarCambio}
                            required
                            disabled={pantallaActual === 'editar'}
                        />

                        {/* Área del lote */}
                        <label className='label-base'>Area del lote</label>
                        <input
                            className="input-base"
                            name="area"
                            type="number"
                            step="any"
                            placeholder="Área"
                            value={datosFormulario.area}
                            min={0}
                            onChange={manejarCambio}
                            required
                        />

                        {/* Tipo de cultivo */}
                        <label className='label-base'>Tipo de cultivo</label>
                        <select
                            className="input-base"
                            name="uidcultivo"
                            value={datosFormulario.uidcultivo}
                            onChange={manejarCambio}
                            required
                            disabled={pantallaActual === 'editar'}
                        >
                            <option value="">Seleccione cultivo</option>

                            {listaCultivos.map((cultivo) => (
                                <option
                                    key={cultivo.numero_registro}
                                    value={cultivo.numero_registro}
                                >
                                    {cultivo.nombre_comun}
                                </option>
                            ))}
                        </select>

                        {/* Cantidad de plantas */}
                        <label className='label-base'>Cantidad de plantas</label>
                        <input
                            className="input-base"
                            name="cantidad_plantas"
                            type="number"
                            min={0}
                            placeholder="Cantidad de plantas"
                            value={datosFormulario.cantidad_plantas}
                            onChange={manejarCambio}
                            required
                        />

                        {/* Los siguientes campos SOLO aparecen al editar */}
                        {pantallaActual === 'editar' && (
                            <>
                                {/*Fecha de siembra */}
                                <label className='label-base'>Fecha de siembra (fecha de creación del lote)</label>
                                <input
                                    className="input-base"
                                    name="fechasiembra"
                                    type="date"
                                    value={datosFormulario.fechasiembra ?? ''}
                                    onChange={manejarCambio}
                                    disabled={pantallaActual === 'editar'}
                                />

                                {/* Cantidad proyectada de recolección */}
                                <label className='label-base'>cantidad proyectada recolección</label>
                                <input
                                    className="input-base"
                                    name="cantidadproyectadarecoleccion"
                                    type="number"
                                    min={0}
                                    placeholder="Cantidad proyectada de recolección"
                                    value={datosFormulario.cantidadproyectadarecoleccion ?? ''}
                                    onChange={manejarCambio}
                                    
                                />

                                {/* Cantidad recolectada */}
                                <label className='label-base'>cantidad recolectada</label>
                                <input
                                    className="input-base"
                                    name="cantidad_recoleccion"
                                    type="number"
                                    min={0}
                                    placeholder="Cantidad recolectada"
                                    value={datosFormulario.cantidad_recoleccion ?? ''}
                                    onChange={manejarCambio}
                                />

                                {/* Fecha de recolección */}
                                <label className='label-base'  >Fecha de recolección</label>
                                <input
                                    className="input-base"
                                    name="fecharecoleccion"
                                    type="date"
                                    value={datosFormulario.fecharecoleccion ?? ''}
                                    min={new Date().toISOString().split('T')[0]}
                                    max={
                                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                        .toISOString()
                                        .split('T')[0]
                                    }
                                    onChange={manejarCambio}
                                />
                            </>
                        )}
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
                        <p> ¿Está seguro de que desea eliminar el lote?</p>
                        <p><strong>{loteSeleccionado?.nombre}</strong></p>

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

export default VistaLote;