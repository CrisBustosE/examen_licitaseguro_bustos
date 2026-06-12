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
    // VARIABLE: Fecha actual blindada a la zona horaria de Chile
    // ==========================================================
    // 1. Extraemos la fecha y hora exacta en Santiago sin importar dónde esté el PC (Ya que mercado público esta en chile para evitar desfases)
    const fechaChileString = new Date().toLocaleString("en-US", { timeZone: "America/Santiago" });
    const hoyChile = new Date(fechaChileString);

    // 2. Extraemos el año, mes y día (asegurando siempre 2 dígitos con padStart)
    const hoyStr = `${hoyChile.getFullYear()}-${String(hoyChile.getMonth() + 1).padStart(2, '0')}-${String(hoyChile.getDate()).padStart(2, '0')}`;

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

        // NUEVO CANDADO LOGICO: Prevenimos consultas al futuro
        if (fechaFiltro > hoyStr) {
            setErrorMsj('No puedes consultar licitaciones en fechas futuras. Selecciona el día de hoy o una fecha anterior.');
            return;
        }

        setIsLoading(true);

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

    // ==========================================================
    // LÓGICA DE PAGINACIÓN (Fija y sin saltos)
    // ==========================================================
    const getPaginationNumbers = () => {
        // Si hay muy pocas páginas (ej: menos de 7), mostramos todas sin puntos
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Caso 1: Estamos cerca del INICIO
        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }

        // Caso 2: Estamos cerca del FINAL
        if (currentPage >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        // Caso 3: Estamos en el MEDIO
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
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
            {/* Contraste #1E3A8A sobre fondo bg-light #F8F9FA = 8.1:1, WCAG AA Aprobado */}
            <h2 className="fw-bold mb-4" style={{ color: '#1E3A8A' }}>Buscador de Licitaciones</h2>

            {/* TARJETA DE FILTROS */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body bg-light rounded">
                    <form className="row g-3 align-items-end" onSubmit={handleBuscar}>
                        <div className="col-12 col-md-4 position-relative">
                            {/* Contraste text-secondary #6C757D sobre blanco #FFFFFF = 4.6:1, WCAG AA Aprobado */}
                            <label htmlFor="fechaFiltro" className="form-label fw-semibold text-secondary">Fecha</label>

                            {/* Aplicamos un trucazo: Un div flotante que actúa como placeholder. 
                                pointerEvents: 'none' permite que el dedo del usuario lo atraviese y toque el input real */}
                            {!fechaFiltro && (
                                <div
                                    className="position-absolute text-secondary"
                                    style={{
                                        top: '2.43rem',
                                        left: '1.35rem',
                                        pointerEvents: 'none',
                                        backgroundColor: '#fff',
                                        paddingRight: '1.25rem' // Cubre el dd/mm/aaaa gris por defecto
                                    }}
                                >
                                    Seleccionar fecha...
                                </div>
                            )}

                            <input
                                type="date"
                                className="form-control"
                                id="fechaFiltro"
                                max={hoyStr} // Limitamos la fecha máxima de consulta al dia de hoy en Santiago, Chile
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
                                {/* Contraste #FFFFFF sobre botón #1E3A8A = 8.6:1, WCAG AA Aprobado */}
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
                    {/* VISTA DESKTOP: Tabla clásica (Oculta en móviles y tablets con d-none d-lg-block) */}
                    <div className="card shadow-sm border-0 d-none d-lg-block">
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
                                                        <button
                                                            className="btn btn-sm fw-semibold p-2 border-0 text-decoration-underline"
                                                            style={{ color: '#1E3A8A' }}
                                                            onClick={() => handleVerDetalles(lic.CodigoExterno)}
                                                            aria-label={`Ver detalles de licitación ${lic.CodigoExterno}`}
                                                        >
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

                    {/* VISTA MÓVIL Y TABLET: Tarjetas (Oculta en escritorio con d-lg-none) */}
                    <div className="d-lg-none">
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
                                            <button
                                                className="btn btn-sm fw-bold border-0"
                                                style={{ color: '#1E3A8A', backgroundColor: '#e2e8f0' }}
                                                onClick={() => handleVerDetalles(lic.CodigoExterno)}
                                                aria-label={`Ver detalles de licitación ${lic.CodigoExterno}`}
                                                tabIndex={0}
                                            >
                                                {/* Contraste #1E3A8A sobre #e2e8f0 = 5.9:1, WCAG AA Aprobado */}
                                                Ver Detalles <i className="fa-solid fa-chevron-right ms-1 small"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CONTROLES DE PAGINACIÓN UNIFICADOS (Dropdown) */}
                    {totalPages > 1 && (
                        <nav className="mt-4" aria-label="Navegación de páginas">
                            <p className="text-muted small mb-3 text-center">
                                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, licitaciones.length)} de {licitaciones.length} resultados
                            </p>

                            <div className="d-flex justify-content-center align-items-center gap-2">

                                {/* Botón Anterior (Icono en móvil, Texto+Icono en PC) */}
                                <button
                                    className="btn btn-light shadow-sm border d-flex align-items-center justify-content-center transition-all hover-bg-light"
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    aria-label="Página anterior"
                                    tabIndex={0}
                                    style={{ height: '2.813rem', minWidth: '2.813rem' }}
                                >
                                    {/* Contraste icono #1E3A8A sobre btn-light #F8F9FA = 8.1:1, WCAG AA Aprobado */}
                                    <i className="fa-solid fa-chevron-left" style={{ color: '#1E3A8A' }}></i>
                                    {/* La clase d-none d-sm-inline oculta el texto en celulares */}
                                    <span className="d-none d-sm-inline ms-2 fw-semibold" style={{ color: '#1E3A8A' }}>Anterior</span>
                                </button>

                                {/* El Selector Nativo (Se adapta a cualquier pantalla) */}
                                <div className="bg-white shadow-sm border rounded px-3 d-flex align-items-center" style={{ height: '45px' }}>
                                    <span className="text-secondary small fw-medium me-2">Página</span>
                                    <select
                                        className="form-select form-select-sm fw-bold border-0 bg-transparent shadow-none p-0 pe-4"
                                        value={currentPage}
                                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                                        aria-label="Seleccionar página"
                                        style={{ color: '#1E3A8A', cursor: 'pointer', fontSize: '0.95rem' }}
                                    >
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>
                                                {num} de {totalPages}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Botón Siguiente (Texto+Icono en PC, Icono en móvil) */}
                                <button
                                    className="btn btn-light shadow-sm border d-flex align-items-center justify-content-center"
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    aria-label="Página siguiente"
                                    tabIndex={0}
                                    style={{ height: '2.813rem', minWidth: '2.813rem' }}
                                >
                                    {/* Contraste icono #1E3A8A sobre btn-light #F8F9FA = 8.1:1, WCAG AA Aprobado */}
                                    <span className="d-none d-sm-inline me-2 fw-semibold" style={{ color: '#1E3A8A' }}>Siguiente</span>
                                    <i className="fa-solid fa-chevron-right" style={{ color: '#1E3A8A' }}></i>
                                </button>

                            </div>
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
                                <p className="fw-medium mb-0">{detalleLic.Comprador?.NombreOrganismo || '--'}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <p className="mb-1 text-muted small">Fecha Publicación</p>
                                <p className="fw-medium mb-0">
                                    {detalleLic.Fechas?.FechaPublicacion
                                        ? new Date(detalleLic.Fechas.FechaPublicacion).toLocaleDateString('es-CL')
                                        : '--'}
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