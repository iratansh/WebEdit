import React, { useState } from "react";
import "./AppLaunch.css";
import mammoth from "mammoth";
import GoogleDoc from "./DocumentEditor";

export default function AppLaunch() {
  const [isGoogleDocVisible, setIsGoogleDocVisible] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const fileType = file.type;

      if (fileType === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(e.target.result);
        };
        reader.readAsText(file);
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          mammoth
            .convertToHtml({ arrayBuffer: e.target.result })
            .then((result) => {
              setFileContent(result.value);
            })
            .catch((err) => {
              console.error(err);
              alert("Error reading .docx file.");
            });
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Unsupported file type. Please upload a .txt or .docx file.");
      }
    }
  };

  const handleContinue = () => {
    if (fileContent) {
      setIsGoogleDocVisible(true);
    }
    setIsGoogleDocVisible(true);
  };

  if (isGoogleDocVisible) {
    if (fileContent) {
      return <GoogleDoc content={fileContent} />;
    } else {
      return <GoogleDoc />;
    }
  }

  return (
    <div className="app-launch">
      <div className="container">
        <h1 className="header">Welcome to WebEdit</h1>
        <p className="description">
          Your ultimate web-based document creation and editing tool.
        </p>

        <div className="upload-section">
          <input
            type="file"
            id="file"
            name="file"
            accept=".docx,.txt"
            className="file-input"
            onChange={handleFileChange}
          />
          <div className="file-name">{fileName}</div>
          <button className="continue-button" onClick={handleContinue}>
            Start Editing
          </button>
        </div>

        <p className="instruction">
          Choose a file to upload or click the button to start editing.
        </p>
      </div>

      <div className="footer">
        <p>© 2024 WebEdit. All rights reserved.</p>
      </div>
    </div>
  );
}
