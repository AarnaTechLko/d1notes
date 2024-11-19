const FileUploader = () => {
    return (
      <div className="fileloader-container">
        <div className="fileloader">
          <div className="filespinner"></div>
        </div>
        <p className="fileloader-text">Please wait, file is being uploaded...</p>
      </div>
    );
  };
  
  export default FileUploader;
  