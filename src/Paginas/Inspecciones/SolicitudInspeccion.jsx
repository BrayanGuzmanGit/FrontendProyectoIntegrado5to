import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '@/services/api-entidades';
import BASE_URL_INSPECCIONES from '@/services/api-inspections';
import './SolicitudInspeccion.css';

function RegistroLugarP() {
    const [lugarSeleccionado, setLugarSeleccionado] = useState('');
    const [tipoInspeccion, setTipoInspeccion] = useState('');
    const [motivo, setMotivo] = useState('');
    const [lugares, setLugares] = useState([]);
    const [cargandoLugares, setCargandoLugares] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Solicitud de inspección";
        // Carga los lugares desde el backend
        const fetchLugares = async () => {
            try {
                const usuario = JSON.parse(localStorage.getItem('usuario'));
                const token = localStorage.getItem('token');
                const response = await fetch(`${BASE_URL}/locations/lugares/${usuario.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });
                const data = await response.json();
                setLugares(data.data);
            } catch (error) {
                console.error("Error cargando lugares:", error);
            } finally {
                setCargandoLugares(false);
            }
        };
        fetchLugares();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            tipo_inspeccion: tipoInspeccion,
            comentarios: motivo.trim(),
            idlugarproduccion: lugarSeleccionado,
        };
        console.log("Datos a enviar:", formData); // Verifico datos antes de enviar
        //enviar solicitud al backend
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL_INSPECCIONES}/solicitudes`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Respuesta del servidor:", data); // Verificar respuesta del servidor
            if (response.ok) {
                alert("¡Solicitud enviada exitosamente!");
                setLugarSeleccionado('');
                setTipoInspeccion('');
                setMotivo('');
            } else {
                alert("Error: " + data.message || "Error al enviar la solicitud");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Error de conexión con el servidor. Inténtalo más tarde.");
        }
    };
    return (
        <div className="contenedor-pag-registro">
            <div className="contenedor-formulario">
                <main>
                    <h1>Solicitud de inspección</h1>

                    <form onSubmit={handleSubmit}>

                        {/* Campo 1: Nombre del lugar (select desplegable) */}
                        <label htmlFor="lugar">(*) Nombre del lugar a inspeccionar:</label>
                        <select
                            id="lugar"
                            value={lugarSeleccionado}
                            onChange={(e) => setLugarSeleccionado(e.target.value)}
                            required
                        >
                            <option value="" disabled>-- Seleccione un lugar --</option>
                            {cargandoLugares ? (
                                <option disabled>Cargando lugares...</option>
                            ) : lugares.length === 0 ? (
                                <option disabled>No hay lugares de producción</option>
                            ) : (
                                lugares.map((lugar) => (
                                    <option key={lugar.id} value={lugar.id}>
                                        {lugar.nombre}
                                    </option>
                                ))
                            )}
                        </select>

                        {/* Campo 2: Tipo de inspección */}
                        <label>(*) Tipo de inspección:</label>
                        <div className="grupo-opciones">
                            {['inspeccion tecnica', 'inspeccion fitosanitaria'].map((tipo) => (
                                <label key={tipo} className="opcion-radio">
                                    <input
                                        type="radio"
                                        name="tipoInspeccion"
                                        value={tipo}
                                        checked={tipoInspeccion === tipo}
                                        onChange={(e) => setTipoInspeccion(e.target.value)}
                                        required
                                    />
                                    <span>{tipo}</span>
                                </label>
                            ))}
                        </div>

                        {/* Campo 3: Motivo de la solicitud */}
                        <label htmlFor="motivo">(*) Motivo de la solicitud:</label>
                        <textarea
                            id="motivo"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows={4}
                            required
                        />

                        <div className="contenedor-botones">
                            <button type="submit" className="boton-registrar">
                                Solicitar
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

export default RegistroLugarP;