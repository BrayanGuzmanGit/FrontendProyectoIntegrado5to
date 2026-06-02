import React from 'react';
import logo from '@/assets/principales/logo.webp';
import './Menu.css';
import { User, Sprout, Leaf, Mail, CalendarDays, ClipboardCheck,LogOut, ArrowLeft, ArrowRight } from 'lucide-react';

function Menu({ 
    isSidebarOpen, 
    alternarSidebar, 
    seccionActiva, 
    setSeccionActiva, 
    tipoUsuario 
}) {
    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('estado');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    };

    const menuOpciones = {
        productor: [
            { id: "perfil", label: "Perfil", icono: User},
            { id: "lugares", label: "Lugares de producción", icono: Sprout },
            { id: "solicitar", label: "Solicitar inspección", icono: Mail },
            { id: "pendientes", label: "Inspecciones pendientes", icono:CalendarDays },
        ],
        tecnico: [
            { id: "perfil", label: "Perfil", icono: User },
            { id: "pendientes", label: "Inspecciones pendientes", icono: CalendarDays },

        ],
        funcionario: [
            { id: "perfil", label: "Perfil", icono: User },
            { id: "solicitudesUsuarios", label: "Solicitudes usuarios", icono: Mail },
            { id: "solicitudesInspeccion", label: "Solicitudes inspección", icono: Mail },
            { id: "usuarios", label: "Usuarios", icono: User },
            { id: "informes", label: "Informes de inspecciones", icono: ClipboardCheck },
        ],
        propietario: [
            { id: "perfil", label: "Perfil", icono: User },
            { id: "predios", label: "Predios", icono: Leaf },
        ]
    };

    const opciones = menuOpciones[tipoUsuario] || menuOpciones.productor;

    return (
        <aside className={`barra-lateral ${isSidebarOpen ? 'abierta' : 'cerrada'}`}>
            <div 
                className="boton-toggle-sidebar"
                onClick={alternarSidebar}
            >
                {isSidebarOpen ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </div>

            <div className="contenedor-logo">
                <img src={logo} alt="Logo ICA" />
            </div>

            <nav className="navegacion-perfil">
                {opciones.map((opcion) => {
                    const Icono = opcion.icono;

                    return (
                        <button
                            key={opcion.id}
                            className={`opcion ${seccionActiva === opcion.id ? 'activo' : ''}`}
                            onClick={() => setSeccionActiva(opcion.id)}
                        >
                            {Icono && <Icono size={18} />}
                            <span>{opcion.label}</span>
                        </button>
                    );
                })}
            </nav>

            <button onClick={cerrarSesion} className="boton-cerrar-sesion">
                <LogOut size={18} />
                Cerrar Sesión
            </button>
        </aside>
    );
}

export default Menu;