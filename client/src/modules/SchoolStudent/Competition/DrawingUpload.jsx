import React, { useState } from "react";
import axiosInstance from "@/modules/axios/axios";
import { showToast } from "@/modules/toast/customToast";
import { Upload } from "lucide-react"; // using Lucide upload icon

const DrawingUpload = ({ participantId, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
      showToast("error", "File size must be less than 20MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast("error", "Please select a file to upload");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("competition_image", file);

    try {
      const response = await axiosInstance.put(
        `/participants/${participantId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      onUploadSuccess(response.data.data);
      onClose();
    } catch (error) {
      console.error("Error uploading drawing:", error);
      showToast("error", "Failed to upload drawing");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Upload Your Drawing
      </h2>

      {/* Custom file input with upload icon */}
      <label className="flex items-center gap-2 border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-100 transition">
        <Upload className="w-5 h-5 text-blue-500" />
        <span className="text-gray-600">
          {file ? file.name : "Choose a file to upload"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded text-white transition-colors ${
            uploading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DrawingUpload;
