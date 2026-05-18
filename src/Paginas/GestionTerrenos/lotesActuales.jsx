import React, { useState, useEffect } from 'react';
import BASE_URL from '@/services/api-entidades';
import './GestionarTerrenos.css';
import {ArrowLeft} from 'lucide-react';

function LotesActuales({ lugar, onVolver, onAgregarLote }) {

    const [lotes, setLotes] = useState([]);
    const [cargando, setCargando] = useState(true);
    console.log("ID del lugar que se está enviando en lotes actuales:", lugar.id);
    // cargar lotes asociados
    useEffect(() => {
        const fetchLotes = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(
                    `${BASE_URL}/locations/lotes/${lugar.id}`,
                    {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    }
                );
                const data = await res.json();
                if (data.status === 'success') {
                    setLotes(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setCargando(false);
            }
        };
            fetchLotes();
        }, [lugar]);


    return (
        <section>
            <div className="volver-container">
                <button className="fab-back" onClick={onVolver}> <ArrowLeft size={26} /> </button>
            </div>

            <h2 className='section-title'>
                Lotes actuales en {lugar.nombre}
            </h2>

            {cargando ? (
                <p>Cargando...</p>
            ) : lotes.length === 0 ? (
                <p>No hay lotes registrados.</p>
            ) : (
                lotes.map((lote) => (
                    <div key={lote.id} className="horizontal-card">

                        <div className="card-left-section">
                            <h3>{lote.numero_lote}</h3>
                        </div>
                        <div className="card-details-section">
                            <p><strong>Número de Registro:</strong> {lote.numero_registro}</p>
                            <p><strong>Área:</strong> {lote.area} Ha</p>
                            <p><strong>Tipo de cultivo:</strong> {lote.uidcultivo}</p>
                            <p><strong>Cantidad de plantas:</strong> {lote.cantidad_plantas}</p>
                            <p><strong>Fecha de Siembra:</strong> {lote.fechasiembra}</p>
                            <p><strong>Fecha de Recolección:</strong> {lote.fecha_recoleccion}</p>
                            <p><strong>Cantidad de recolección:</strong> {lote.cantidad_recoleccion}</p>
                            <p><strong>Cantidad proyectada de recolección:</strong> {lote.cantidadProyectadaRecoleccion}</p>
                        </div>

                    </div>
                ))
            )}
  
            <button className="fab-add" onClick={() => onAgregarLote(lugar)}>
                +
            </button>

        </section>
    );
}

export default LotesActuales;