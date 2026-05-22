/*Aquí establecemos la lógica para gestionar los lotes
Este es el intermediario entre la vista y el servicio API.
Aquí se definen las funciones que se van a usar en la vista.
*/

import { useState, useEffect } from 'react';
import {crearLote, editarLote, eliminarLote, verLote, obtenerCultivos} from './servicioAPILote';

export const LogicaLote= (lugar) => {
    //memoria del navegador para almacenar el token cuando está logueado
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('usuario'));

    //diferentes estados de la pantalla
    const [listaLotes, setListaLotes] = useState([]);         // para mostrar la lista de lotes
    const [estaCargando, setEstaCargando] = useState(true);       // para mostrar un mensaje de "cargando" mientras se obtiene la lista de lotes
    const [pantallaActual, setPantallaActual] = useState('lista'); // para controlar el tipo de formulario que se ve en la pantalla
    const [loteSeleccionado, setLoteSeleccionado] = useState(null); // para controlar el lote que se elige para editar/borrar
    const formularioInicial = {numero_lote: '', area: '', cantidad_plantas: '', uidcultivo: '', 
    fechasiembra: '',cantidadproyectadarecoleccion: '', cantidad_recoleccion: '', fecharecoleccion: ''};    
    const [datosFormulario, setDatosFormulario] = useState(formularioInicial); // para almacenar los datos que se ingresan en los formularios de crear/editar
    const [listaCultivos, setListaCultivos] = useState([]); // para almacenar la lista de cultivos

    useEffect(() => {
            fetchDatos();
            cargarCultivos();
    }, []);

    const fetchDatos = async () => {
        if (!token || !user) return; // Si no hay token o usuario, no intentamos obtener los datos
        try {
            setEstaCargando(true); // Activa el indicador visual "Cargando..."
            const respuestaServidor = await verLote(lugar.id, token);
            if (respuestaServidor.status === 'success') { // Si la respuesta es exitosa, actualizamos la lista lotes con los datos obtenidos
                setListaLotes([...respuestaServidor.data].reverse()); // Invertimos el orden para mostrar los lotes más recientes primero
            } else {
                setListaLotes([]); // Si la respuesta no es exitosa, limpiamos la lista
            }

        } catch (error) {
            console.error("Error al obtener lotes:", error);
            setListaLotes([]); // limpia la lista en caso de error

        } finally {
            setEstaCargando(false);
        }
    };

    const cargarCultivos = async () => {
        try {
            const respuestaServidor = await obtenerCultivos(token);
            if (respuestaServidor.status === 'success') {
                // Guardamos cultivos obtenidos desde backend
                setListaCultivos(respuestaServidor.data);
            } else {
                setListaCultivos([]);
            }

        } catch (error) {
            console.error('Error al obtener cultivos:', error);
            setListaCultivos([]);
        }
    };

    const refrescarDatos = () => {
        setEstaCargando(true); // Muestra "Cargando..." mientras se obtienen los datos
        fetchDatos(); // Vuelve a cargar los datos del backend
    };


    /* maneja los cambios en tiempo real del formulario */
    const manejarCambio = (evento) => { 
        const { name, value } = evento.target; /*nombre para identificar el campo del formulario y value para almacenar lo que se ingresa en ese campo */
        setDatosFormulario((datosAnteriores) => ({ 
            ...datosAnteriores, [name]: value /*actualiza el estado de datosFormulario con los nuevos valores ingresados, mantiene los valores anteriores o actualiza el valor del input específico */
        }));
    };

    const enviarFormulario = async (evento) => {
        evento.preventDefault(); /*Evita recargar la página*/

        if (!token) {
            console.error("Usuario no autenticado");
            return;
        }

    try {
            if (pantallaActual === 'editar' && loteSeleccionado) {
                // Si estamos editando, llamamos al servicio de editar
                const rta = await editarLote(loteSeleccionado.numero_registro, datosFormulario, token); //la lógica llama al servicio API
                alert(rta.message);
            } else {
                // Si no, asumimos que estamos creando uno nuevo
                const rta = await crearLote(datosFormulario, lugar.id, token); //la lógica llama al servicio API
                alert(rta.message);
            }

            // Después de guardar, limpiamos el borrador y volvemos a la lista
            setDatosFormulario(formularioInicial);
            setLoteSeleccionado(null);
            setPantallaActual('lista');
            refrescarDatos();
        } catch (error) {
            console.error("Error al procesar el formulario:", error);
            alert("Hubo un error al guardar los datos.");
        }
    };

    // Al dar clic al botón "+"
    const manejarAgregar = () => {
        setLoteSeleccionado(null);       // Limpiamos el lote seleccionado anteriormente
        setDatosFormulario(formularioInicial); // borramos cualquier dato previo en el formulario
        setPantallaActual('crear');        // Cambiamos el cartel a modo 'crear'
    };

    // Al dar clic al lápiz de una fila
    const manejarEditar = (lote) => {
        setLoteSeleccionado(lote);       // Capturamos el lote específico que se va a editar
        setDatosFormulario({ numero_lote: lote.numero_lote, area: lote.area,
        cantidad_plantas: lote.cantidad_plantas, uidcultivo: lote.uidcultivo,
        numero_registro: lote.numero_registro, cantidadproyectadarecoleccion: lote.cantidadproyectadarecoleccion,
        cantidad_recoleccion: lote.cantidad_recoleccion,
        fechasiembra: lote.fechasiembra?.split('T')[0],
        fecharecoleccion: lote.fecharecoleccion?.split('T')[0],
        uidlugarproduccion: lote.uidlugarproduccion}); 
        setPantallaActual('editar');       // Cambiamos el cartel a modo 'editar'
    };

    // Al dar clic al bote de basura
    const manejarEliminar = (lote) => {
        setLoteSeleccionado(lote); // Capturamos el lote específico que se va a eliminar
        setPantallaActual('eliminar');     // Cambiamos el cartel a modo 'eliminar'
    };
    
    const cancelarFormulario = () => { 
    setLoteSeleccionado(null); 
    setPantallaActual('lista');
    setDatosFormulario({});
};

    const confirmarEliminar = async () => {
        try {
            await eliminarLote(loteSeleccionado.numero_registro, lugar.id, token);
            alert("Lote eliminado correctamente");

            setLoteSeleccionado(null);
            setPantallaActual('lista');

            refrescarDatos();
        } catch(error) {
            console.error(error);
        }
    };


    // Para formatear los datos que se muestran en las tarjetas
    const obtenerDatos = (lote) => { // Recibe datos del backend con "label" y "valor" para mostrar en la tarjeta
        // Buscar el cultivo completo usando el uid
    const cultivoEncontrado = listaCultivos.find(
        (cultivo) => cultivo.numero_registro === lote.uidcultivo);
        return [/*la información que se ve apenas se cargan los lotes creados */
            { label: 'N° Registro ICA', valor: lote.numero_registro },
            { label: 'N° Lote', valor: lote.numero_lote },
            { label: 'Área', valor: (lote.area || 0) + ' Ha' },
            { label: 'Tipo de Cultivo', valor: cultivoEncontrado?.nombre_comun },
            { label: 'Cantidad de plantas', valor: lote.cantidad_plantas },
            { label: 'Fecha de siembra', valor: lote.fechasiembra },
            { label: 'Cantidad proyectada de recoleccion', valor: (lote.cantidadProyectadaRecoleccion || '(Sin especificar)') },
            { label: 'cantidad recolección', valor: (lote.cantidad_recoleccion|| 'Sin especificar') },
            { label: 'Fecha de recolección', valor: (lote.fecha_recoleccion|| 'Sin especificar') },
        ];
    };
    // ENTREGAMOS LAS VARIABLES Y FUNCIONES A LA VISTA JSX
    return {
        listaLotes,
        listaCultivos,
        estaCargando,
        pantallaActual,
        loteSeleccionado,
        datosFormulario,
        manejarCambio,
        enviarFormulario,
        manejarAgregar,
        manejarEditar,
        manejarEliminar,
        cancelarFormulario,
        obtenerDatos,
        confirmarEliminar,
        refrescarDatos,
    };
};

