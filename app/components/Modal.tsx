// components/Modal.tsx
import React from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;  // Add this line to support children
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3">
        {/* Header with Blue Background */}
        <div className="bg-blue-600 text-white p-4 ">
          <h2 className="text-lg font-bold">Welcome to the Coach Panel!</h2>
        </div>
        {/* Modal Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">Please start evaluation as per the evaluation requests.</p>
          <button
            onClick={onClose}
            className="mt-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
