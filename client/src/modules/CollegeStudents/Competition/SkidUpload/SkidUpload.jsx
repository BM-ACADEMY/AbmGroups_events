import React, { useState } from 'react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";

const SkidUpload = ({ participantId, upload_path, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const maxUploads = 1; // Restrict to one upload for skid competition
  const usedSlots = Array.isArray(upload_path) ? upload_path.length : 0;
  const remainingSlots = maxUploads - usedSlots;
  const isDisabled = remainingSlots <= 0;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      showToast('error', `File ${selectedFile.name} exceeds 20MB limit`);
      setFile(null);
      return;
    }

    if (usedSlots >= maxUploads) {
      showToast('error', 'Only one video can be uploaded for this competition.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('error', 'Please select a video to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('competition_image', file);
      const response = await axiosInstance.put(`/participants/${participantId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        onUploadSuccess(response.data.data);
        // showToast('success', 'Video uploaded successfully');
      } else {
        showToast('error', response.data.message || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload video';
      showToast('error', errorMessage);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2">
        {isDisabled ? (
          <p className="text-muted-foreground">Video upload slot is already used.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Select one video (max 20MB)
            </p>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={isDisabled}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
            <Button
              onClick={handleUpload}
              disabled={isDisabled || isUploading || !file}
              className="flex items-center gap-2 px-4 py-2"
            >
              <Upload size={20} />
              {isUploading ? 'Uploading...' : 'Upload Skid Reel'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SkidUpload;