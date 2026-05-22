/*Aquí establecemos los fetch que actúan como mensajeros entre la vista y 
el servicio API proveniente dedl backend */
import BASE_URL from '@/services/api-entidades';

/*Definimos las funcionalidades de gestionar lugares (crear, editar, eliminar, ver) */
/*Exportamos las constantes donde realizamos la conexión con el API para 
luego pasárselas a al archivo que maneja la lógica de los lugares (logicaLugar)*/

/*crear lugar*/
export const crearLugar = async (nombreFormulario, token)=>{ /*Recibe los valores enviados por la lógica*/
    /*se construye la petición http */
    const respuesta = await fetch(`${BASE_URL}/locations/lugares`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        },
        body: JSON.stringify({nombre: nombreFormulario})   //convierte el objeto a JSON para que el backend lo pueda entender
                /*nombre como propiedad(tiene que tener el mismo nombre que en el backend)
        y nombreFormulario como varaible para guardar el valor que recibe el frontend */
    });
    return respuesta.json(); /* convierte la respuesta JSON a objeto para que el frontend lo pueda usar*/
};

/*Editar lugar*/
export const editarLugar = async (numero_registro, nombreFormulario, token)=>{
    const respuesta = await fetch(`${BASE_URL}/locations/lugares/${numero_registro}`,{
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        },
        body: JSON.stringify({nuevoNombre: nombreFormulario}) 
        /*Nuevonombre como propiedad para que el backend reciba el dato (tiene que tener el mismo nombre que en el backend)
        y nombreFormulario como varaible para guardar el valor que recibe el frontend */
    });
    return respuesta.json();
};

/*Eliminar lugar*/
export const eliminarLugar = async (numero_registro, token)=>{
    const respuesta = await fetch(`${BASE_URL}/locations/lugares/delete/${numero_registro}`,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        },
        body: null
    });
    return respuesta.json();
}

/*Ver lugar*/
export const verLugar = async (id_productor, token)=>{
    const respuesta = await fetch(`${BASE_URL}/locations/lugares/${id_productor}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token
        },
    });
    return respuesta.json();
}