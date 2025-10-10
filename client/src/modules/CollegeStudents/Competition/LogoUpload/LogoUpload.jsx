import React, { useState } from 'react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import { Upload } from 'lucide-react';

const LogoUpload = ({ participantId, upload_path, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + (Array.isArray(upload_path) ? upload_path.length : 0) > 3) {
      showToast('error', 'You can upload a maximum of 3 images.');
      return;
    }
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showToast('error', 'Please select at least one image to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('competition_image', file));
      const response = await axiosInstance.put(`/participants/${participantId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadSuccess(response.data.data);
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast('error', 'Failed to upload images');
    } finally {
      setIsUploading(false);
      setFiles([]);
    }
  };

  const isDisabled = Array.isArray(upload_path) && upload_path.length >= 3;

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={isDisabled}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={handleUpload}
          disabled={isDisabled || isUploading}
          className={`flex items-center gap-2 px-4 py-2 rounded text-white transition-colors ${
            isDisabled || isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <Upload size={20} />
          {isUploading ? 'Uploading...' : 'Upload Logo Images (up to 3)'}
        </button>
      </div>
    </div>
  );
};

export default LogoUpload;