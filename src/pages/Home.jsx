import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      {/* Sección Hero con fondo oscuro superpuesto para accesibilidad */}
      <section 
        className="hero-section d-flex align-items-center text-center text-white"
        style={{
          minHeight: 'calc(100vh - 4.75rem)', // Restamos el alto aproximado del Navbar
          backgroundImage: 'linear-gradient(rgba(30, 58, 138, 0.85), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8 px-4">
              
              <h1 className="display-4 fw-bold mb-4 shadow-sm">
                Transparencia en Licitaciones Públicas
              </h1>
              
              <p className="lead mb-5 fs-4 text-light">
                Accede de forma rápida y segura a la información del sistema de compras públicas de Chile. Encuentra oportunidades y evalúa proveedores en un solo lugar.
              </p>
              
              {/* Botones de acción (Call to Action) */}
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link to="/licitaciones" className="btn btn-light btn-lg fw-bold px-4 py-3 rounded-3 shadow">
                  <i className="fa-solid fa-magnifying-glass me-2"></i> Explorar Licitaciones
                </Link>
                <Link to="/proveedores" className="btn btn-outline-light btn-lg fw-bold px-4 py-3 rounded-3 shadow">
                  <i className="fa-solid fa-building me-2"></i> Buscar Proveedores
                </Link>
              </div>
              
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
