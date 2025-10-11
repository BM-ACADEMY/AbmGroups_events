import React, { useState } from 'react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";

const PhotographyUpload = ({ participantId, upload_path, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const maxUploads = 15;
  const existingFileCount = Array.isArray(upload_path) ? upload_path.length : 0;
  const remainingUploads = maxUploads - existingFileCount;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + existingFileCount > maxUploads) {
      showToast('error', `You can upload a maximum of ${maxUploads} images. Only ${remainingUploads} more allowed.`);
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
      if (response.data.success) {
        onUploadSuccess(response.data.data);
      } else {
        showToast('error', response.data.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast('error', error.response?.data?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      setFiles([]);
    }
  };

  const isDisabled = remainingUploads <= 0;

  return (
    <div className="mt-4">
      {isDisabled ? (
        <p className="text-gray-600 mb-2">
          Maximum of {maxUploads} images uploaded. You cannot upload more.
        </p>
      ) : (
        <p className="text-gray-600 mb-2">
          {remainingUploads} image{remainingUploads !== 1 ? 's' : ''} remaining to upload.
        </p>
      )}
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={isDisabled}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <Button
          onClick={handleUpload}
          disabled={isDisabled || isUploading}
          className={`flex items-center gap-2 ${isDisabled || isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          <Upload size={20} />
          {isUploading ? 'Uploading...' : `Upload Photography Images (up to ${remainingUploads})`}
        </Button>
      </div>
    </div>
  );
};

export default PhotographyUpload;