/*Aquí establecemos la lógica para gestionar los lugares de producción
Este es el intermediario entre la vista y el servicio API.
Aquí se definen las funciones que se van a usar en la vista.
*/

import { useState, useEffect } from 'react';
import {crearLugar, editarLugar, eliminarLugar, verLugar} from './servicioAPILugar';

export const LogicaLugar = () => {
    //memoria del navegador para almacenar el token cuando está logueado
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('usuario'));

    //diferentes estados de la pantalla
    const [listaLugares, setListaLugares] = useState([]);         // para mostrar la lista de lugares 
    const [estaCargando, setEstaCargando] = useState(true);       // para mostrar un mensaje de "cargando" mientras se obtiene la lista de lugares
    const [pantallaActual, setPantallaActual] = useState('lista'); // para controlar el tipo de formulario que se ve en la pantalla
    const [lugarSeleccionado, setLugarSeleccionado] = useState(null); // para controlar el lugar que se elige para editar/borrar
    const [datosFormulario, setDatosFormulario] = useState({nombre: ''}); // para almacenar los datos que se ingresan en los formularios de crear/editar
    const [verPredios, setVerPredios] = useState(false); // para controlar la visualización de los predios asociados a un lugar
    const [lugarPredios, setLugarPredios] = useState(null); // para almacenar el lugar del cual se quieren ver los predios asociados
    const [verLotes, setVerLotes] = useState(false);
    const [lugarLotes, setLugarLotes] = useState(null);

    useEffect(() => {
            fetchDatos();
    }, []);

    const fetchDatos = async () => {
        if (!token || !user) return; // Si no hay token o usuario, no intentamos obtener los datos
        try {
            setEstaCargando(true); // Activa el indicador visual "Cargando..."
            const respuestaServidor = await verLugar(user.id, token);
            if (respuestaServidor.status === 'success') { // Si la respuesta es exitosa, actualizamos la lista de lugares con los datos obtenidos
                setListaLugares([...respuestaServidor.data].reverse()); // Invertimos el orden para mostrar los lugares más recientes primero
            } else {
                setListaLugares([]); // Si la respuesta no es exitosa, limpiamos la lista
            }

        } catch (error) {
            console.error("Error al obtener lugares:", error);
            setListaLugares([]); // limpia la lista en caso de error

        } finally {
            setEstaCargando(false);
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
            if (pantallaActual === 'editar' && lugarSeleccionado) {
                // Si estamos editando, llamamos al servicio de editar
                const rta = await editarLugar(lugarSeleccionado.numero_registro, datosFormulario.nombre, token); //la lógica llama al servicio API
        
                alert(rta.message);
            } else {
                // Si no, asumimos que estamos creando uno nuevo
                const rta = await crearLugar(datosFormulario.nombre, token); //la lógica llama al servicio API
                alert(rta.message);
            }

            // Después de guardar, limpiamos el borrador y volvemos a la lista
            setDatosFormulario({nombre: ''});
            setLugarSeleccionado(null);
            setPantallaActual('lista');
            refrescarDatos();
        } catch (error) {
            console.error("Error al procesar el formulario:", error);
            alert("Hubo un error al guardar los datos.");
        }
    };

    // Al dar clic al botón "+"
    const manejarAgregar = () => {
        setLugarSeleccionado(null);       // Limpiamos el lugar seleccionado anteriormente
        setDatosFormulario({nombre: ''}); // borramos cualquier dato previo en el formulario
        setPantallaActual('crear');        // Cambiamos el cartel a modo 'crear'
    };

    // Al dar clic al lápiz de una fila
    const manejarEditar = (lugar) => {
        setLugarSeleccionado(lugar);       // Capturamos el lugar específico que se va a editar
        setDatosFormulario({nombre: lugar.nombre}); // Rellenamos el campo con el nombre actual del lugar
        setPantallaActual('editar');       // Cambiamos el cartel a modo 'editar'
    };

    // Al dar clic al bote de basura
    const manejarEliminar = (lugar) => {
        setLugarSeleccionado(lugar); // Capturamos el lugar específico que se va a eliminar
        setPantallaActual('eliminar');     // Cambiamos el cartel a modo 'eliminar'
    };
    
    const cancelarFormulario = () => { 
    setLugarSeleccionado(null); 
    setPantallaActual('lista');
    setDatosFormulario({ nombre: '' });
};

    const confirmarEliminar = async () => {
        try {
            await eliminarLugar(lugarSeleccionado.numero_registro, token);
            alert("Lugar eliminado correctamente");

            setLugarSeleccionado(null);
            setPantallaActual('lista');

            refrescarDatos();
        } catch(error) {
            console.error(error);
        }
    };

    const manejarVerPredios = (lugar) => { // Al dar clic al botón "Predios asociados"
    setLugarPredios(lugar); // Guardamos el lugar del cual queremos ver los predios asociados
    setVerPredios(true); // cambiamos el estado para mostrar la sección de predios asociados
    };

    const volverDesdePredios = () => { // al darle clic a la flecha para volver desde predios asociados
        setVerPredios(false);
        setLugarPredios(null);
    };

    const manejarVerLotes = (lugar) => { /* Al hacer clic en "Lotes actuales" */
        setLugarLotes(lugar); // Guardamos el lugar seleccionado
        setVerLotes(true); // Mostramos la vista de lotes
    };

    const volverDesdeLotes = () => { /* Permite regresar desde la vista de lotes */
        setVerLotes(false);
        setLugarLotes(null);    
    };


    // Para formatear los datos que se muestran en las tarjetas
    const obtenerDatos = (lugar) => { // Recibe datos del backend con "label" y "valor" para mostrar en la tarjeta
        
        // 1. Calculamos el área cultivada sumando la propiedad '.area' de cada lote anidado
        const areaCultivadaCalculada = lugar.lotes?.reduce((total, lote) => {
            return total + parseFloat(lote.area || 0);
        }, 0).toFixed(2) || "0.00"; 

        return [/*la información que se ve apenas se cargan los lugares creados */
            { label: 'N° Registro ICA', valor: lugar.numero_registro },
            { label: 'Área Total', valor: (lugar.areaTotal || 0) + ' Ha' },
            { label: 'Área Cultivada', valor: areaCultivadaCalculada + ' Ha' },
            { label: 'Predio Central', valor: lugar.predioCentral?.nombre || 'N/A' }
        ];
    };
    // ENTREGAMOS LAS VARIABLES Y FUNCIONES A LA VISTA JSX
    return {
        listaLugares,
        estaCargando,
        pantallaActual,
        lugarSeleccionado,
        datosFormulario,
        verPredios,
        lugarPredios,
        verLotes,
        lugarLotes,
        manejarCambio,
        enviarFormulario,
        manejarAgregar,
        manejarEditar,
        manejarEliminar,
        cancelarFormulario,
        obtenerDatos,
        confirmarEliminar,
        refrescarDatos,
        manejarVerPredios,
        volverDesdePredios,
        manejarVerLotes,
        volverDesdeLotes
    };
};

