"use client";

import React from "react";

const LogoutLoader = () => {
  return (
    <div className="logout-loader">
      <div className="spinner"></div>
      <p>Logging out, please wait...</p>
      <style jsx>{`
        .logout-loader {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f9f9f9;
          color: #555;
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
          margin-top: 20px;
          font-size: 16px;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default LogoutLoader;
