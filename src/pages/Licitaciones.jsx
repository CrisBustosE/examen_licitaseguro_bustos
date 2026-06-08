import { useState } from 'react';
import { API_BASE_URL, API_TICKET } from '../utils/apiConfig';

const Licitaciones = () => {
  // Estados para el formulario
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');

  // Estados para la data de la API
  const [licitaciones, setLicitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsj, setErrorMsj] = useState('');

  // Estados para la paginación (Req. Tarea 3 del examen)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // ==========================================================
  // FUNCIÓN: Formatear fecha de YYYY-MM-DD a DDMMAAAA
  // ==========================================================
  const formatFechaParaApi = (fechaHtml) => {
    if (!fechaHtml) return '';
    const [year, month, day] = fechaHtml.split('-');
    return `${day}${month}${year}`;
  };

  // ==========================================================
  // FUNCIÓN: Consumir API de Mercado Público
  // ==========================================================
  const handleBuscar = async (e) => {
    e.preventDefault();
    
    // Validamos que al menos haya ingresado una fecha
    if (!fechaFiltro) {
      setErrorMsj('Por favor, selecciona una fecha para buscar.');
      return;
    }

    setIsLoading(true);
    setErrorMsj('');
    setLicitaciones([]);
    setCurrentPage(1); // Reiniciamos la página al buscar de nuevo

    try {
      const fechaFormateada = formatFechaParaApi(fechaFiltro);
      let endpoint = `${API_BASE_URL}/licitaciones.json?fecha=${fechaFormateada}&ticket=${API_TICKET}`;

      // Si el usuario seleccionó un estado específico, lo agregamos a la URL
      if (estadoFiltro !== 'Todos') {
        endpoint += `&estado=${estadoFiltro}`;
      }

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Error de servidor: ${response.status}`);
      }

      const data = await response.json();

      // Limpieza y validación de respuesta (Req. Tarea 6)
      if (data.Cantidad === 0 || !data.Listado || data.Listado.length === 0) {
        setErrorMsj('No se encontraron licitaciones para los filtros seleccionados.');
      } else {
        setLicitaciones(data.Listado);
      }
    } catch (error) {
      console.error("Error al obtener licitaciones:", error);
      setErrorMsj('Hubo un problema de conexión con Mercado Público. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // LÓGICA DE PAGINACIÓN MANUAL
  // ==========================================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = licitaciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(licitaciones.length / itemsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4" style={{ color: '#1E3A8A' }}>Buscador de Licitaciones</h2>

      {/* TARJETA DE FILTROS */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body bg-light rounded">
          <form className="row g-3 align-items-end" onSubmit={handleBuscar}>
            <div className="col-12 col-md-4">
              <label htmlFor="fechaFiltro" className="form-label fw-semibold text-secondary">Fecha</label>
              <input 
                type="date" 
                className="form-control" 
                id="fechaFiltro" 
                value={fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()} 
              />
            </div>
            
            <div className="col-12 col-md-5">
              <label htmlFor="estadoFiltro" className="form-label fw-semibold text-secondary">Estado</label>
              <select 
                className="form-select" 
                id="estadoFiltro"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <option value="Todos">Todos los Estados</option>
                <option value="activas">Activas</option>
                <option value="adjudicada">Adjudicada</option>
                <option value="revocada">Revocada</option>
                <option value="desierta">Desierta</option>
              </select>
            </div>
            
            <div className="col-12 col-md-3">
              <button 
                type="submit" 
                className="btn text-white w-100 fw-bold shadow-sm" 
                style={{ backgroundColor: '#1E3A8A' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fa-solid fa-magnifying-glass me-2"></i>
                )}
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MENSAJES DE ERROR */}
      {errorMsj && (
        <div className="alert alert-warning shadow-sm border-0 d-flex align-items-center">
          <i className="fa-solid fa-triangle-exclamation fs-4 me-3 text-warning"></i>
          <span className="fw-medium">{errorMsj}</span>
        </div>
      )}

      {/* TABLA DE RESULTADOS */}
      {!isLoading && licitaciones.length > 0 && (
        <>
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="py-3">Título</th>
                      <th className="py-3 d-none d-md-table-cell">Fecha Cierre</th>
                      <th className="py-3">Estado</th>
                      <th className="text-center pe-3 pe-md-4 py-3">
                        <span className="d-none d-md-inline">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((lic) => (
                      <tr key={lic.CodigoExterno}>
                        <td className="px-4 fw-medium text-nowrap">{lic.CodigoExterno}</td>
                        {/* Pequeña limpieza de texto por si la API envía strings sucios */}
                        <td>{lic.Nombre.length > 60 ? `${lic.Nombre.substring(0, 60)}...` : lic.Nombre}</td>
                        <td className="d-none d-md-table-cell text-nowrap">
                          {lic.FechaCierre ? new Date(lic.FechaCierre).toLocaleDateString('es-CL') : 'N/A'}
                        </td>
                        <td>
                          <span className={`badge bg-${lic.CodigoEstado === 8 ? 'success' : lic.CodigoEstado === 6 ? 'danger' : 'secondary'}`}>
                            {/* Mostramos el código de estado temporalmente, luego lo mapearemos al texto real */}
                            Estado {lic.CodigoEstado}
                          </span>
                        </td>
                        <td className="text-center pe-3 pe-md-4">
                          <button className="btn btn-sm fw-semibold p-1 p-md-2" style={{ color: '#1E3A8A' }} title="Ver Detalles">
                            <span className="d-none d-md-inline">Ver Detalles</span>
                            <i className="fa-solid fa-eye d-md-none fs-5"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="mt-4 d-flex flex-column align-items-center">
              <p className="text-muted small mb-2">
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, licitaciones.length)} de {licitaciones.length} resultados
              </p>
              <div className="btn-group shadow-sm">
                <button className="btn btn-outline-secondary btn-sm" onClick={prevPage} disabled={currentPage === 1}>
                  Anterior
                </button>
                <span className="btn btn-light btn-sm px-3 fw-bold border-secondary text-primary" style={{ cursor: 'default' }}>
                  {currentPage} de {totalPages}
                </span>
                <button className="btn btn-outline-secondary btn-sm" onClick={nextPage} disabled={currentPage === totalPages}>
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Licitaciones;