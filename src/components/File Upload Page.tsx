import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FileUpload.css";
import teamsoftLogo from "../assets/timsoft.png"; // Replace with your logo path

interface UploadedFile {
  _id: string;
  filename: string;
  uploaded_at: string;
}

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Fetch uploaded files on mount
  const fetchFiles = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/files");
      const data = await res.json();
      if (data.success) setUploadedFiles(data.files);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`File uploaded successfully: ${file.name}`);
        setFile(null);
        fetchFiles(); // Refresh uploaded files list
      } else {
        setMessage(`Upload failed: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm("Are you sure you want to delete this file and its history?")) return;

    try {
      const res = await fetch(`http://localhost:5050/api/files/${fileId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setUploadedFiles(uploadedFiles.filter((f) => f._id !== fileId));
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting file.");
    }
  };

  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <img src={teamsoftLogo} alt="Teamsoft Logo" className="logo" />
        </div>
        <div className="nav-links">
          <Link to="/admin" className="dashboard-btn">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Upload section */}
      <div className="upload-page">
        <div className="upload-container">
          <div
            className="upload-box"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <p className="upload-text">Click or Drop File Here</p>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="hidden-input"
            />
          </div>

          {file && <p className="file-name">{file.name}</p>}

          <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {message && <p style={{ marginTop: "10px" }}>{message}</p>}

          {/* Uploaded files list */}
          <div style={{ marginTop: "30px", width: "100%", maxWidth: "500px" }}>
            <h3>Uploaded Files</h3>
            {uploadedFiles.length === 0 ? (
              <p>No files uploaded yet.</p>
            ) : (
              <ul>
                {uploadedFiles.map((file) => (
                  <li key={file._id} style={{ marginBottom: "8px" }}>
                    {file.filename} - {new Date(file.uploaded_at).toLocaleString()}
                    <button
                      style={{ marginLeft: "10px", cursor: "pointer", padding: "2px 8px" }}
                      onClick={() => handleDelete(file._id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
