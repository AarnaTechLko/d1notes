"use client";

import React from "react";

const Processing = () => {
  return (
    <div className="logout-overlay">
      <div className="logout-loader">
        <div className="spinner"></div>
        <p>Please wait...</p>
      </div>
      <style jsx>{`
        .logout-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .logout-loader {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #ccc;
          border-top: 5px solid #0070f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        p {
          margin-top: 15px;
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default Processing;
