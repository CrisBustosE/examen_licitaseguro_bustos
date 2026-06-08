import { useState } from 'react';
import { API_BASE_URL, API_TICKET } from '../utils/apiConfig';

import UniversalModal from '../components/UniversalModal';

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

    // Estados para el modal universal
    const [showModal, setShowModal] = useState(false);
    const [detalleLic, setDetalleLic] = useState(null);
    const [loadingModal, setLoadingModal] = useState(false);

    // ==========================================================
    // FUNCIÓN: Formatear fecha de YYYY-MM-DD a DDMMAAAA
    // ==========================================================
    const formatFechaParaApi = (fechaHtml) => {
        if (!fechaHtml) return '';
        const [year, month, day] = fechaHtml.split('-');
        return `${day}${month}${year}`;
    };

    // ==========================================================
    // FUNCIÓN: Mapear Código de Estado a Texto y Color
    // ==========================================================
    const getEstadoInfo = (codigo) => {
        const estados = {
            5: { nombre: 'Publicada', color: 'success' },
            6: { nombre: 'Cerrada', color: 'secondary' },
            7: { nombre: 'Desierta', color: 'danger' },
            8: { nombre: 'Adjudicada', color: 'primary' },
            15: { nombre: 'Revocada', color: 'danger' }, // En la documentación aparece como 18 pero al consumir la API devuelve un 15
            16: { nombre: 'Suspendida', color: 'warning text-dark' } // En la documentación aparece como 19 pero al consumir la API devuelve un 16
        };
        // Si la API devuelve un código raro, mostramos el número por defecto
        return estados[codigo] || { nombre: `Estado ${codigo}`, color: 'dark' };
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

    const getPaginationNumbers = () => {
        // Si reducimos el delta a 1, solo se mostrará la página actual, 
        // la anterior y la siguiente.
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            // Siempre mostramos la primera (1), la última y las cercanas a la actual
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };

    // ==========================================================
    // FUNCIÓN: Consumir detalle específico de una Licitación
    // ==========================================================
    const handleVerDetalles = async (codigoExterno) => {
        setShowModal(true);
        setLoadingModal(true);
        setDetalleLic(null); // Limpiamos el detalle anterior

        try {
            // Agregamos un spinner en el Modal y forzamos un delay de 500ms para mostrarlo (ya que la API responde tan rapido que no se lograba apreciar)
            await new Promise(resolve => setTimeout(resolve, 500));
            // Usamos el endpoint de detalle del PDF de Apoyo
            const endpoint = `${API_BASE_URL}/licitaciones.json?codigo=${codigoExterno}&ticket=${API_TICKET}`;
            const response = await fetch(endpoint);

            if (!response.ok) throw new Error('Error al obtener el detalle');

            const data = await response.json();

            if (data.Listado && data.Listado.length > 0) {
                setDetalleLic(data.Listado[0]); // Guardamos la data completa
            }
        } catch (error) {
            console.error(error);
            setDetalleLic({ error: true }); // Marcamos que hubo un error
        } finally {
            setLoadingModal(false);
        }
    };

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
                                <option value="publicada">Publicada</option>
                                <option value="cerrada">Cerrada</option>
                                <option value="desierta">Desierta</option>
                                <option value="adjudicada">Adjudicada</option>
                                <option value="revocada">Revocada</option>
                                <option value="suspendida">Suspendida</option>
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

            {/* ========================================================== */}
            {/* RESULTADOS (VISTA DUAL: TABLA EN DESKTOP / CARDS EN MÓVIL) */}
            {/* ========================================================== */}
            {!isLoading && licitaciones.length > 0 && (
                <>
                    {/* VISTA DESKTOP Y TABLET: Tabla clásica (Oculta en móviles con d-none d-md-block) */}
                    <div className="card shadow-sm border-0 d-none d-md-block">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-4 py-3">ID</th>
                                            <th className="py-3">Título</th>
                                            <th className="py-3">Fecha Cierre</th>
                                            <th className="py-3">Estado</th>
                                            <th className="text-center pe-4 py-3">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((lic) => {
                                            const estadoInfo = getEstadoInfo(lic.CodigoEstado);
                                            return (
                                                <tr key={lic.CodigoExterno}>
                                                    <td className="px-4 fw-medium text-nowrap">{lic.CodigoExterno}</td>
                                                    <td style={{ maxWidth: '250px' }}>
                                                        <div className="text-truncate" title={lic.Nombre}>
                                                            {lic.Nombre}
                                                        </div>
                                                    </td>
                                                    <td className="text-nowrap">
                                                        {lic.FechaCierre ? new Date(lic.FechaCierre).toLocaleDateString('es-CL') : 'N/A'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${estadoInfo.color}`}>
                                                            {estadoInfo.nombre}
                                                        </span>
                                                    </td>
                                                    <td className="text-center pe-4">
                                                        <button className="btn btn-sm fw-semibold p-2 border-0 text-decoration-underline" style={{ color: '#1E3A8A' }} onClick={() => handleVerDetalles(lic.CodigoExterno)}>
                                                            Ver Detalles
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* VISTA MÓVIL: Tarjetas (Oculta en escritorio con d-md-none) */}
                    <div className="d-md-none">
                        {currentItems.map((lic) => {
                            const estadoInfo = getEstadoInfo(lic.CodigoEstado);
                            return (
                                <div className="card shadow-sm border-0 mb-3" key={lic.CodigoExterno}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="fw-bold" style={{ color: '#1E3A8A' }}>{lic.CodigoExterno}</span>
                                            <span className={`badge bg-${estadoInfo.color}`}>
                                                {estadoInfo.nombre}
                                            </span>
                                        </div>
                                        {/* En la tarjeta sí podemos mostrar el título completo sin que se rompa nada */}
                                        <p className="mb-3 text-secondary small fw-medium lh-sm">
                                            {lic.Nombre}
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                <i className="fa-regular fa-calendar me-1"></i>
                                                {lic.FechaCierre ? new Date(lic.FechaCierre).toLocaleDateString('es-CL') : 'N/A'}
                                            </small>
                                            <button className="btn btn-sm fw-bold border-0" style={{ color: '#1E3A8A', backgroundColor: '#e2e8f0' }} onClick={() => handleVerDetalles(lic.CodigoExterno)}>
                                                Ver Detalles <i className="fa-solid fa-chevron-right ms-1 small"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CONTROLES DE PAGINACIÓN */}
                    {totalPages > 1 && (
                        <nav className="mt-4" aria-label="Navegación de páginas">
                            <p className="text-muted small mb-2 text-center">
                                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, licitaciones.length)} de {licitaciones.length} resultados
                            </p>
                            <ul className="pagination justify-content-center shadow-sm flex-wrap">
                                {/* Botón Anterior */}
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={prevPage} aria-label="Anterior">
                                        <span className="d-none d-md-inline">Anterior</span>
                                        <i className="fa-solid fa-chevron-left d-md-none"></i>
                                    </button>
                                </li>

                                {/* Números Dinámicos */}
                                {getPaginationNumbers().map((page, index) => (
                                    <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
                                        {page === '...' ? (
                                            <span className="page-link">...</span>
                                        ) : (
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(page)}
                                                aria-label={`Ir a la página ${page}`}
                                            >
                                                {page}
                                            </button>
                                        )}
                                    </li>
                                ))}

                                {/* Botón Siguiente */}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={nextPage} aria-label="Siguiente">
                                        <span className="d-none d-md-inline">Siguiente</span>
                                        <i className="fa-solid fa-chevron-right d-md-none"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            )}
            {/* ========================================================== */}
            {/* MODAL UNIVERSAL PARA DETALLES DE LICITACIÓN                */}
            {/* ========================================================== */}
            <UniversalModal
                show={showModal}
                title="Detalle de Licitación"
                onClose={() => setShowModal(false)}
            >
                {loadingModal ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3 text-muted fw-semibold">Obteniendo información oficial...</p>
                    </div>
                ) : detalleLic?.error ? (
                    <div className="alert alert-danger text-center">
                        No se pudo cargar el detalle de esta licitación. Inténtalo más tarde.
                    </div>
                ) : detalleLic ? (
                    <div>
                        {/* Aquí se arman los detalles de la Licitación */}
                        <h5 className="fw-bold mb-3">{detalleLic.Nombre}</h5>

                        <div className="row gy-3 mb-4">
                            <div className="col-12 col-md-6">
                                <p className="mb-1 text-muted small">Código / ID</p>
                                <p className="fw-medium mb-0">{detalleLic.CodigoExterno}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <p className="mb-1 text-muted small">Organismo Comprador</p>
                                <p className="fw-medium mb-0">{detalleLic.Comprador?.NombreOrganismo}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <p className="mb-1 text-muted small">Fecha Publicación</p>
                                <p className="fw-medium mb-0">
                                    {detalleLic.Fechas?.FechaPublicacion ? new Date(detalleLic.Fechas.FechaPublicacion).toLocaleDateString('es-CL') : 'N/A'}
                                </p>
                            </div>
                            <div className="col-12 col-md-6">
                                <p className="mb-1 text-muted small">Monto Estimado</p>
                                <p className="fw-medium mb-0">
                                    {detalleLic.MontoEstimado ? `$${detalleLic.MontoEstimado.toLocaleString('es-CL')} ${detalleLic.Moneda}` : 'No especificado'}
                                </p>
                            </div>
                        </div>
                        {/* ========================================================== */}
                        {/* EL TOQUE MAESTRO: Renderizado condicional si está Publicada */}
                        {/* ========================================================== */}
                        {detalleLic.CodigoEstado === 5 && (
                            <div className="alert alert-info d-flex flex-column flex-md-row align-items-center justify-content-between mb-4 shadow-sm border-0" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                                <div className="mb-2 mb-md-0">
                                    <i className="fa-solid fa-circle-info me-2 fs-5"></i>
                                    <span className="fw-medium">Esta licitación se encuentra abierta a postulaciones.</span>
                                </div>
                                <a
                                    href={`https://www.mercadopublico.cl/fichaLicitacion.html?idLicitacion=${detalleLic.CodigoExterno}`} // Redirige a la licitación REAL
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn text-white fw-bold shadow-sm text-nowrap"
                                    style={{ backgroundColor: '#0284c7' }}
                                >
                                    Ir a Postular <i className="fa-solid fa-arrow-up-right-from-square ms-2 small"></i>
                                </a>
                            </div>
                        )}

                        <h6 className="fw-bold mb-2">Descripción</h6>
                        <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
                            {detalleLic.Descripcion || 'Sin descripción disponible.'}
                        </p>
                    </div>
                ) : null}
            </UniversalModal>
        </div>
    );
};

export default Licitaciones;