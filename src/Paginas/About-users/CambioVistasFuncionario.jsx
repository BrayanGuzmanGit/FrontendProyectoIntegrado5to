import React, { useState } from 'react';
import Menu from '@/Componentes/Menu';
import './Perfiles.css';

// Importas los JSX que ya tienes en Paginas/
import PerfilProductor from './Perfil';
// Cuando los vayas creando los importas aquí:
import SolicidudesUsuarios from '@/Paginas/Autenticaciones/SolicitudesUsuarios';
import VerSolicitudesI from '../Inspecciones/VerSolicitudesI';
import Usuarios from '../Autenticaciones/Usuarios';
// import InformesProduccion from './InformesProduccion';
// import ResultadosInspecciones from './ResultadosInspecciones';

const SECCIONES = {
    perfil:     <PerfilProductor />,
    solicitudesUsuarios:    <SolicidudesUsuarios/>,
    solicitudesInspeccion:    <VerSolicitudesI/>,
    usuarios:   <Usuarios />,
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
                tipoUsuario="funcionario"
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