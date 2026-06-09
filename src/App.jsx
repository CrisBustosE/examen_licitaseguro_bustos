import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importamos Bootstrap globalmente

// Importamos nuestros componentes base
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Importamos nuestras páginas
import Home from './pages/Home';
import Licitaciones from './pages/Licitaciones';
import Proveedores from './pages/Proveedores';

const App = () => {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {/* Navbar siempre visible arriba */}
        <Navbar />

        {/* El contenido dinámico de las páginas crecerá para empujar el footer abajo */}
        <main className="flex-grow-1 bg-light" aria-label="Contenido principal">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/licitaciones" element={<Licitaciones />} />
            <Route path="/proveedores" element={<Proveedores />} />
            {/* Si el usuario ingresa una URL que no existe, lo mandamos al Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;