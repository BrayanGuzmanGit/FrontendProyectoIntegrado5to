import React, { useState, useEffect } from 'react';
import BASE_URL from '@/services/api-entidades';

// Componente que muestra el formulario para crear/editar lugares, lotes y predios,
// y también para asociar un predio a un lugar de producción.
function FormularioTerreno({ tipo, onCancelar, onExito, modoEdicion = false, itemEditar = null }) {

    // ═══════════════════════════════════════════════════════════════
    // ESTADOS PARA DEPARTAMENTOS Y MUNICIPIOS
    // ═══════════════════════════════════════════════════════════════
    const [departamentos, setDepartamentos] = useState([]); // Lista de departamentos
    const [municipios, setMunicipios] = useState([]); // Lista de todos los municipios
    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
    const [municipioSeleccionado, setMunicipioSeleccionado] = useState('');

    // ═══════════════════════════════════════════════════════════════
    // ESTADO PARA EL FORMULARIO
    // ═══════════════════════════════════════════════════════════════
    // Inicializa el formulario con datos del item a editar, si corresponde.
    const [datosFormulario, setDatosFormulario] = useState(
        modoEdicion && itemEditar ? { nombre: itemEditar.nombre } : {}
    );

    // ═══════════════════════════════════════════════════════════════
    // CARGAR DEPARTAMENTOS Y MUNICIPIOS AL MONTAR EL COMPONENTE
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        // Si estamos en modo de asociación, no necesitamos cargar departamentos/municipios.
        if (tipo === 'asociar') return;

        const cargarUbicaciones = async () => {
            const token = localStorage.getItem('token');

            try {
                const [depRes, munRes] = await Promise.all([
                    fetch(`${BASE_URL}/locations/departamentos`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    }),
                    fetch(`${BASE_URL}/locations/municipios`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    })
                ]);

                if (depRes.ok) {
                    const deps = await depRes.json();
                    setDepartamentos(deps.data);
                }

                if (munRes.ok) {
                    const muns = await munRes.json();
                    setMunicipios(muns.data);
                }
            } catch (error) {
                console.error("Error al cargar departamentos y municipios:", error);
                alert("No se pudieron cargar los departamentos.");
            }
        };

        cargarUbicaciones();
    }, [tipo]);


    // Filtra municipios según el departamento seleccionado
    // Esto se usa solo en el formulario de predios nuevos (no en edición)
    const municipiosFiltrados = municipios.filter(
        mun => mun.id_departamento === Number(departamentoSeleccionado)
    );

    // ═══════════════════════════════════════════════════════════════
    // MANEJADORES DE CAMBIO
    // ═══════════════════════════════════════════════════════════════
    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        setDatosFormulario((datosAnteriores) => ({
            ...datosAnteriores, [name]: value
        }));
    };

    const handleDepartamentoChange = (e) => {
        setDepartamentoSeleccionado(e.target.value);
        setMunicipioSeleccionado('');
    };

    const handleMunicipioChange = (e) => {
        setMunicipioSeleccionado(e.target.value);
        setDatosFormulario((prev) => ({
            ...prev,
            id_municipio: Number(e.target.value)
        }));
    };

    // ═══════════════════════════════════════════════════════════════
    // ENVÍO DEL FORMULARIO
    // ═══════════════════════════════════════════════════════════════
    // Prepara la petición al backend según el tipo y luego la ejecuta.
    const enviarFormulario = async (evento) => {
        evento.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) return alert("Error: No estás logueado en el sistema.");

        try {
            let url, body, method;

            if (tipo === 'lugares') {
                if (modoEdicion && itemEditar) {
                    url = `${BASE_URL}/locations/lugares/${itemEditar.numero_registro}`;
                    method = 'PATCH';
                    body = { nuevoNombre: datosFormulario.nombre };
                } else {
                    url = `${BASE_URL}/locations/lugares`;
                    method = 'POST';
                    body = { nombre: datosFormulario.nombre };
                }

            } else if (tipo === 'lotes') {
                url = `${BASE_URL}/locations/lotes`;
                method = 'POST';
                body = {
                    numero: datosFormulario.numero,
                    area: datosFormulario.area,
                    tipoCultivo: datosFormulario.tipoCultivo
                };

            } else if (tipo === 'predios') {
                if (modoEdicion && itemEditar) {
                    url = `${BASE_URL}/locations/predios/${itemEditar.numero_registro}`;
                    method = 'PATCH';
                    body = {
                        nombre: datosFormulario.nombre,
                        area: datosFormulario.area
                    };
                } else {
                    if (!municipioSeleccionado) return alert("Debes seleccionar un municipio");
                    url = `${BASE_URL}/locations/predios`;
                    method = 'POST';
                    body = {
                        nombre: datosFormulario.nombre,
                        area: datosFormulario.area,
                        es_central: false,
                        id_municipio: datosFormulario.id_municipio,
                        direccion: datosFormulario.direccion,
                        id_lugar_produccion: null
                    };
                }
                    //asociar predio a lugar de producción
            } else if (tipo === 'asociar') {
                 console.log("numeroIca enviado:", datosFormulario.numeroIca);  // ← AGREGA ESTO
                if (!datosFormulario.numeroIca) return alert("Debes ingresar el número ICA del lugar de producción.");
                url = `${BASE_URL}/locations/predios/link`;
                method = 'PATCH';
                body = { 
                    numeroRegistro: datosFormulario.numeroIca,
                    id_predio: itemEditar.id
                };
                //desasociar predio de lugar de producción
            } else if (tipo === 'desasociar') {
                if (!itemEditar.id_lugar_produccion) return alert("El predio no está asociado a ningún lugar de producción.");
                url = `${BASE_URL}/locations/predio/unlink`;
                method = 'PATCH';
                body = { 
                    id_predio: itemEditar.id
                };
            } else if (tipo === 'eliminar') {
                if (!itemEditar) return alert("No hay elemento para eliminar.");
                // eliminar lugar
                if (itemEditar.numero_registro && !itemEditar.area) {
                    url = `${BASE_URL}/locations/lugares/delete/${itemEditar.numero_registro}`;
                }
                // eliminar predio
                else {
                    url = `${BASE_URL}/locations/predio/delete/${itemEditar.numero_registro}`;
                }
                method = 'DELETE';
                body = null;
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': 'Bearer ' + token,
                    ...(body ? { 'Content-Type': 'application/json' } : {})
                },
                ...(body ? { body: JSON.stringify(body) } : {})
                });

            const out = await res.json();

            if (out.status === 'success') {
                alert(tipo === 'asociar' ? 'Predio asociado exitosamente!' : modoEdicion ? 'Cambios guardados exitosamente!' : `${nombres[tipo]} creado exitosamente!`);
                onCancelar();
                if (onExito) {
                    onExito(); // Refresca la lista en el componente padre
                }
            } else {
                alert(out.message || "Error al guardar los cambios");
            }
        } catch (err) {
            console.error("Error de conexión:", err.message);
            alert("Error de conexión con el servidor. Inténtalo más tarde.");
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    // Define nombres legibles para cada tipo de formulario
    const nombres = {
        lugares: 'Lugar de Producción',
        lotes: 'Lote',
        predios: 'Predio',
        asociar: 'Lugar de Producción',
        desasociar: 'Desasociar Predio',
        eliminar: 'Eliminar'
    };

    // Renderiza el formulario según el tipo de acción que se está realizando.
    return (
        <div className="form-card">
            <h3 className='section-title'>{tipo === 'asociar' ? 'Asociar a Lugar de Producción' 
            : tipo === 'desasociar' ? 'Desasociar Predio'
            :tipo === 'eliminar' ? 'Eliminar'
            : modoEdicion ? `Editar ${nombres[tipo]}` 
            : `Crear nuevo ${nombres[tipo]}`}</h3>

            <form onSubmit={enviarFormulario}>

                {tipo === 'lugares' && (
                    <input
                        className="input-base"
                        name="nombre"
                        placeholder="Nombre del Lugar"
                        onChange={manejarCambio}
                        defaultValue={modoEdicion && itemEditar ? itemEditar.nombre : ''}
                        required
                    />
                )}

                {tipo === 'lotes' && (
                    <>
                        <input
                            className="input-base"
                            name="numero"
                            placeholder="Número de lote"
                            onChange={manejarCambio}
                            required
                        />
                        <input
                            className="input-base"
                            name="area"
                            placeholder="Área"
                            onChange={manejarCambio}
                            required
                        />
                        <input
                            className="input-base"
                            name="tipoCultivo"
                            placeholder="Tipo de cultivo"
                            onChange={manejarCambio}
                            required
                        />
                    </>
                )}

                {tipo === 'predios' && (
                    <>
                        <input
                            className="input-base"
                            name="nombre"
                            placeholder="Nombre del Predio"
                            onChange={manejarCambio}
                            defaultValue={modoEdicion && itemEditar ? itemEditar.nombre : ''}
                            required
                        />
                        <input
                            className="input-base"
                            name="area"
                            type="number"
                            step="any"
                            placeholder="Área total (hectáreas)"
                            onChange={manejarCambio}
                            defaultValue={modoEdicion && itemEditar ? itemEditar.area : ''}
                            required
                        />
                        <input
                            className="input-base"
                            name="direccion"
                            placeholder="Dirección"
                            onChange={manejarCambio}
                            disabled={modoEdicion}
                            required
                        />

                        <label htmlFor="departamento">(*) Departamento:</label>
                        <select
                            className="input-base"
                            id="departamento"
                            value={departamentoSeleccionado}
                            onChange={handleDepartamentoChange}
                            disabled={modoEdicion}
                            required
                        >
                            <option value="">Seleccione departamento</option>
                            {departamentos.map((dep) => (
                                <option key={dep.id_departamento} value={dep.id_departamento}>
                                    {dep.nombre}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="municipio">(*) Municipio:</label>
                        <select
                            className="input-base"
                            id="municipio"
                            value={municipioSeleccionado}
                            onChange={handleMunicipioChange}
                            disabled={modoEdicion || !departamentoSeleccionado}
                            required
                        >
                            <option value="">Seleccione municipio</option>
                            {municipiosFiltrados.map((mun) => (
                                <option key={mun.id_municipio} value={mun.id_municipio}>
                                    {mun.nombre}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {tipo === 'asociar' && (
                    <input
                        className="input-base"
                        name="numeroIca"
                        placeholder="Número ICA del Lugar de Producción"
                        onChange={manejarCambio}
                        required
                    />
                )}

                {tipo === 'desasociar' && (
                    <div>
                        <p>
                        ¿Estás seguro de que deseas desasociar el predio 
                        <strong> {itemEditar?.nombre} </strong>
                        del lugar de producción 
                        <strong> {itemEditar?.lugar_produccion?.nombre} </strong>?
                        </p>
                    </div>
                )}

                {tipo === 'eliminar' && (
                    <div>
                        <p>¿Estás seguro de que deseas eliminar este{" "}
                            <strong>{itemEditar?.area ? 'predio' : 'lugar de producción'}</strong>
                            ?
                        </p>

                        <p>Nombre:<strong> {itemEditar?.nombre} </strong></p>
                    </div>
                )}

                <div className="contenedor-botones">
                    <button type="submit" className="btn-secundary">
                        {tipo === 'asociar' ? 'Asociar' :
                        tipo === 'desasociar' ? 'Desasociar':
                        tipo === 'eliminar' ? 'Eliminar' :
                        modoEdicion ? 'Guardar cambios' : 'Crear'}
                    </button>
                    
                    <button type="button" className="btn-secundary cancel" onClick={onCancelar}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FormularioTerreno;