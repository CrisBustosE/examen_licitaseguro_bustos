import { useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';

const UniversalModal = ({ show, title, children, onClose }) => {
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  // Guardamos la función en una referencia 
  // para que siempre esté actualizada sin disparar re-renderizados.
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (modalRef.current) {
      // Inicializamos sin 'static' para permitir clic afuera
      bsModalRef.current = new Modal(modalRef.current);

      // Usamos la referencia para ejecutar la función
      modalRef.current.addEventListener('hide.bs.modal', () => {
        onCloseRef.current();
      });
    }

    return () => {
      if (bsModalRef.current) {
        bsModalRef.current.dispose();
      }
    };
  }, []); // Array vacío para que Bootstrap se inicialice solo una vez

  useEffect(() => {
    if (show) {
      bsModalRef.current?.show();
    } else {
      bsModalRef.current?.hide();
    }
  }, [show]);

  return (
    <div
      id="universalModal"
      className="modal fade"
      ref={modalRef}
      tabIndex="-1"
      aria-labelledby="universalModalTitle"
      aria-hidden={!show}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow">
          <div className="modal-header" style={{ backgroundColor: '#f8fafc' }}>
            <h5
              className="modal-title fw-bold"
              id="universalModalTitle"
              style={{ color: '#1E3A8A' }}
            >
              {title}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
          </div>
          <div className="modal-body p-4">
            {children}
          </div>
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary fw-semibold" onClick={onClose} tabIndex={0}>
              {/* Contraste #FFFFFF sobre btn-secondary #6C757D = 4.6:1, WCAG AA Aprobado */}
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalModal;