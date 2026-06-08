import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Collapse } from 'bootstrap';

import LicitaSeguroLogo from '../assets/img/logo/licita-seguro-logo.png';

const Navbar = () => {
  // Referencia al elemento HTML del menú
  const collapseRef = useRef(null);
  // Referencia para guardar la instancia de Bootstrap
  const bsCollapseRef = useRef(null);

  useEffect(() => {
    // Inicializamos el Collapse de Bootstrap suavemente y sin que se auto-active
    if (collapseRef.current) {
      bsCollapseRef.current = new Collapse(collapseRef.current, { toggle: false });
    }
    
    // Cleanup de memoria al cambiar de vista o desmontar
    return () => {
      if (bsCollapseRef.current) {
        bsCollapseRef.current.dispose();
      }
    };
  }, []);

  // Función para el botón Hamburguesa (Abre/Cierra con animación)
  const toggleMenu = () => {
    if (bsCollapseRef.current) {
      bsCollapseRef.current.toggle();
    }
  };

  // Función para los enlaces (Solo cierra si está abierto)
  const closeMenu = () => {
    if (collapseRef.current && collapseRef.current.classList.contains('show')) {
      if (bsCollapseRef.current) {
        bsCollapseRef.current.hide();
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm" style={{ backgroundColor: '#1E3A8A' }}>
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/" onClick={closeMenu}>
          <img 
            src={LicitaSeguroLogo} 
            alt="Licita Seguro" 
            style={{ maxHeight: '3rem', width: 'auto' }}
            className="d-inline-block align-text-top me-2" 
          />
        </Link>

        {/* Botón hamburguesa (Quitamos los data-bs-toggle para controlarlo desde acá) */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarNav" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenedor colapsable (Le pasamos nuestra referencia) */}
        <div className="collapse navbar-collapse" id="navbarNav" ref={collapseRef}>
          <ul className="navbar-nav ms-auto fw-semibold align-items-end">
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/" end onClick={closeMenu}>INICIO</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/licitaciones" onClick={closeMenu}>LICITACIONES</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/proveedores" onClick={closeMenu}>PROVEEDORES</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;