import React from 'react';
import Swal from 'sweetalert2';

type ModalProps = {
  isOpen: boolean;
  evaluationId?: number;
  onClose: () => void;
};

const AcceptanceModal: React.FC<ModalProps> = ({ isOpen, onClose, evaluationId }) => {
  const handleAccept = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to accept this evaluation request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Accept',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = {
          evaluationId: evaluationId,
          status: 1,
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

          Swal.fire({
            title: 'Accepted!',
            text: 'You have accepted the evaluation request.',
            icon: 'success',
          }).then(() => {
            setTimeout(() => {
              window.location.href = '/coach/dashboard';
            }, 1000);
          });
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  };

  const handleReject = async () => {
    Swal.fire({
      title: 'Add a Remark',
      input: 'textarea',
      inputPlaceholder: 'Write your remark here...',
      inputAttributes: {
        'aria-label': 'Write your remark here',
      },
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const remark = result.value;
        if (!remark) {
          Swal.fire('Error', 'Remark is required to reject the evaluation.', 'error');
          return;
        }

        const payload = {
          evaluationId: evaluationId,
          status: 3,
          remark: remark, // Include the remark in the payload
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
            throw new Error('Failed to reject evaluation');
          }

          Swal.fire({
            title: 'Rejected!',
            text: 'You have rejected the evaluation request.',
            icon: 'error',
          }).then(() => {
            setTimeout(() => {
              window.location.href = '/coach/dashboard';
            }, 1000);
          });
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-lg font-bold">Please take an action!</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6">You can accept or reject the requested evaluation.</p>
          <div className="flex justify-center space-x-2">
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
