import React from 'react';
import Swal from 'sweetalert2';

type ModalProps = {
  isOpen: boolean;
  evaluationId?: number;
  onClose: () => void;
  children?: React.ReactNode;  // Add this line to support children
};


const AcceptanceModal: React.FC<ModalProps> = ({ isOpen, onClose, evaluationId }) => {

    const handleAccept = async () => {
        const payload = {
          evaluationId: evaluationId,
          status: 1
        };
        
        try {
            const response = await fetch('/api/coach/evaluations', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
        
            if (!response.ok) {
              throw new Error('Failed to accept evaluation');
            }
        
            const result = await response.json();
       
            Swal.fire({
              title: 'You Have Accepted The Evaluation Request!',
              text: '',
              icon: 'success',
              confirmButtonText: 'OK', // Custom confirm button text
            }).then(() => {
              // Delay the redirect by 2 seconds (2000 milliseconds)
              setTimeout(() => {
                window.location.href = '/coach/dashboard'; 
              }, 1000); // Adjust the delay time as needed
            });
          } catch (error) {
            console.error('Error:', error);
          }
      };
      
      const handleReject = async () => {
        const payload = {
            evaluationId: evaluationId,
            status: 3
          };
          
          try {
              const response = await fetch('/api/coach/evaluations', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });
          
              if (!response.ok) {
                throw new Error('Failed to accept evaluation');
              }
              Swal.fire('Your Have Rejected The Evaluation Request!', '', 'error');
              window.location.href = '/coach/dashboard'; 
            } catch (error) {
              console.error('Error:', error);
            }
      };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3">
        <div className="bg-blue-600 text-white p-4 ">
          <h2 className="text-lg font-bold">Please take and action!</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6">You can accept and reject the requested evaluation!</p>
          <div className="flex justify-center space-x-2"> {/* Flex container for buttons */}
            <button
              onClick={handleAccept}
              className="bg-green-500 text-white font-semibold px-4 py-2 rounded hover:bg-green-600 transition duration-200"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600 transition duration-200"
            >
              Reject
            </button>
          </div>
          <div className="flex justify-end space-x-2 pt-6">
          <button
            onClick={onClose}
            className="mt-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Close
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptanceModal;
