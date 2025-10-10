import React, { useState } from 'react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import { Upload } from 'lucide-react';

const MemsUpload = ({ participantId, upload_path, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('error', 'Please select an image to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('competition_image', file);
      const response = await axiosInstance.put(`/participants/${participantId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadSuccess(response.data.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('error', 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const isDisabled = !!upload_path;

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
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
          {isUploading ? 'Uploading...' : 'Upload Meme Image'}
        </button>
      </div>
    </div>
  );
};

export default MemsUpload;