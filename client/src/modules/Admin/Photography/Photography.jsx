import React, { useState, useEffect } from 'react';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Image as ImageIcon, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const Photography = () => {
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

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/participants', { withCredentials: true });
        const photographyParticipants = response.data.data.filter(
          (p) =>
            p.competition?.name?.toLowerCase() === 'photography' &&
            Array.isArray(p.upload_path) &&
            p.upload_path.length > 0
        );
        setParticipants(photographyParticipants);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to fetch participants';
        setError(errMsg);
        showToast('error', errMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, []);

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    showToast('error', 'Failed to load image');
  };

  const handleViewImages = (participant) => {
    setPreviewImages(participant.upload_path || []);
    setCurrentImageIndex(0);
    setSelectedParticipant(participant);
    setShowPreviewModal(true);
  };

  const handleNextImage = () => setCurrentImageIndex((prev) => (prev + 1) % previewImages.length);
  const handlePrevImage = () => setCurrentImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);

  const handleOpenMarksModal = (participant) => {
    setSelectedParticipant(participant);
    setMarksInput(participant.total_marks?.toString() || '');
    setShowMarksModal(true);
  };

  const handleMarksChange = (value) => setMarksInput(value);

  const handleSubmitMarks = async () => {
    if (!selectedParticipant) return showToast('error', 'No participant selected');
    const parsedMarks = parseFloat(marksInput);
    if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100)
      return showToast('error', 'Please enter a valid mark between 0 and 100');

    try {
      const response = await axiosInstance.put(
        `/participants/${selectedParticipant._id}`,
        { total_marks: parsedMarks },
        { withCredentials: true }
      );
      setParticipants((prev) =>
        prev.map((p) => (p._id === selectedParticipant._id ? { ...p, total_marks: response.data.data.total_marks } : p))
      );
      showToast('success', 'Marks updated successfully');
      setShowMarksModal(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update marks';
      showToast('error', errMsg);
    }
  };

  const getUploadSlotsInfo = (upload_path) => {
    const used = Array.isArray(upload_path) ? upload_path.length : 0;
    return { usedSlots: used, remainingSlots: maxUploads - used };
  };

  // Download currently displayed image
  const handleDownloadImage = async () => {
    if (!previewImages.length) return showToast('error', 'No image available');
    const imageUrl = previewImages[currentImageIndex];
    const participantName = selectedParticipant?.user?.name || 'Participant';
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = imageUrl.split('.').pop() || 'jpg';
      link.download = `${participantName.replace(/\s+/g, '_')}_photo_${currentImageIndex + 1}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('error', 'Failed to download image');
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Photography Competition Participants</h1>
      {participants.length === 0 ? (
        <p className="text-gray-500">No participants with uploaded photos found.</p>
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
            {participants.map((p) => {
              const { usedSlots, remainingSlots } = getUploadSlotsInfo(p.upload_path);
              return (
                <TableRow key={p._id}>
                  <TableCell>{p.user?.name || 'Unknown User'}</TableCell>
                  <TableCell>{p.user?.phone || 'N/A'}</TableCell>
                  <TableCell>{p.user?.email || 'N/A'}</TableCell>
                  <TableCell>{p.total_marks || 0}</TableCell>
                  <TableCell>{`${usedSlots} used, ${remainingSlots} remaining`}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenMarksModal(p)}>
                        <Edit size={16} className="mr-2" /> Marks
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewImages(p)}
                        disabled={!p.upload_path || p.upload_path.length === 0}
                      >
                        <ImageIcon size={16} className="mr-2" /> View Images
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Image Preview Modal with Download */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal} modal={true}>
        <DialogContent className="p-0 max-w-3xl">
          <DialogHeader className="flex justify-between items-center p-4">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Images for {selectedParticipant?.user?.name || 'Participant'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleDownloadImage} className="flex items-center gap-1">
              <Download size={16} /> Download
            </Button>
          </DialogHeader>
          <div className="relative flex items-center justify-center p-4">
            {previewImages.length > 0 ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4"
                  onClick={handlePrevImage}
                  disabled={previewImages.length <= 1}
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
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            ) : (
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

      {/* Marks Modal */}
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
            <Button onClick={handleSubmitMarks} className="bg-blue-500 text-white hover:bg-blue-600">
              Submit Marks
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Photography;
