import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import Joyride, { CallBackProps, STATUS } from "react-joyride";
interface PromptComponentProps {
    stepstext:string;
    marginleft:number // The steps will be an array of Step objects
  }
  
  const PromptComponent: React.FC<PromptComponentProps> = ({ stepstext,marginleft }) => {
  
  const [run, setRun] = useState(true); 
   
  const steps = [
    {
      target: ".dashboard-step",
      content:stepstext,
      placement: "right" as const,
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED) {
      setRun(false); // Keep the tour from running permanently after finish
    }
  };



  return (
    <div className='block'>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: { zIndex: 10000 },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish", // Change button label to Finish
          next: "Next",
          skip: "Skip",
        }}
      />
     <button 
  className={`px-6 py-3 bg-teal-500 dashboard-step ml-${marginleft} text-white rounded-lg shadow-lg flex items-center space-x-2 hover:bg-teal-600 focus:outline-none transition-all duration-300 ease-in-out`}
  onMouseEnter={() => setRun(true)} // Trigger tour manually again
>
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5"></path>
  </svg>
  <span>Start The Tour</span>
</button>

    
    </div>
  );
};

export default PromptComponent;
