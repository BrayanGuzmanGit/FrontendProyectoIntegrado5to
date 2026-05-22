/*Aquí establecemos los fetch que actúan como mensajeros entre la vista y 
el servicio API proveniente del backend */
import BASE_URL from '@/services/api-entidades';

/*Definimos las funcionalidades de gestionar lotes (crear, editar, eliminar, ver) */
/*Exportamos las constantes donde realizamos la conexión con el API para 
luego pasárselas a al archivo que maneja la lógica de los lugares (logicaLote)*/

/*crear lote*/
export const crearLote = async (datosFormulario, idLugarProduccion, token) => { /*Recibe los valores enviados por la lógica*/
    /*se construye la petición http */
    const respuesta = await fetch(`${BASE_URL}/locations/lotes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
            numero_lote: datosFormulario.numero_lote,
            area: datosFormulario.area,
            cantidad_plantas: datosFormulario.cantidad_plantas,
            uidlugarproduccion: idLugarProduccion,
            uidcultivo: datosFormulario.uidcultivo
        })
    });
    return respuesta.json(); /* convierte la respuesta JSON a objeto para que el frontend lo pueda usar*/
};

/*Editar lote*/
export const editarLote = async (numero_registro, datosFormulario, token) => {
    console.log("Console en servicio APILOTE de datos formulario editar lote: " + datosFormulario);
    const respuesta = await fetch(`${BASE_URL}/locations/lotes/${numero_registro}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
            area: datosFormulario.area,
            cantidadproyectadarecoleccion: datosFormulario.cantidadproyectadarecoleccion,
            fecharecoleccion: datosFormulario.fecharecoleccion,
            cantidad_recoleccion: datosFormulario.cantidad_recoleccion,
            cantidad_plantas: datosFormulario.cantidad_plantas,
            uidlugarproduccion: datosFormulario.uidlugarproduccion
        })
    });
    return respuesta.json();
};

/*Eliminar lote*/
export const eliminarLote = async (numero_registro, uidlugarproduccion, token) => {
    const respuesta = await fetch(`${BASE_URL}/locations/lotes/${numero_registro}/${uidlugarproduccion}`, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + token
        },
    });
    return respuesta.json();
}

/*Ver lote*/
export const verLote = async (id_productor, token) => {
    const respuesta = await fetch(`${BASE_URL}/locations/lotes/${id_productor}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
    });
    return respuesta.json();
}

/*Obtener cultivos*/
export const obtenerCultivos = async (token) => {
    const respuesta = await fetch(`${BASE_URL}/crops/cultivos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
    });
    return respuesta.json();
}