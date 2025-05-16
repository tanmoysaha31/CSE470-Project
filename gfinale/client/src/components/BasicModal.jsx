import React from 'react';
import ReactDOM from 'react-dom';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    width: '500px',
    maxWidth: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e5e5e5',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #e5e5e5',
    gap: '8px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid #ccc',
  },
  primaryButton: {
    backgroundColor: '#0275d8',
    borderColor: '#0275d8',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
    color: 'white',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
    color: 'white',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: '1rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
  },
  select: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: '1rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
  },
  textarea: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: '1rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
  },
};

// Function to find or create modal root
const getModalRoot = () => {
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }
  return modalRoot;
};

const BasicModal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  
  // Prevent scrolling when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const modal = (
    <div style={modalStyles.overlay} onClick={handleOverlayClick}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h4 style={modalStyles.title}>{title}</h4>
          <button 
            style={modalStyles.closeButton} 
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        {children}
        
        {footer && <div style={modalStyles.footer}>{footer}</div>}
      </div>
    </div>
  );
  
  return ReactDOM.createPortal(modal, getModalRoot());
};

export default BasicModal; 