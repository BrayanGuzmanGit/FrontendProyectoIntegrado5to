import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Importamos los componentes (Aquí usamos MAYÚSCULAS porque tus archivos y carpeta empiezan con Mayúscula)
import Login from './Paginas/Autenticaciones/Login';
import Registro from './Paginas/Autenticaciones/Registro';
import CambioVistasProductor from './Paginas/About-users/CambioVistasProductor';
import CambioVistasFuncionario from './Paginas/About-users/CambioVistasFuncionario';
import CambioVistasPropietario from './Paginas/About-users/CambioVistasPropietario';
import CambioVistasTecnico from './Paginas/About-users/CambioVistasTecnico';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La ruta principal es el Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        {/* La ruta de registro */}
        <Route path="/registro" element={<Registro />} />
        {/* Las rutas de los perfiles */}
        <Route path="/menu-productor" element={<CambioVistasProductor />} />
        <Route path="/menu-funcionario" element={<CambioVistasFuncionario />} />
        <Route path="/menu-propietario" element={<CambioVistasPropietario />} />
        <Route path="/menu-tecnico" element={<CambioVistasTecnico />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;