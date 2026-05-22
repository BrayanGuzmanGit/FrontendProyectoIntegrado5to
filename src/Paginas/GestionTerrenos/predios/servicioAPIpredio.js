/*Aquí establecemos los fetch que actúan como mensajeros entre la vista y 
el servicio API proveniente dedl backend */
import BASE_URL from '@/services/api-entidades';

/*Definimos las funcionalidades de gestionar predios (crear, editar, eliminar, ver, asociar, desasociar) */
/*Exportamos las constantes donde realizamos la conexión con el API para 
luego pasárselas a al archivo que maneja la lógica de los predios (logicaPredio)*/

/*crear predio*/
export const crearPredio = async (datosFormulario, token) =>{
    const respuesta = await fetch(`${BASE_URL}/locations/predios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        },
        body: JSON.stringify({
            nombre: datosFormulario.nombre,
            area: datosFormulario.area,
            es_central: false,
            id_municipio: datosFormulario.id_municipio,
            direccion: datosFormulario.direccion,
            id_lugar_produccion: null
        })
    });
    return respuesta.json();
}

/*Editar predio*/
export const editarPredio = async (numero_registro, datosFormulario, token) =>{
    const respuesta = await fetch (`${BASE_URL}/locations/predios/${numero_registro}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        },
        body: JSON.stringify({
            nombre: datosFormulario.nombre,
            area: datosFormulario.area
        })
    });
    return respuesta.json();
}

/*Eliminar predio*/
export const eliminarPredio = async (numero_registro, token) =>{
    const respuesta = await fetch(`${BASE_URL}/locations/predio/delete/${numero_registro}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        },
        body: null
    });
    return respuesta.json();
}

/*Ver predio*/
export const verPredio = async (id_propietario, token) =>{
    const respuesta = await fetch(`${BASE_URL}/locations/predios/${id_propietario}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        }
    });
    return respuesta.json();
}

/*Asociar predio a lugar de producción*/
export const asociarPredio = async (numero_registro, id_predio, token)=>{
    const respuesta = await fetch(`${BASE_URL}/locations/predios/link`,{
        method: 'PATCH',
        headers:{
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        },
        body : JSON.stringify({
            numeroRegistro: numero_registro,
            id_predio: id_predio
        })
    });
    return respuesta.json();
}

/*Desasociar predio de lugar de producción*/
export const desasociarPredio = async (id_predio, token)=>{
    const respuesta =await fetch(`${BASE_URL}/locations/predio/unlink`,{
        method: 'PATCH',
        headers:{
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        },
        body: JSON.stringify({
            id_predio: id_predio
        })
    });
    return respuesta.json();
}

/*Obtener departamentos */
export const obtenerDepartamentos = async(token)=>{
    const respuesta = await fetch (`${BASE_URL}/locations/departamentos`,{
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        }
    });
    return respuesta.json();
}

/*Obtener municipios */
export const obtenerMunicipios = async(token)=>{
    const respuesta = await fetch (`${BASE_URL}/locations/municipios`,{
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        }
    });
    return respuesta.json();
}

