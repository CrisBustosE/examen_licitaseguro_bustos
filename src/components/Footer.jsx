import LicitaSeguroLogo from '../assets/img/logo/licita-seguro-logo.png';
import LogoChileCompra from '../assets/img/logo/logo-chilecompra-52.png'

import { Link } from 'react-router-dom';
const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <div className="container">
        {/* Logo Licita Seguro */}
        <div className="row align-items-center text-center text-md-start gy-4">
          <div className="col-12 col-md-6 text-md-start text-center">
            <Link to="/">
              <img
                src={LicitaSeguroLogo}
                alt="Logo Licita Seguro"
                style={{ maxHeight: '2.5rem', width: 'auto' }}
                className="mb-2"
              /></Link>
          </div>

          {/* Logo Mercado Público Chile*/}
          <div className="col-12 col-md-6 text-md-end text-center">
            <a href="https://www.chilecompra.cl/api/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <p className="mb-1 fw-semibold text-light">API Mercado Público</p>
              <img
                src={LogoChileCompra}
                alt="Logo Mercado Público"
                style={{ maxHeight: '2.5rem', width: 'auto' }}
                className="mb-2"
              /></a>
          </div>
        </div>

        <hr className="my-4 border-light opacity-10" />

        <div className="text-center">
          <p className="small mb-1 text-light text-opacity-75">&copy; 2026 Todos los derechos reservados.</p>
          <small className="text-light text-opacity-50">
            Imágenes ilustrativas cortesía de <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="text-decoration-none text-info">Unsplash</a>
          </small>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
