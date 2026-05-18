import React, { useState, useEffect } from 'react';
import './GestionarTerrenos.css';
import BASE_URL from '@/services/api-entidades';
import ListaTerrenos from './ListarTerrenos';
import FormularioTerreno from './FormulariosTerrenos';
import PrediosAsociados from './PrediosAsociados';
import LotesActuales from './lotesActuales';

// Componente principal que maneja la gestión de lugares de producción, lotes y predios
// Recibe 'tipo' como prop para determinar qué tipo de entidad mostrar
function VisualizarTerreno({ tipo }) {
    // Estados para manejar los datos y la UI
    const [lugares, setLugares] = useState([]); // Array con los datos obtenidos del backend
    const [cargando, setCargando] = useState(true); // Controla si mostrar "Cargando..."
    const [modo, setModo] = useState('lista'); // 'lista', 'crear', 'asociar'
    const [itemEditando, setItemEditando] = useState(null); // Item que se está editando o asociando

    // Función que obtiene los datos del backend según el tipo (lugares, lotes, predios)
    // Se ejecuta al montar el componente y cuando cambia el tipo
    const fetchDatos = async () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('usuario'));

        try {
            let url;

            // Determina la URL según el tipo de entidad
            if (tipo === 'lugares') {
                url = `${BASE_URL}/locations/lugares/${user.id}`;
            } else if (tipo === 'lotes') {
                url = `${BASE_URL}/locations/lotes/${user.id}`;
            } else if (tipo === 'predios') {
                url = `${BASE_URL}/locations/predios/${user.id}`;
            } else {
                throw new Error('Tipo desconocido');
            }

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await res.json();
            console.log("Datos obtenidos: ", data);

            if (data.status === 'success') {
                setLugares(data.data); // Actualiza el estado con los datos del backend
            } else {
                console.error('Error:', data.message);
                setLugares([]);
            }
        } catch (err) {
            console.error("Error al obtener datos: ", err.message);
            setLugares([]);
        } finally {
            setCargando(false); // Oculta el indicador de carga
        }
    };

    // useEffect que se ejecuta al montar el componente y cuando cambia 'tipo'
    // Establece el título de la página y carga los datos iniciales
    useEffect(() => {
        document.title = 'Panel de gestión';
        fetchDatos();
    }, [tipo]);

    // Función que formatea los datos de cada item para mostrarlos en la lista
    // Devuelve un array de objetos con label y valor según el tipo
    const obtenerDatos = (item) => {
        console.log("Datos obtenidos: ", item.predioCentral);
        if (tipo === 'lugares') {
            return [
                { label: 'N° Registro ICA', valor: item.numero_registro },
                { label: 'Área Total', valor: (item.areaTotal || 0) + ' Ha' },
                { label: 'Área Cultivada', valor: (item.areaCultivada || 0) + ' Ha' },
                { label: 'Predio Central', valor: item.predioCentral?.nombre || 'N/A' }
            ];
        }
        if (tipo === 'lotes') {
            return [
                { label: 'N° Registro', valor: item.numero_registro },
                { label: 'N° Lote', valor: item.numero_lote },
                { label: 'Área', valor: (item.area || 0) + ' Ha' },
                { label: 'cantidad proyectada recoleccion', valor: item.cantidadProyectadaRecoleccion },
                { label: 'Fecha de recolección', valor: item.fecha_recoleccion },
                { label: 'cantidad recolección', valor: item.cantidad_recoleccion },
                { label: 'Cantidad de plantas', valor: item.cantidad_plantas },
                { label: 'Cultivo', valor: item.uidcultivo },
                { label: 'Fecha de siembra', valor: item.fechasiembra }
                
                
            ];
        }
        if (tipo === 'predios') {
            return [
                { label: 'N° Registro', valor: item.numero_registro },
                { label: 'Nombre', valor: item.nombre },
                { label: 'Área', valor: (item.area || 0) + ' Ha' },
                { label: 'Municipio', valor: item.municipio?.nombre || 'N/A' },
                { label: 'Dirección', valor: item.direccion},
                { label: 'Lugar de Producción', valor: item.lugar_produccion?.nombre || 'Sin asignar' }
            ];
        }
        return [];
    };

    // Funciones para manejar los eventos 
    const handleAgregar = () => {
        setItemEditando(null); // No hay item para editar (es creación)
        setModo('crear'); // Cambia al modo de creación
    };

    const handleEditar = (item) => {
        setItemEditando(item); // Guarda el item que se va a editar
        setModo('crear'); // Usa el mismo modo 'crear' pero con modoEdicion=true
    };

    const handleEliminar = (item) => {
    setItemEditando(item); // guarda el item a eliminar
    setModo('eliminar');   // cambia al modo eliminar
    };

    const handleAsociar = (item) => {
        setItemEditando(item); // Guarda el predio que se va a asociar
        setModo('asociar'); // Cambia al modo de asociación
    };

    const handleDesasociar = (item) => {
        setItemEditando(item); // quita el predio que se va a desasociar
        setModo('desasociar'); // Cambia al modo de desasociación
    };

    const handleVerPredios = (item) => {
    setItemEditando(item);
    setModo('prediosAsociados');
    };

    const handleVerLotes = (item) => {
        setItemEditando(item);
        setModo('LotesActuales');
    };

    const handleAgregarLote = (lugar) => {
    setItemEditando(lugar);
    setModo('crear-lote');
};

    // Función que refresca los datos después de una operación exitosa
    // Se llama desde el formulario cuando se crea/edita/asocia algo
    const refrescarDatos = () => {
        setCargando(true); // Muestra "Cargando..." mientras se obtienen los datos
        fetchDatos(); // Vuelve a cargar los datos del backend
    };

    return (
        <section className="card">
            {/* Título dinámico según el tipo */}
            <h2 className="card-title">
                {tipo === 'lugares' && 'Lugares de Producción'}
                {tipo === 'lotes' && 'Lotes'}
                {tipo === 'predios' && 'Predios'}
            </h2>

            {/* Modo lista: muestra la tabla de datos */}
            {modo === 'lista' && (
                <>
                    {cargando ? (
                        <p>Cargando...</p>
                    ) : lugares.length === 0 ? (
                        <p>No hay registros.</p>
                    ) : (
                        <ListaTerrenos
                            lugares={lugares}
                            tipo={tipo}
                            obtenerDatos={obtenerDatos}
                            onEditar={handleEditar}
                            onEliminar={handleEliminar}
                            onAsociar={handleAsociar}
                            onDesasociar={handleDesasociar}
                            onVerPredios={handleVerPredios}
                            onVerLotes={handleVerLotes}
                        />
                    )}

                    {/* Botón flotante para agregar nuevos items */}
                    <button className="fab-add" onClick={handleAgregar}>
                        +
                    </button>
                </>
            )}

            {/* Modo crear/editar: muestra el formulario */}
            {modo === 'crear' && (
                <FormularioTerreno
                    tipo={tipo}
                    onExito={refrescarDatos} // Refresca la lista después de guardar
                    onCancelar={() => {
                        setItemEditando(null);
                        setModo('lista');
                    }}
                    modoEdicion={itemEditando !== null}
                    itemEditar={itemEditando}
                />
            )}

            {/* Modo asociar: muestra el formulario de asociación */}
            {modo === 'asociar' && (
                <FormularioTerreno
                    tipo="asociar"
                    onExito={refrescarDatos} // Refresca la lista después de asociar
                    onCancelar={() => {
                        setItemEditando(null);
                        setModo('lista');
                    }}
                    itemEditar={itemEditando}
                />
            )}

            {modo === 'crear-lote' && (
                <FormularioTerreno
                    tipo="lotes"
                    itemEditar={itemEditando}
                    onExito={refrescarDatos}
                    onCancelar={() => {
                        setModo('ver-lotes');
                    }}
                />
            )}

            {/* Modo desasociar: usa el formulario para desasociar con backend */}
            {/* Modo eliminar: usa el formulario para confirmar eliminación con backend */}
            {(modo === 'desasociar' || modo === 'eliminar') && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <FormularioTerreno
                            tipo={modo}
                            tipoOriginal={tipo}
                            onExito={() => {
                                setItemEditando(null);
                                setModo('lista');
                                refrescarDatos();
                            }}
                            onCancelar={() => {
                                setItemEditando(null);
                                setModo('lista');
                            }}
                            itemEditar={itemEditando}
                        />
                    </div>
                </div>
            )}

            {modo === 'prediosAsociados' && (
                <PrediosAsociados
                    lugar={itemEditando}
                    onVolver={() => {
                        setItemEditando(null);
                        setModo('lista');
                        refrescarDatos();
                    }}
                />
            )}

            {modo === 'LotesActuales' && (
                <LotesActuales
                    lugar={itemEditando}
                    onAgregarLote={handleAgregarLote}
                    onVolver={() => {
                        setItemEditando(null);
                        setModo('lista');
                        refrescarDatos();
                    }}
                />
            )}
        </section>
    );
}

export default VisualizarTerreno;