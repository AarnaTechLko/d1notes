import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import Joyride, { CallBackProps, STATUS } from "react-joyride";

interface PromptComponentProps {
  stepstext: string; // The text that will be shown in the modal
  marginleft: number; // The margin left for the button
}

const PromptComponent: React.FC<PromptComponentProps> = ({ stepstext, marginleft }) => {
  const [run, setRun] = useState(true);
  const [showModal, setShowModal] = useState(true); // State to control modal visibility

  const steps = [
    {
      target: ".dashboard-step",
      content: stepstext,
      placement: "right" as const,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED) {
      setRun(false); // Stop the tour after it finishes
    }
  };

  const closeModal = () => {
    setShowModal(false); // Close modal when the user clicks on 'Start Tour'
  };

  useEffect(() => {
    if (showModal) {
      setRun(true); // Start the tour if the modal is shown
    }
  }, [showModal]);

  return (
    

 <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Tour Guide</h2>
            <p className="mb-6">{stepstext}</p>
            <div className="flex justify-end">
              <button
                className="bg-teal-500 text-white px-6 py-3 rounded-lg"
                onClick={closeModal}
              >
               Click to Close!
              </button>
            </div>
          </div>
        </div>
      )}

  
</>
  );
};

export default PromptComponent;
