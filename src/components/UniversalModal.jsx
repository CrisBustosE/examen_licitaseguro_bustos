import { useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';

const UniversalModal = ({ show, title, children, onClose }) => {
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  useEffect(() => {
    // Inicializamos el modal de Bootstrap
    if (modalRef.current) {
      bsModalRef.current = new Modal(modalRef.current, { 
        backdrop: 'static', // Evita que se cierre al hacer clic afuera (opcional)
        keyboard: false 
      });
    }
    
    // Limpieza al desmontar
    return () => {
      if (bsModalRef.current) {
        bsModalRef.current.dispose();
      }
    };
  }, []);

  // Escuchamos los cambios en la prop 'show' para abrir o cerrar
  useEffect(() => {
    if (show) {
      bsModalRef.current?.show();
    } else {
      bsModalRef.current?.hide();
    }
  }, [show]);

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow">
          <div className="modal-header" style={{ backgroundColor: '#f8fafc' }}>
            <h5 className="modal-title fw-bold" style={{ color: '#1E3A8A' }}>
              {title}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
          </div>
          <div className="modal-body p-4">
            {children}
          </div>
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary fw-semibold" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalModal;