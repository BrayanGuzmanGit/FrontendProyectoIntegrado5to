/*Aquí establecemos la lógica para gestionar los predios
Este es el intermediario entre la vista y el servicio API.
Aquí se definen las funciones que se van a usar en la vista.
*/

import { useState, useEffect } from 'react';
import {crearPredio, editarPredio, eliminarPredio, verPredio, asociarPredio, desasociarPredio ,obtenerDepartamentos, obtenerMunicipios} from './servicioAPIpredio';

export const LogicaPredio = () => {
    //memoria del navegador para almacenar el token cuando está logueado
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('usuario'));

    //diferentes estados de la pantalla
    const [listaPredios, setListaPredios] = useState([]);         // para mostrar la lista de predios
    const [estaCargando, setEstaCargando] = useState(true);       // para mostrar un mensaje de "cargando" mientras se obtiene la lista de predios
    const [pantallaActual, setPantallaActual] = useState('lista'); // para controlar el tipo de formulario que se ve en la pantalla
    const [predioSeleccionado, setPredioSeleccionado] = useState(null); // para controlar el predio que se elige para editar/borrar
    const formularioInicial = { nombre: '', area: '', id_departamento: '', id_municipio: '', direccion: ''}; //campos definidos del formulario crear
    const [datosFormulario, setDatosFormulario] = useState(formularioInicial); // para almacenar los datos que se ingresan en los formularios de crear/editar
    const [listaDepartamentos, setListaDepartamentos] = useState([]); // para almacenar la lista de departamentos obtenida del backend
    const [listaMunicipios, setListaMunicipios] = useState([]); // para almacenar la lista de municipios obtenida del backend
    
    useEffect(() => {
            fetchDatos();
            cargarUbicaciones();
    }, []);

    const fetchDatos = async () => {
        if (!token || !user) return; // Si no hay token o usuario, no intentamos obtener los datos
        try {
            setEstaCargando(true); // Activa el indicador visual "Cargando..."
            const respuestaServidor = await verPredio(user.id, token);
            if (respuestaServidor.status === 'success') { // Si la respuesta es exitosa, actualizamos la lista de predios con los datos obtenidos
                setListaPredios([...respuestaServidor.data].reverse()); // Invertimos el orden para mostrar los predios más recientes primero
            } else {
                setListaPredios([]); // Si la respuesta no es exitosa, limpiamos la lista
            }

        } catch (error) {
            console.error("Error al obtener predios:", error);
            setListaPredios([]); // limpia la lista en caso de error

        } finally {
            setEstaCargando(false);
        }
    };

    const cargarUbicaciones = async () => { /*aquí se obtiene la lista de departamentos y municipios */

        try {

            /*Promise.all permite ejecutar ambas peticiones simultáneamente para mejorar rendimiento.*/
            const [
                respuestaDepartamentos, respuestaMunicipios
                ] = await Promise.all([ obtenerDepartamentos(token), obtenerMunicipios(token)]);

            // Guardamos departamentos obtenidos desde backend
            if (respuestaDepartamentos.status === 'success') {
                setListaDepartamentos(
                    respuestaDepartamentos.data);
            }
            // Guardamos municipios obtenidos desde backend
            if (respuestaMunicipios.status === 'success') {
                setListaMunicipios(
                    respuestaMunicipios.data);

            }

        }  catch (error) {
            console.error('Error al cargar ubicaciones:',error);
            }
    };



    /*El backend entrega TODOS los municipios. Por eso filtramos únicamente los que pertenecen al departamento seleccionado actualmente.*/
    const municipiosFiltrados = listaMunicipios.filter(
        (municipio) => municipio.id_departamento === Number(datosFormulario.id_departamento)
    );
    


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

     /*Este cambio requiere lógica adicional porque:
    - el municipio depende del departamento
    - al cambiar departamento, el municipio anterior deja de ser válido*/
    const manejarCambioDepartamento = (evento) => {
        const idDepartamento = evento.target.value;
        setDatosFormulario((datosAnteriores) => ({
            ...datosAnteriores, id_departamento: idDepartamento,  id_municipio: ''
            // Guardamos nuevo departamento y reseteamos municipio porque ya no es válido
        }));
    };

    const enviarFormulario = async (evento) => {
        evento.preventDefault(); /*Evita recargar la página*/

        if (!token) {
            console.error("Usuario no autenticado");
            return;
        }

    try {
            if (pantallaActual === 'editar' && predioSeleccionado) {
                // Si estamos editando, llamamos al servicio de editar
                const rta = await editarPredio(predioSeleccionado.numero_registro, datosFormulario, token); //la lógica llama al servicio API
                alert(rta.message);

            } else if (pantallaActual === 'asociar') { //si estamos asociando, llamamos al servicio asociar
                const rta = await asociarPredio( datosFormulario.numero_registro, predioSeleccionado.id, token);
                alert(rta.message);
            }else {
                // Si no, asumimos que estamos creando uno nuevo
                const rta = await crearPredio(datosFormulario, token); //la lógica llama al servicio API
                alert(rta.message);
            }

            // Después de guardar, limpiamos el borrador y volvemos a la lista
            setDatosFormulario(formularioInicial);
            setPredioSeleccionado(null);
            setPantallaActual('lista');
            refrescarDatos();
        } catch (error) {
            console.error("Error al procesar el formulario:", error);
            alert("Hubo un error al guardar los datos.");
        }
    };

    // Al dar clic al botón "+"
    const manejarAgregar = () => {
        setPredioSeleccionado(null);       // Limpiamos el predio seleccionado anteriormente
        setDatosFormulario(formularioInicial); // borramos cualquier dato previo en el formulario
        setPantallaActual('crear');        // Cambiamos el cartel a modo 'crear'
    };

    // Al dar clic al lápiz de una fila
    const manejarEditar = (predio) => {
        const municipioEncontrado = listaMunicipios.find(
        (municipio) => municipio.id_municipio === predio.id_municipio
    );
        setPredioSeleccionado(predio);       // Capturamos el predio específico que se va a editar
        setDatosFormulario({nombre: predio.nombre, area: predio.area, id_departamento: municipioEncontrado?.id_departamento, 
            id_municipio: predio.id_municipio, direccion: predio.direccion}); // Rellenamos los campos con los valores actuales del predio
        setPantallaActual('editar');       // Cambiamos el cartel a modo 'editar'
        console.log(predio);
    };

    // Al dar clic al bote de basura
    const manejarEliminar = (predio) => {
        setPredioSeleccionado(predio); // Capturamos el predio específico que se va a eliminar
        setPantallaActual('eliminar');     // Cambiamos el cartel a modo 'eliminar'
    };

    /*Al hacder clic al botón asociar a lugar de producción*/
    const manejarAsociar = (predio) => {
        setPredioSeleccionado(predio);  // Guardamos el predio seleccionado
        setDatosFormulario({ ...formularioInicial,numero_registro: ''}); // Reiniciamos formulario temporal
        setPantallaActual('asociar');// Cambiamos interfaz al formulario de asociación
    };

    /*Abre el modal de confirmación para desasociar un predio*/
    const manejarDesasociar = (predio) => {
        setPredioSeleccionado(predio); // Guardamos el predio seleccionado
        setPantallaActual('desasociar');  // Cambiamos interfaz al modo desasociar
    };
    
    const cancelarFormulario = () => { 
    setPredioSeleccionado(null); 
    setPantallaActual('lista');
    setDatosFormulario({});
};

    const confirmarEliminar = async () => {
        try {
            await eliminarPredio(predioSeleccionado.numero_registro, token);
            alert("Predio eliminado correctamente");

            setPredioSeleccionado(null);
            setPantallaActual('lista');

            refrescarDatos();
        } catch(error) {
            console.error(error);
        }
    };

    /*Confirma la desasociación del predio del lugar de producción*/
    const confirmarDesasociar = async () => {
        try {
            await desasociarPredio(predioSeleccionado.id, token);
            alert('Predio desasociado correctamente');

            setPredioSeleccionado(null);
            setPantallaActual('lista');

            refrescarDatos();
        } catch (error) {
            console.error(error);
            alert('Error al desasociar predio');
        }
    };




    // Para formatear los datos que se muestran en las tarjetas
    const obtenerDatos = (predio) => { // Recibe datos del backend con "label" y "valor" para mostrar en la tarjeta
        return [ /*la información que se ve apenas se cargan los predios creados */
            { label: 'N° Registro', valor: predio.numero_registro },
                { label: 'Nombre', valor: predio.nombre },
                { label: 'Área', valor: (predio.area || 0) + ' Ha' },
                { label: 'Municipio', valor: predio.municipio?.nombre || 'N/A' },
                { label: 'Dirección', valor: predio.direccion},
                { label: 'Lugar de Producción', valor: predio.lugar_produccion?.nombre || 'Sin asignar' }
        ];
    };
    // ENTREGAMOS LAS VARIABLES Y FUNCIONES A LA VISTA JSX
    return {
        listaPredios,
        estaCargando,
        pantallaActual,
        predioSeleccionado,
        datosFormulario,
        listaDepartamentos,
        municipiosFiltrados,
        manejarCambio,
        manejarCambioDepartamento,
        enviarFormulario,
        manejarAgregar,
        manejarEditar,
        manejarEliminar,
        manejarAsociar,
        manejarDesasociar,
        cancelarFormulario,
        obtenerDatos,
        confirmarEliminar,
        confirmarDesasociar,
        refrescarDatos,
    };
};

