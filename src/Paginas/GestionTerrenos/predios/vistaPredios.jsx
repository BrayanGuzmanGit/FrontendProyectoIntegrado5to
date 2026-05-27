import React from 'react';
import { Pencil, Trash, Link, Unlink } from 'lucide-react';
import { LogicaPredio } from './logicaPredios';

function VistaPredio() {

    const {
        listaPredios, pantallaActual, datosFormulario, predioSeleccionado,
        estaCargando, listaDepartamentos, municipiosFiltrados,
        manejarCambio, manejarCambioDepartamento, enviarFormulario,
        manejarAgregar, manejarEditar, manejarEliminar,
        manejarAsociar, manejarDesasociar,
        cancelarFormulario, confirmarEliminar,
        confirmarDesasociar, obtenerDatos

    } = LogicaPredio();

    return (
        <section className="card">
            {/* Título principal del módulo */}
            <h2 className="card-title">Predios</h2>
            {pantallaActual === 'lista' && (
                <>
                    {/* Mientras llegan los datos desde backend */}
                    {estaCargando ? (<p>Cargando...</p>) : listaPredios.length === 0 ? (
                        /* Si no existen predios registrados */
                        <p>No hay registros.</p>
                    ) : (
                        listaPredios.map((predio) => (
                            <div key={predio.id} className="horizontal-card">
                                {/* Información principal */}
                                <div className="card-left-section">
                                    {/* Nombre principal del predio */}
                                    <h3>{predio.nombre}</h3>
                                    <div className="card-actions">
                                        {/* Botón editar */}
                                        <button className="icon-btn edit-btn" onClick={() => manejarEditar(predio)}>
                                            <Pencil size={18}/> Editar
                                        </button>
                                        {/* Botón eliminar */}
                                        <button className="icon-btn delete-btn" onClick={() => manejarEliminar(predio)}
                                        >
                                            <Trash size={18}/>Eliminar</button>
                                    </div>
                                </div>

                                {/* Datos secundarios del predio */}
                                <div className="card-details-section">
                                    {/* obtenerDatos() transforma el objeto en un arreglo renderizable */}
                                    {obtenerDatos(predio).map((dato, index) => (
                                        <p key={index}>
                                            <strong>{dato.label}:</strong>
                                            {' '} {dato.valor}
                                        </p>
                                    ))}
                                </div>

                                {/* Botones de asociación */}
                                <div className="card-button-section">
                                    {/* Asociar a lugar de producción */}
                                    <button className="btn-secundary" onClick={() => manejarAsociar(predio)}>
                                        <Link size={16}/>Asociar a lugar de producción
                                    </button>
                                    {/* Desasociar */}
                                    <button
                                        className="btn-secundary"
                                        onClick={() => {
                                            /* Evita intentar desasociar
                                            un predio sin asociación */
                                            if (!predio.lugar_produccion) {
                                                alert('Este predio no está asociado a ningún lugar de producción');
                                                return;
                                            }
                                            manejarDesasociar(predio);
                                        }}
                                    >
                                        <Unlink size={16}/>Desasociar de lugar de producción
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    {/* Botón para agregar nuevos predios */}
                    <button className="fab-add" onClick={manejarAgregar}>
                        +
                    </button>
                </>
            )}

            {/* Formulario crear/editar */}
            {(pantallaActual === 'crear' || pantallaActual === 'editar') && (
                <div className="form-card">
                    <h3 className="section-title">
                        {pantallaActual === 'editar'? 'Editar predio': 'Registrar un predio nuevo'}
                    </h3>

                    <form onSubmit={enviarFormulario}>
                        {/* Nombre */}
                        <input
                            className="input-base"
                            name="nombre"
                            value={datosFormulario.nombre}
                            onChange={manejarCambio}
                            placeholder="Nombre del predio"
                            required
                        />

                        {/* Área */}
                        <input
                            className="input-base"
                            type="number"
                            step="any"
                            name="area"
                            value={datosFormulario.area}
                            onChange={manejarCambio}
                            placeholder="Área total (hectáreas)"
                            required
                        />

                        <label className="label-base label-base-center" >Ubicación</label>
                        {/* Departamento */}
                        <label htmlFor="departamento" className='label-base'> Departamento:</label>

                        <select
                            className="input-base"
                            id="departamento"
                            name="id_departamento"
                            value={datosFormulario.id_departamento}
                            onChange={manejarCambioDepartamento}
                            disabled={pantallaActual === 'editar'}
                            required
                        >
                            <option value=""> (*)Seleccionar Departamento </option>

                            {/* Lista de departamentos obtenida desde backend */}
                            {listaDepartamentos.map((departamento) => (

                                <option key={departamento.id_departamento}  value={departamento.id_departamento}
                                > {departamento.nombre}
                                </option>
                            ))}
                        </select>

                        {/* Municipio */}
                        <label htmlFor="municipio" className='label-base'>(*) Municipio:</label>

                        <select
                            className="input-base"
                            id="municipio"
                            name="id_municipio"
                            value={datosFormulario.id_municipio}
                            onChange={manejarCambio}
                            disabled={pantallaActual === 'editar' ||!datosFormulario.id_departamento}
                            required
                        >
                            <option value="">(*) Seleccionar municipio</option>

                            {/* Municipios filtrados dinámicamente */}
                            {municipiosFiltrados.map((municipio) => (
                                <option key={municipio.id_municipio}  value={municipio.id_municipio}
                                >{municipio.nombre}
                                </option>
                            ))}

                        </select>

                        {/* Dirección */}
                        <input
                            className="input-base"
                            name="direccion"
                            value={datosFormulario.direccion}
                            onChange={manejarCambio}
                            disabled={pantallaActual === 'editar'}
                            placeholder="Dirección del predio (Calle/Carrera/Av)"
                            required
                        />

                        <div className="contenedor-botones">
                            <button type="submit" className="btn-secundary">
                                {pantallaActual === 'editar'? 'Guardar cambios': 'Crear'}
                            </button>

                            {/* Cancelar formulario */}
                            <button type="button" className="btn-secundary cancel" onClick={cancelarFormulario}
                            > Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Asociar*/}
            {pantallaActual === 'asociar' && (

                <div className="form-card">
                    <h3 className="section-title">
                        Asociar a lugar de producción
                    </h3>
                    <form onSubmit={enviarFormulario}>
                        {/* Número ICA */}
                        <input
                            className="input-base"
                            name="numero_registro"
                            value={datosFormulario.numero_registro}
                            onChange={manejarCambio}
                            placeholder="Número ICA del lugar"
                            required
                        />

                        <div className="contenedor-botones">
                            <button type="submit" className="btn-secundary"> Asociar</button>
                            <button type="button" className="btn-secundary cancel"onClick={cancelarFormulario}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* desasociar predio de lugar de producción*/}
            {pantallaActual === 'desasociar' && (

                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>
                            ¿Deseas desasociar el predio
                            <strong> {predioSeleccionado?.nombre} </strong>
                            del lugar de producción
                            <strong>{' '} {predioSeleccionado?.lugar_produccion?.nombre} {' '}
                            </strong>
                            ?
                        </p>

                        <div className="contenedor-botones">

                            <button
                                className="btn-secundary"
                                onClick={confirmarDesasociar}
                            >
                                Desasociar
                            </button>

                            <button
                                className="btn-secundary cancel"
                                onClick={cancelarFormulario}
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>
            )}
            {/* Eliminar predio */}
            {pantallaActual === 'eliminar' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>¿Está seguro de eliminar este predio?</p>
                        <p> <strong> {predioSeleccionado?.nombre}</strong></p>
                        <div className="contenedor-botones">
                            <button className="btn-secundary" onClick={confirmarEliminar}
                            > Eliminar
                            </button>
                            <button className="btn-secundary cancel" onClick={cancelarFormulario}
                            > Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default VistaPredio;