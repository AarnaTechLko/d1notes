// components/Loading.tsx
import React from 'react';


const Loading: React.FC = () => {
  const text = "D1 NOTES";
  return (
    <div className="flex justify-center items-center h-screen bg-white-100">
      <div className="flex space-x-1">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className={`text-8xl font-bold text-black-500 transform animate-bounce-continuous`}
            style={{ animationDelay: `${index * 0.2}s` }} // Staggered bounce delay
          >
            {char}
          </span>
         
        ))}
        
      </div>
     
    </div>
    
  );
};

export default Loading;
