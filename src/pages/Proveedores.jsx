import { useState } from 'react';
import UniversalModal from '../components/UniversalModal';
import { API_BASE_URL, API_TICKET } from '../utils/apiConfig';

const Proveedores = () => {
    // Estados del formulario
    const [rutInput, setRutInput] = useState('');
    const [errorRut, setErrorRut] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estados para el Modal Universal
    const [showModal, setShowModal] = useState(false);
    const [proveedorData, setProveedorData] = useState(null);

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

    // Estas 2 funciones manejan cuando el usuario hace backspace despues del punto/guion y supr antes del punto/guion
    // evitando que al presionar no suceda nada dado al formateo automático aplicado

    // =================================================================
    // LÓGICA DE UX: Interceptor de teclado para saltar puntos y guiones
    // =================================================================
    const handleTeclas = (e) => {
        const input = e.target;
        const cursor = input.selectionStart;
        const value = input.value;

        if (cursor !== input.selectionEnd) return;

        if (e.key === 'Delete') {
            if (value[cursor] === '.' || value[cursor] === '-') {
                input.setSelectionRange(cursor + 1, cursor + 1);
            }
        } else if (e.key === 'Backspace') {
            if (value[cursor - 1] === '.' || value[cursor - 1] === '-') {
                input.setSelectionRange(cursor - 1, cursor - 1);
            }
        }
    };

    // =================================================================
    // LÓGICA DE UX: Manejo del cursor "Antifrustration"
    // =================================================================
    const handleCambioRut = (e) => {
        const input = e.target;
        const valorNuevo = input.value;
        const cursorPosition = input.selectionStart;

        // 1. Contamos cuántos caracteres reales (números o K) hay ANTES del cursor
        const substringAntesCursor = valorNuevo.substring(0, cursorPosition);
        const cantidadNumerosAntesCursor = substringAntesCursor.replace(/[^0-9kK]/g, '').length;

        // 2. Formateamos el valor
        const valorFormateado = formatearRut(valorNuevo);
        setRutInput(valorFormateado);

        // 3. Restauramos el cursor "anclándolo" a los números reales
        window.requestAnimationFrame(() => {
            let nuevaPosicion = 0;
            let numerosContados = 0;

            if (cantidadNumerosAntesCursor === 0) {
                nuevaPosicion = 0;
            } else {
                for (let i = 0; i < valorFormateado.length; i++) {
                    // Si es un número o una K, lo contamos
                    if (/[0-9kK]/.test(valorFormateado[i])) {
                        numerosContados++;
                    }
                    // Cuando alcancemos la misma cantidad de números que había antes del cursor,
                    // posicionamos el cursor exactamente a su lado (saltando puntos o guiones).
                    if (numerosContados === cantidadNumerosAntesCursor) {
                        nuevaPosicion = i + 1;
                        break;
                    }
                }
            }
            // Devolvemos el cursor a su lugar exacto
            input.setSelectionRange(nuevaPosicion, nuevaPosicion);
        });
    };
    // =================================================================
    // LÓGICA DE VALIDACIÓN Y BÚSQUEDA API
    // =================================================================
    const handleBuscar = async (e) => {
        e.preventDefault();
        setErrorRut('');
        setProveedorData(null);

        // 1. aislar una versión estrictamente alfanumérica para la MATEMÁTICA
        const rutParaMath = rutInput.replace(/[^0-9kK]+/g, '').toLowerCase();

        // 2. Validación de longitud (Un RUT chileno válido tiene al menos 7 u 8 números + DV)
        // Usamos 8 como mínimo para contemplar RUTs antiguos (ej: 1.000.000-0)
        if (rutParaMath.length == 0) {
            setErrorRut('El campo RUT está vacío. Ingresa un RUT válido.');
            return;
        }else if (rutParaMath.length < 8) {
            setErrorRut('El RUT es demasiado corto. Ingresa un RUT válido.');
            return;
        } 

        // 3. Separar cuerpo del dígito verificador para la validación
        const cuerpo = rutParaMath.slice(0, -1);
        const dvIngresado = rutParaMath.slice(-1);

        // 4. Calcular el DV esperado usando la función compartida del profe
        const dvCalculado = dgv(cuerpo);

        // 5. Comparar matemáticamente
        if (dvIngresado !== dvCalculado) {
            setErrorRut('El RUT ingresado no es válido. Comprueba que los números y el dígito verificador sean correctos.');
            return;
        }

        // Pasamos la validación local, ahora consultamos la API
        setIsLoading(true);

        try {
            // Mandamos el RUT con el formato visual que la API exige (ej: 12.345.678-9)
            const endpoint = `https://api.mercadopublico.cl/servicios/v1/Publico/Empresas/BuscarProveedor?rutempresaproveedor=${rutInput}&ticket=${API_TICKET}`;

            const response = await fetch(endpoint);
            const data = await response.json(); // Leemos el JSON incluso si viene con un Error 500

            // 6. MANEJO DE LA "PIFIA" DE LA API (Error 500 con Codigo 10200)
            // Nota: La API de mercado público devuelve un 500 en vez de un 404 cuando no encuentra un proveedor registrado a ese rut por ende lo manipulamos acá
            if (!response.ok) {
                if (data.Codigo === 10200) {
                    setErrorRut('El RUT es válido matemáticamente, pero no se encontró un proveedor registrado en Mercado Público con este número.');
                    return;
                }
                // Si es un 500 de verdad (o 401, 429), lanzamos el error general
                throw new Error(data.Mensaje || 'Error en el servidor');
            }

            // 7. Flujo feliz: Verificamos si la API nos devolvió la empresa
            if (data.listaEmpresas && data.listaEmpresas.length > 0) {
                setProveedorData({
                    rutFormateado: rutInput,
                    ...data.listaEmpresas[0]
                });
                setShowModal(true);
            } else {
                // Por si en algún momento la API se arregla y devuelve un 200 con arreglo vacío
                setErrorRut('No se encontró información para este RUT en los registros de ChileCompra.');
            }
        } catch (error) {
            console.error(error);
            setErrorRut('Hubo un problema de conexión con Mercado Público. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
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
                                            onChange={handleCambioRut}
                                            onKeyDown={handleTeclas}
                                            maxLength={12} // Evita que escriban biblias infinitas
                                        />
                                        <button
                                            className="btn text-white px-4 fw-bold shadow-sm"
                                            type="submit"
                                            style={{ backgroundColor: '#1E3A8A' }}
                                        >
                                            {isLoading ? (
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            ) : (
                                                <i className="fa-solid fa-magnifying-glass me-2"></i>
                                            )}
                                            Buscar
                                        </button>
                                    </div>
                                    {/* Feedback visual de error nativo de Bootstrap */}
                                    {errorRut && <div className="invalid-feedback d-block fw-semibold">{errorRut}</div>}
                                </div>
                            </form>
                        </div>
                    </div>



                </div>
            </div>
            {/* ========================================================== */}
            {/* MODAL UNIVERSAL PARA DETALLE DEL PROVEEDOR                 */}
            {/* ========================================================== */}
            <UniversalModal
                show={showModal}
                title="Ficha del Proveedor"
                onClose={() => setShowModal(false)}
            >
                {proveedorData && (
                    <div>
                        <div className="text-center mb-4">
                            <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
                                <i className="fa-solid fa-building text-primary fs-1"></i>
                            </div>
                            <h4 className="fw-bold" style={{ color: '#1E3A8A' }}>{proveedorData.NombreEmpresa}</h4>
                            <span className="badge bg-success px-3 py-2 mt-1">Proveedor Habilitado</span>
                        </div>

                        <hr className="text-secondary opacity-25 mb-4" />

                        <div className="row gy-4">
                            <div className="col-12 col-md-6">
                                <p className="mb-1 text-muted small">RUT Proveedor</p>
                                <p className="fw-bold mb-0 fs-5">{proveedorData.rutFormateado}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <p className="mb-1 text-muted small">Código Empresa (Mercado Público)</p>
                                <p className="fw-medium mb-0">{proveedorData.CodigoEmpresa}</p>
                            </div>
                        </div>

                        <div className="alert mt-4 border-0 shadow-sm" style={{ backgroundColor: '#f8fafc' }}>
                            <i className="fa-solid fa-circle-info text-primary me-2"></i>
                            <small className="text-muted">
                                La información detallada de contacto se encuentra reservada por Mercado Público.
                            </small>
                        </div>
                    </div>
                )}
            </UniversalModal>
        </div>

    );
};

export default Proveedores;