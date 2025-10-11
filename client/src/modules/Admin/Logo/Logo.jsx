import React, { useState, useEffect } from 'react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const Logo = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [marksInput, setMarksInput] = useState('');

  const maxUploads = 3;

  // Fetch participants for the logo competition
  useEffect(() => {
    const fetchLogoParticipants = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/participants', {
          withCredentials: true,
        });

        console.log('Participants API Response:', response.data);

        const logoParticipants = response.data.data.filter(
          (participant) =>
            participant.competition?.name &&
            participant.competition.name.toLowerCase() === 'logo' &&
            participant.upload_path &&
            Array.isArray(participant.upload_path)
        );

        console.log('Filtered Logo Participants:', logoParticipants);

        setParticipants(logoParticipants);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to fetch participants';
        console.error('Error fetching participants:', err);
        setError(errMsg);
        showToast('error', errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchLogoParticipants();
  }, []);

  // Handle image loading errors
  const handleImageError = (e) => {
    console.error('Error loading image:', e.target.src);
    e.target.style.display = 'none';
    showToast('error', 'Failed to load image');
  };

  // Open image preview modal with all images for the participant
  const handleViewImages = (participant) => {
    setPreviewImages(participant.upload_path || []);
    setCurrentImageIndex(0);
    setSelectedParticipant(participant);
    setShowPreviewModal(true);
  };

  // Navigate to next image
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % previewImages.length);
  };

  // Navigate to previous image
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
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

      setParticipants((prev) =>
        prev.map((p) =>
          p._id === selectedParticipant._id
            ? { ...p, total_marks: response.data.data.total_marks }
            : p
        )
      );

      showToast('success', 'Marks updated successfully');
      setShowMarksModal(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update marks';
      console.error('Error updating marks:', err);
      showToast('error', errMsg);
    }
  };

  // Calculate used and remaining slots
  const getUploadSlotsInfo = (upload_path) => {
    const usedSlots = Array.isArray(upload_path) ? upload_path.length : 0;
    const remainingSlots = maxUploads - usedSlots;
    return { usedSlots, remainingSlots };
  };

  if (loading) {
    return <div className="text-center p-4 text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Logo Competition Participants</h1>
      {participants.length === 0 ? (
        <p className="text-gray-500">No participants with uploaded logos found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Upload Slots</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => {
              const { usedSlots, remainingSlots } = getUploadSlotsInfo(participant.upload_path);
              return (
                <TableRow key={participant._id}>
                  <TableCell>{participant.user?.name || 'Unknown User'}</TableCell>
                  <TableCell>{participant.user?.phone || 'N/A'}</TableCell>
                  <TableCell>{participant.user?.email || 'N/A'}</TableCell>
                  <TableCell>{participant.total_marks || 0}</TableCell>
                  <TableCell>{`${usedSlots} used, ${remainingSlots} remaining`}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenMarksModal(participant)}
                        aria-label="Edit marks"
                      >
                        <Edit size={16} className="mr-2" />
                        Marks
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewImages(participant)}
                        disabled={!participant.upload_path || participant.upload_path.length === 0}
                        aria-label="View images"
                      >
                        <ImageIcon size={16} className="mr-2" />
                        View Images
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Image Preview Modal with Navigation */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal} modal={true}>
        <DialogContent className="p-0 max-w-3xl">
          <DialogHeader className="flex justify-between items-center p-4">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Images for {selectedParticipant?.user?.name || 'Participant'}
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex items-center justify-center p-4">
            {previewImages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4"
                  onClick={handlePrevImage}
                  disabled={previewImages.length <= 1}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </Button>
                <img
                  src={previewImages[currentImageIndex]}
                  alt={`Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[60vh] rounded-lg object-contain"
                  onError={handleImageError}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4"
                  onClick={handleNextImage}
                  disabled={previewImages.length <= 1}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            )}
            {previewImages.length === 0 && (
              <p className="text-gray-500">No images available</p>
            )}
          </div>
          {previewImages.length > 1 && (
            <div className="text-center pb-4">
              <p className="text-gray-600">
                Image {currentImageIndex + 1} of {previewImages.length}
              </p>
            </div>
          )}
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
            <Button
              onClick={handleSubmitMarks}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Submit Marks
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Logo;