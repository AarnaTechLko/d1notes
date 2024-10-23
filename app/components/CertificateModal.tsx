"use client"; // Ensure this is a client component
import { useState } from 'react';
import { signIn, useSession  } from 'next-auth/react';
import { showSuccess, showError } from '../components/Toastr';
import jwt from 'jsonwebtoken';
interface CertificateModalProps {
  certificate:string;
  closeCertificateModal: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ closeCertificateModal,certificate }) => {
 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={closeCertificateModal}
        >
          ✖
        </button>
 
        

        <img
          src={certificate}
          alt="Certificate"
          className="w-full h-full object-contain"
        />

        
      </div>
    </div>
  );
};

export default CertificateModal;
