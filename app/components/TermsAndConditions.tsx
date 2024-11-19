import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
   
}

const TermsAndConditions: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing on content click
      >
        <button
          className="absolute top-3 right-3 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <div>
      <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
      <p>
        Here are the terms and conditions. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Praesent vehicula cursus orci, sit amet
        vehicula ex commodo nec.
      </p>
    </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
