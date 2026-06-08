import { useState } from 'react';

const Licitaciones = () => {
    // Datos falsos (mock) temporales para poder maquetar y ver cómo queda la tabla
    // antes de conectarnos de verdad a la API de Mercado Público.
    const mockLicitaciones = [
        { CodigoExterno: 'LS001', Nombre: 'Construcción de Puente Peatonal', FechaCierre: '2026-11-15T15:00:00', Estado: 'Publicada' },
        { CodigoExterno: 'LS002', Nombre: 'Suministro de Equipos Informáticos', FechaCierre: '2026-11-10T12:00:00', Estado: 'Cerrada' },
        { CodigoExterno: 'LS003', Nombre: 'Servicio de Limpieza de Oficinas', FechaCierre: '2026-11-20T18:00:00', Estado: 'Adjudicada' },
        { CodigoExterno: 'LS004', Nombre: 'Servicio de Limpieza de Oficinas', FechaCierre: '2026-10-29T18:00:00', Estado: 'Desierta' },
        { CodigoExterno: 'LS005', Nombre: 'Servicio de Limpieza de Oficinas', FechaCierre: '2026-11-20T18:00:00', Estado: 'Revocada' }
    ];

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4" style={{ color: '#1E3A8A' }}>Buscador de Licitaciones</h2>

            {/* ================= SECCIÓN DE FILTROS ================= */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body bg-light rounded">
                    <form className="row g-3 align-items-end">
                        <div className="col-12 col-md-4">
                            <label htmlFor="fechaFiltro" className="form-label fw-semibold text-secondary">Fecha</label>
                            {/* Para accesibilidad, siempre conectamos el label con el id del input */}
                            <input
                                type="date"
                                className="form-control"
                                id="fechaFiltro"
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                            />
                        </div>

                        <div className="col-12 col-md-5">
                            <label htmlFor="estadoFiltro" className="form-label fw-semibold text-secondary">Estado</label>
                            <select className="form-select" id="estadoFiltro">
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
                            <button type="submit" className="btn text-white w-100 fw-bold shadow-sm" style={{ backgroundColor: '#1E3A8A' }}>
                                <i className="fa-solid fa-magnifying-glass me-2"></i> Buscar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ================= SECCIÓN DE RESULTADOS (TABLA) ================= */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="py-3">Título</th>
                                    {/* Esta clase oculta la columna en móviles y la muestra desde tablets hacia arriba */}
                                    <th className="py-3 d-none d-md-table-cell">Fecha Cierre</th>
                                    <th className="py-3">Estado</th>
                                    {/* Escondemos el texto en móvil y le damos padding derecho (pe-3) para separarlo de la pared */}
                                    <th className="text-center pe-3 pe-md-4 py-3">
                                        <span className="d-none d-md-inline">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockLicitaciones.map((lic, index) => (
                                    <tr key={index}>
                                        <td className="px-4 fw-medium">{lic.CodigoExterno}</td>
                                        <td>{lic.Nombre}</td>
                                        <td className="d-none d-md-table-cell">
                                            {/* Formateamos la fecha a un formato chileno legible */}
                                            {new Date(lic.FechaCierre).toLocaleDateString('es-CL')}
                                        </td>
                                        <td>
                                            <span className={`badge bg-${lic.Estado === 'Publicada' || lic.Estado === 'Adjudicada' ? 'success' : lic.Estado === 'Revocada' || lic.Estado === 'Desierta' ? 'danger' : 'secondary'}`}>
                                                {lic.Estado}
                                            </span>
                                        </td>
                                        <td className="text-center px-2">
                                            {/* Agregamos title para accesibilidad en caso de que solo vean el ícono */}
                                            <button className="btn btn-sm fw-semibold p-1 p-md-2" style={{ color: '#1E3A8A' }} title="Ver Detalles">
                                                {/* Este texto solo se ve de tablets hacia arriba */}
                                                <span className="d-none d-md-inline">Ver Detalles</span>
                                                {/* Este ícono solo se ve en celulares */}
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

            {/* Espacio reservado para la paginación por requerimiento */}
            <div className="mt-4 d-flex justify-content-center">
                <p className="text-muted small">Mostrando 1-5 de 5 resultados (Mock)</p>
            </div>

        </div>
    );
};

export default Licitaciones;