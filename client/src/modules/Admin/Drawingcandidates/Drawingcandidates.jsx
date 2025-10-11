import React, { useState, useEffect } from 'react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit } from 'lucide-react'; // Import Edit icon

const DrawingCandidates = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null); // Store participant for dynamic filename and marks
  const [showMarksModal, setShowMarksModal] = useState(false); // State for marks modal
  const [marksInput, setMarksInput] = useState(''); // Store marks input for the modal

  // Fetch participants for the Drawing competition
  useEffect(() => {
    const fetchDrawingParticipants = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/participants', {
          withCredentials: true,
        });

        console.log('Participants API Response:', response.data);

        // Filter participants where competition name is "Drawing" and have an upload_path
        const drawingParticipants = response.data.data.filter(
          (participant) =>
            participant.competition?.name &&
            participant.competition.name.toLowerCase() === 'drawing' &&
            participant.upload_path
        );

        console.log('Filtered Drawing Participants:', drawingParticipants);

        setParticipants(drawingParticipants);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to fetch participants';
        console.error('Error fetching participants:', err);
        setError(errMsg);
        showToast('error', errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDrawingParticipants();
  }, []);

  // Handle image loading errors
  const handleImageError = (e) => {
    console.error('Error loading image:', e.target.src);
    e.target.src = '/images/fallback-image.jpg'; // Replace with your actual fallback image path
  };

  // Open image preview modal with the selected image and participant
  const handleImageClick = (imageUrl, participant) => {
    setPreviewImage(imageUrl);
    setSelectedParticipant(participant);
    setShowPreviewModal(true);
  };

  // Open marks modal and initialize marks input
  const handleOpenMarksModal = (participant) => {
    setSelectedParticipant(participant);
    setMarksInput(participant.total_marks?.toString() || '');
    setShowMarksModal(true);
  };

  // Handle marks input change in modal
  const handleMarksChange = (value) => {
    setMarksInput(value);
  };

  // Submit marks to backend
  const handleSubmitMarks = async () => {
    if (!selectedParticipant) {
      showToast('error', 'No participant selected');
      return;
    }

    const parsedMarks = parseFloat(marksInput);

    // Validate marks
    if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
      showToast('error', 'Please enter a valid mark between 0 and 100');
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/participants/${selectedParticipant._id}`,
        { total_marks: parsedMarks },
        { withCredentials: true }
      );

      // Update participant in state
      setParticipants((prev) =>
        prev.map((p) =>
          p._id === selectedParticipant._id
            ? { ...p, total_marks: response.data.data.total_marks }
            : p
        )
      );

      showToast('success', 'Marks updated successfully');
      setShowMarksModal(false); // Close modal after successful submission
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update marks';
      console.error('Error updating marks:', err);
      showToast('error', errMsg);
    }
  };

  // // Download the image using axios to handle CORS/authenticated requests
  // const handleDownloadImage = async () => {
  //   if (previewImage && selectedParticipant) {
  //     try {
  //       // Fetch the image as a blob
  //       const response = await axiosInstance.get(previewImage, {
  //         responseType: 'blob',
  //         withCredentials: true,
  //       });

  //       // Create a URL for the blob
  //       const url = window.URL.createObjectURL(new Blob([response.data]));

  //       // Determine the filename
  //       const filenameFromUrl = previewImage.split('/').pop() || 'drawing';
  //       const participantName = selectedParticipant.user?.name
  //         ? selectedParticipant.user.name.replace(/\s+/g, '_').toLowerCase()
  //         : 'participant';
  //       const extension = filenameFromUrl.split('.').pop() || 'jpg';
  //       const filename = `${participantName}_drawing.${extension}`;

  //       // Create and trigger the download
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = filename;
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       window.URL.revokeObjectURL(url); // Clean up the blob URL
  //     } catch (err) {
  //       console.error('Error downloading image:', err);
  //       showToast('error', 'Failed to download image');
  //     }
  //   } else {
  //     showToast('error', 'No image available for download');
  //   }
  // };

  if (loading) {
    return <div className="text-center p-4 text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Drawing Competition Participants</h1>
      {participants.length === 0 ? (
        <p className="text-gray-500">No participants with uploaded drawings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((participant) => (
            <div
              key={participant._id}
              className="border rounded-lg p-4 shadow-md flex flex-col items-center bg-white relative"
            >
              {/* Edit icon for marks */}
              <button
                onClick={() => handleOpenMarksModal(participant)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                aria-label="Edit marks"
              >
                <Edit size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">{participant.user?.name || 'Unknown User'}</h2>
              <p className="text-gray-600">Phone: {participant.user?.phone || 'N/A'}</p>
              <p className="text-gray-600">Email: {participant.user?.email || 'N/A'}</p>
              <p className="text-gray-600">Marks: {participant.total_marks || 0}</p>
              <img
                src={participant.upload_path}
                alt={`${participant.user?.name || 'Participant'}'s drawing`}
                className="mt-4 w-full h-48 object-contain rounded-md cursor-pointer"
                onError={handleImageError}
                onClick={() => handleImageClick(participant.upload_path, participant)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal} modal={true}>
        <DialogContent className="p-0">
          <DialogHeader className="flex justify-end p-4">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[70vh] rounded-lg object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  showToast('error', 'Failed to load image');
                }}
              />
            )}
          </div>
          {/* <div className="text-center pb-4">
            <button
              onClick={handleDownloadImage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Download Image
            </button>
          </div> */}
        </DialogContent>
      </Dialog>

      {/* Marks Input Modal */}
      <Dialog open={showMarksModal} onOpenChange={setShowMarksModal} modal={true}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Enter Marks for {selectedParticipant?.user?.name || 'Participant'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <input
              type="number"
              value={marksInput}
              onChange={(e) => handleMarksChange(e.target.value)}
              placeholder="Enter marks (0-100)"
              className="border rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
            <button
              onClick={handleSubmitMarks}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Submit Marks
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrawingCandidates;