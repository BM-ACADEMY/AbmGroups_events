import React, { useState } from "react";
import axiosInstance from "@/modules/axios/axios";
import { showToast } from "@/modules/toast/customToast";
import { Upload } from "lucide-react";

const DrawingUpload = ({ participantId, onClose, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 20 * 1024 * 1024) {
        showToast("error", `File ${file.name} exceeds 20MB limit`);
        return false;
      }
      return true;
    });
    setFiles(validFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showToast("error", "Please select at least one file to upload");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("competition_image", file));

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

      if (response.data.success) {
        onUploadSuccess(response.data.data);
        // showToast("success", "Drawing(s) uploaded successfully");
        onClose();
      } else {
        showToast("error", response.data.message || "Failed to upload drawing");
      }
    } catch (error) {
      console.error("Error uploading drawing:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload drawing";
      showToast("error", errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Upload Your Drawing
      </h2>
      <label className="flex items-center gap-2 border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-100 transition">
        <Upload className="w-5 h-5 text-blue-500" />
        <span className="text-gray-600">
          {files.length > 0
            ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
            : "Choose files to upload"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
          multiple // Allow multiple file uploads
        />
      </label>
      {files.length > 0 && (
        <ul className="text-sm text-gray-600">
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}
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