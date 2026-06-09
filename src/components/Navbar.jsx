import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Collapse } from 'bootstrap';

import LicitaSeguroLogo from '../assets/img/logo/licita-seguro-logo.png';

const Navbar = () => {
  // Referencia al elemento HTML del menú
  const collapseRef = useRef(null);
  // Referencia para guardar la instancia de Bootstrap
  const bsCollapseRef = useRef(null);
  // Referencia para detectar clics fuera de toda la barra de navegación
  const navRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

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
  // Efecto para cerrar el menú al hacer clic afuera
  useEffect(() => {
    const handleClickAfuera = (event) => {
      // Si el clic fue FUERA del navbar, llamamos a tu función closeMenu
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    // Usamos mousedown para que sea más responsivo en móviles
    document.addEventListener('mousedown', handleClickAfuera);
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
    };
  }, []); // closeMenu usa referencias (refs), así que es seguro dejar las dependencias vacías

  // Función para el botón Hamburguesa (Abre/Cierra con animación)
  const toggleMenu = () => {
    if (bsCollapseRef.current) {
      bsCollapseRef.current.toggle();
      setIsOpen(prev => !prev);
    }
  };
  // Función para los enlaces (Solo cierra si está abierto)
  const closeMenu = () => {
    if (collapseRef.current && collapseRef.current.classList.contains('show')) {
      if (bsCollapseRef.current) {
        bsCollapseRef.current.hide();
        setIsOpen(false);
      }
    }
  };
  return (
    <nav ref={navRef} className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm" style={{ backgroundColor: '#1E3A8A' }}>
        {/* Contraste links #FFFFFF sobre navbar #1E3A8A = 8.6:1, WCAG AA Aprobado */}
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
          aria-expanded={isOpen}
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