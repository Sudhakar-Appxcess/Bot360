

import React, { useState } from 'react';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';
import Message from '../../../Response/Message';

const UploadPage = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const clearMessage = () => setMessage({ text: '', type: '' });
  
  const handleFileChange = (e) => {
    setPdfFiles(Array.from(e.target.files));
  };

  const validateFiles = (files) => {
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        setMessage({ text: 'Invalid file type. Please upload PDF files only.', type: 'error' });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'File size exceeds 5MB limit.', type: 'error' });
        return false;
      }
    }
    return true;
  };

  const handleFileSubmit = async () => {
    if (!validateFiles(pdfFiles)) return;

    const formData = new FormData();
    pdfFiles.forEach(file => {
      formData.append('files', file);
    });

    setLoadingState(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/uploadz`, 
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      setMessage({ 
        text: `Processed ${response.data.chunks} chunks from ${response.data.pages} pages`, 
        type: 'success' 
      });
      setPdfFiles([]);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.detail || 'Upload failed', 
        type: 'error' 
      });
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-blue-600 text-center">Document Upload</h2>
        
        <div className="p-6 border-2 border-blue-200 rounded-lg bg-gray-50">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Upload PDF files</h3>
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileChange}
            className="mb-4 border border-gray-300 rounded-lg p-2 w-full"
          />
          <button
            onClick={handleFileSubmit}
            disabled={loadingState || pdfFiles.length === 0}
            className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 
              transition duration-300 ease-in-out ${loadingState || pdfFiles.length === 0 ? 
              'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loadingState ? <BeatLoader size={10} color="#fff" /> : 'Upload PDF'}
          </button>
        </div>

        {message.text && (
          <Message type={message.type} message={message.text} onClose={clearMessage} />
        )}
      </div>
    </div>
  );
};

export default UploadPage;