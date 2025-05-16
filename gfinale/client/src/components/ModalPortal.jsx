import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const ModalPortal = ({ children, isOpen, onClose }) => {
  // Create a div that will be appended to the body
  const modalRoot = document.getElementById('modal-root') || document.createElement('div');
  
  useEffect(() => {
    // Ensure the modal root has the necessary id
    if (!document.getElementById('modal-root')) {
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }
    
    // Prevent scrolling of the background
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    // Clean up
    return () => {
      document.body.style.overflow = '';
      
      // If we created the div, remove it when component unmounts
      if (modalRoot.parentNode === document.body) {
        document.body.removeChild(modalRoot);
      }
    };
  }, [isOpen, modalRoot]);
  
  if (!isOpen) return null;
  
  // Create the modal content
  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '90%',
          width: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
          zIndex: 100000,
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
  
  // Use ReactDOM.createPortal to render the modal content at the specified DOM node
  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default ModalPortal; 