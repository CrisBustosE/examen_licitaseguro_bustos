import { useState } from 'react';

const Proveedores = () => {
    // Estados del formulario
    const [rutInput, setRutInput] = useState('');
    const [errorRut, setErrorRut] = useState('');
    const [proveedorMock, setProveedorMock] = useState(null);

    // =================================================================
    // FUNCIÓN: Formateador dinámico de RUT (Ej: 111111111 -> 11.111.111-1)
    // =================================================================
    const formatearRut = (rutBruto) => {
        // 1. Quitamos todo lo que no sea número o la letra K
        const actual = rutBruto.replace(/[^0-9kK]+/g, '').toUpperCase();

        // Si borró todo, devolvemos vacío
        if (actual.length === 0) return '';
        // Si solo tiene 1 número, no hay guion aún
        if (actual.length === 1) return actual;

        // 2. Separamos el cuerpo del DV
        const cuerpo = actual.slice(0, -1);
        const dv = actual.slice(-1);

        // 3. Le ponemos los puntos al cuerpo usando una expresión regular clásica
        const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // 4. Unimos todo con el guion
        return `${cuerpoConPuntos}-${dv}`;
    };

    // =================================================================
    // FUNCIÓN COMPARTIDA POR EL PROFESOR: Cálculo matemático del Dígito Verificador
    // =================================================================
    const dgv = (T) => {
        let M = 0;
        let S = 1;
        let num = parseInt(T, 10); // Aseguramos que sea un número para el while

        while (num) {
            let digit = num % 10;
            S = (S + digit * (9 - (M % 6))) % 11;
            num = Math.floor(num / 10);
            M++;
        }

        // Si el resultado es 11, el DV es 0. Si es 10, es 'k'.
        return S ? (S - 1).toString() : 'k';
    };

    // =================================================================
    // LÓGICA DE VALIDACIÓN Y BÚSQUEDA
    // =================================================================
    const handleBuscar = (e) => {
        e.preventDefault();
        setErrorRut('');
        setProveedorMock(null);

        // 1. Limpieza de formato (quitamos puntos, guiones y pasamos a minúscula)
        const rutLimpio = rutInput.replace(/[^0-9kK]+/g, '').toLowerCase();

        // 2. Validación de longitud mínima (ej: 1-9)
        if (rutLimpio.length < 2) {
            setErrorRut('Por favor, ingresa un RUT válido.');
            return;
        }

        // 3. Separar cuerpo del dígito verificador ingresado
        const cuerpo = rutLimpio.slice(0, -1);
        const dvIngresado = rutLimpio.slice(-1);

        // 4. Calcular el DV esperado usando la función compartida del profe
        const dvCalculado = dgv(cuerpo);

        // 5. Comparar
        if (dvIngresado !== dvCalculado) {
            setErrorRut('El RUT ingresado no es válido. Comprueba que los números y el dígito verificador sean correctos.');
            return;
        }

        // Si pasamos la validación, mostramos la Data (Mock temporal para maquetar)
        // Más adelante aquí irá el Fetch a la API
        setProveedorMock({
            rut: rutInput, // Mostramos el que escribió el usuario además lo embellecemos con puntos y guión
            razonSocial: 'Constructora Ejemplo S.A.',
            direccion: 'Av. Siempre Viva 123, Santiago',
            telefono: '+56 2 1234 5678',
            email: 'contacto@constructoraejemplo.cl',
            estado: 'Activo'
        });
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">

                    <h2 className="fw-bold mb-4 text-center" style={{ color: '#1E3A8A' }}>
                        Buscador de Proveedores
                    </h2>

                    {/* TARJETA DEL BUSCADOR */}
                    <div className="card shadow-sm border-0 mb-4 p-3 p-md-4">
                        <div className="card-body p-0">
                            <form onSubmit={handleBuscar}>
                                <div className="mb-3">
                                    <label htmlFor="rutInput" className="form-label fw-semibold text-secondary">
                                        Ingrese RUT del proveedor
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className={`form-control form-control-lg ${errorRut ? 'is-invalid' : ''}`}
                                            id="rutInput"
                                            placeholder="Ej: 12.345.678-9"
                                            value={rutInput}
                                            // AQUI APLICAMOS LA MAGIA: Formateamos el valor antes de guardarlo en el estado
                                            onChange={(e) => setRutInput(formatearRut(e.target.value))}
                                            maxLength={12} // Evita que escriban biblias infinitas
                                        />
                                        <button
                                            className="btn text-white px-4 fw-bold shadow-sm"
                                            type="submit"
                                            style={{ backgroundColor: '#1E3A8A' }}
                                        >
                                            <i className="fa-solid fa-magnifying-glass me-2"></i> Buscar
                                        </button>
                                    </div>
                                    {/* Feedback visual de error nativo de Bootstrap */}
                                    {errorRut && <div className="invalid-feedback d-block fw-semibold">{errorRut}</div>}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* TARJETA DE RESULTADO (Aparece solo si la validación es exitosa) */}
                    {proveedorMock && (
                        <div className="card shadow border-0 bg-light">
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-4" style={{ color: '#1E3A8A' }}>
                                    Información del Proveedor
                                </h4>

                                <div className="row gy-4">
                                    <div className="col-12 col-md-6">
                                        <p className="text-secondary mb-1 small">RUT</p>
                                        <p className="fw-bold mb-0">{proveedorMock.rut}</p>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <p className="text-secondary mb-1 small">Razón Social</p>
                                        <p className="fw-bold mb-0">{proveedorMock.razonSocial}</p>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <p className="text-secondary mb-1 small">Dirección</p>
                                        <p className="fw-bold mb-0">{proveedorMock.direccion}</p>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <p className="text-secondary mb-1 small">Teléfono</p>
                                        <p className="fw-bold mb-0">{proveedorMock.telefono}</p>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <p className="text-secondary mb-1 small">Email</p>
                                        <p className="fw-bold mb-0">{proveedorMock.email}</p>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <p className="text-secondary mb-1 small">Estado</p>
                                        <span className={`badge bg-${proveedorMock.estado === 'Activo' ? 'success' : 'danger'} px-3 py-2`}>
                                            {proveedorMock.estado}
                                        </span>
                                    </div>
                                </div>

                                <hr className="my-4" />

                                <div className="text-md-end text-center ">
                                    <button className="btn text-white fw-bold shadow-sm" style={{ backgroundColor: '#1E3A8A' }}>
                                        Ver Historial de Licitaciones
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Proveedores;