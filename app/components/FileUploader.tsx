// const FileUploader = () => {
//     return (
//       <div className="fileloader-container">
//         <div className="fileloader">
//           <div className="filespinner"></div>
//         </div>
//         <p className="fileloader-text">Please wait, file is being uploaded...</p>
//       </div>
//     );
//   };
  
//   export default FileUploader;
const FileUploader = () => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-sm text-gray-600">Please wait, file is being uploaded...</p>
    </div>
  );
};

export default FileUploader;

  