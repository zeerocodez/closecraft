import React from 'react';
export const Modal = ({ isOpen, onClose, children, title, className = "" }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-surface-container border border-outline-variant rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}>
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-on-background">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-background transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
export default Modal;
