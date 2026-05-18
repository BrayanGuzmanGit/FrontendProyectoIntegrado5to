import React, { useState, useEffect } from 'react';
import BASE_URL from '@/services/api-entidades';
import './GestionarTerrenos.css';
import {ArrowLeft} from 'lucide-react';

function PrediosAsociados({ lugar, onVolver }) {

    const [predios, setPredios] = useState([]);
    const [cargando, setCargando] = useState(true);
    console.log("ID del lugar que se está enviando en predios asociados:", lugar.id);
    // cargar predios asociados
    useEffect(() => {
        const fetchPredios = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(
                    `${BASE_URL}/locations/lugares/${lugar.id}/predios`,
                    {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    }
                );
                 const data = await res.json();
                if (data.status === 'success') {
                    setPredios(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setCargando(false);
            }
        };
            fetchPredios();
        }, [lugar]);

    // asignar predio central
    const handleAsignarCentral = async (predio) => {
        const token = localStorage.getItem('token');

        const body = {
            numeroRegistroLugar: lugar.numero_registro,
            numeroRegistroPredio: predio.numero_registro
        };

        try {
            const res = await fetch(
                `${BASE_URL}/locations/lugares/predioCentral`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(body)
                }
            );

            const data = await res.json();

            if (data.status === 'success') {
                alert('Predio central actualizado');
            } else {
                alert(data.message || 'No se pudo asignar el predio central');
            }

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section>
            <div className="volver-container">
                <button className="fab-back" onClick={onVolver}> <ArrowLeft size={26} /> </button>
            </div>

            <h2 className='section-title'>
                Predios asociados a {lugar.nombre}
            </h2>

            {cargando ? (
                <p>Cargando...</p>
            ) : predios.length === 0 ? (
                <p>No hay predios asociados.</p>
            ) : (
                predios.map((predio) => (
                    <div key={predio.id} className="horizontal-card">

                        <div className="card-left-section">
                            <h3>{predio.nombre}</h3>
                        </div>
                        <div className="card-details-section">
                            <p> <strong>Área:</strong> {predio.area} Ha</p>
                            <p><strong>N° Registro:</strong> {predio.numero_registro}</p>
                            <p><strong>Municipio:</strong> {predio.municipio?.nombre || 'N/A'}</p>
                            <p><strong>Dirección:</strong> {predio.direccion}</p>
                        </div>

                        <div className="card-button-section">
                            <button
                                className="btn-secundary"
                                disabled={predio.es_central}
                                onClick={() => handleAsignarCentral(predio)}
                            >
                                {predio.es_central ? 'Predio central actual' : 'Asignar como central'}
                            </button>
                        </div>

                    </div>
                ))
            )}

        </section>
    );
}

export default PrediosAsociados;