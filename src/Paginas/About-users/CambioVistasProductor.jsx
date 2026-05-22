import React, { useState } from 'react';
import Menu from '@/Componentes/Menu';
import './Perfiles.css';

// Importas los JSX que ya tienes en Paginas/
import PerfilProductor from './Perfil';
import SolicitudInspeccion from '@/Paginas/Inspecciones/SolicitudInspeccion';
import VistaLugar from '@/Paginas/GestionTerrenos/lugares/VistaLugar';
// Cuando los vayas creando los importas aquí:
// import LugaresProduccion from './LugaresProduccion';
// import SolicitarInspeccion from './SolicitarInspeccion';
// import InspeccionesPendientes from './InspeccionesPendientes';
// import InformesProduccion from './InformesProduccion';
// import ResultadosInspecciones from './ResultadosInspecciones';

const SECCIONES = {
    perfil:     <PerfilProductor />,
    lugares:    <VistaLugar />,
    solicitar:  <SolicitudInspeccion />,
    // pendientes: <InspeccionesPendientes />,
    // informes:   <InformesProduccion />,
    // resultados: <ResultadosInspecciones />,
};

function CambioVistasProductor() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [seccionActiva, setSeccionActiva] = useState('perfil');

    const alternarSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        <div className="contenedor-pantalla-perfil">
            <Menu
                isSidebarOpen={isSidebarOpen}
                alternarSidebar={alternarSidebar}
                seccionActiva={seccionActiva}
                setSeccionActiva={setSeccionActiva}
                tipoUsuario="productor"
            />

            <main className={`contenido-principal ${isSidebarOpen ? '' : 'expandido'}`}>
                <div className="contenedor-seccion" key={seccionActiva}>
                    {SECCIONES[seccionActiva] ?? <p>Sección en construcción.</p>}
                </div>
            </main>
        </div>
    );
}

export default CambioVistasProductor;