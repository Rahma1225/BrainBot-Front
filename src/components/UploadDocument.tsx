import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, CheckCircle, XCircle, X, FileText, FileImage, FileSpreadsheet } from 'lucide-react';
import './UploadDocument.css';

interface DocumentItem {
  id: string;
  name: string;
}

const mockDocuments: DocumentItem[] = [
  { id: '1', name: 'ProjectPlan.pdf' },
  { id: '2', name: 'Invoice_March.xlsx' },
  { id: '3', name: 'Photo.png' },
];

function getFileIcon(ext: string) {
  switch (ext) {
    case 'pdf':
    case 'doc':
    case 'docx':
      return <FileText className="document-list-file-icon" />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="document-list-file-icon" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <FileImage className="document-list-file-icon" />;
    default:
      return <FileText className="document-list-file-icon" />;
  }
}

function getFileExt(name: string) {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

const UploadDocument: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage('');
    } else {
      setFile(null);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Veuillez sélectionner un fichier.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      // @ts-ignore
      const { apiService } = await import('../services/api');
      const response = await apiService.uploadDocument(file);
      setMessage(response.message || 'Fichier téléchargé avec succès !');
      setFile(null);
    } catch (error: any) {
      setMessage(error?.message || 'Erreur lors de l\'upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleRemoveSelectedFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="upload-page-modern-wrapper">
      <div className="upload-page-header">
        <button className="upload-back-btn-fixed" onClick={() => navigate('/chatbot')} title="Back to Chatbot">
          <ArrowLeft size={20} />
        </button>
        <div className="upload-page-header-icon">
          <FileUp size={36} />
        </div>
        <div>
          <h1 className="upload-page-header-title">Upload Document</h1>
          <div className="upload-page-header-sub">Supported: PDF, Word, Excel, Images</div>
        </div>
      </div>
      <div className="upload-page-main">
        <div className="upload-document-modern-card">
          <div className="upload-header">
            <FileUp size={36} className="upload-header-icon" />
            <h2>Upload Document</h2>
            <p className="upload-subtitle">Supported: PDF, Word, Excel, Images</p>
          </div>
          <form className="upload-form" onSubmit={handleSubmit}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={loading}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
            />
            <button type="button" className="file-upload-modern-btn" onClick={handleFileButtonClick} disabled={loading}>
              <FileUp size={20} />
              {file ? 'Change File' : 'Choose File'}
            </button>
            {file && (
              <div className="selected-file-modern">
                <span className="file-name-text">{file.name}</span>
                <button
                  type="button"
                  className="selected-file-remove top-right"
                  onClick={handleRemoveSelectedFile}
                  title="Remove selected file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <button type="submit" className="upload-modern-btn" disabled={loading || !file}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          {message && (
            <div className={`upload-message-modern ${message.toLowerCase().includes('succès') || message.toLowerCase().includes('success') ? 'success' : 'error'}`}>
              {message.toLowerCase().includes('succès') || message.toLowerCase().includes('success') ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <span>{message}</span>
            </div>
          )}
        </div>
        <div className="document-list-modern">
          <h3 className="document-list-title">Your Documents</h3>
          {documents.length === 0 ? (
            <div className="document-list-empty">No documents uploaded yet.</div>
          ) : (
            <table className="document-list-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th className="document-list-name-th">Name</th>
                  <th>Type</th>
                  <th className="document-list-remove-th">Remove</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => {
                  const ext = getFileExt(doc.name);
                  return (
                    <tr key={doc.id}>
                      <td>{getFileIcon(ext)}</td>
                      <td className="document-list-name">{doc.name}</td>
                      <td><span className="document-list-ext">{ext}</span></td>
                      <td className="document-list-remove-td">
                        <button className="document-list-remove" onClick={() => handleRemoveDocument(doc.id)} title="Remove document">
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadDocument; 