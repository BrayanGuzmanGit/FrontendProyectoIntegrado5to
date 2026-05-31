import React, { useState } from 'react';
import Menu from '@/Componentes/Menu';
import './Perfiles.css';

// Importas los JSX que ya tienes en Paginas/
import PerfilProductor from './Perfil';;
import VistaPredio from '@/Paginas/GestionTerrenos/predios/vistaPredios';
// Cuando los vayas creando los importas aquí:
// import LugaresProduccion from './LugaresProduccion';
// import SolicitarInspeccion from './SolicitarInspeccion';
// import InspeccionesPendientes from './InspeccionesPendientes';
// import InformesProduccion from './InformesProduccion';
// import ResultadosInspecciones from './ResultadosInspecciones';

const SECCIONES = {
    perfil:     <PerfilProductor />,
    predios:    <VistaPredio/>,
    // pendientes: <InspeccionesPendientes />,
    // informes:   <InformesProduccion />,
    // resultados: <ResultadosInspecciones />,
};

function CambioVistasProductor() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [seccionActiva, setSeccionActiva] = useState('predios');

    const alternarSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        <div className="contenedor-pantalla-perfil">
            <Menu
                isSidebarOpen={isSidebarOpen}
                alternarSidebar={alternarSidebar}
                seccionActiva={seccionActiva}
                setSeccionActiva={setSeccionActiva}
                tipoUsuario="propietario"
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