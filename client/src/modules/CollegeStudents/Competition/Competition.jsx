import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/modules/AuthContext/AuthContext';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import LogoUpload from './LogoUpload/LogoUpload';
import MemsUpload from './MemsUpload/MemsUpload';
import SkidUpload from './SkidUpload/SkidUpload';
import CodingSubmission from './CodingSubmission/CodingSubmission';
import PhotographyUpload from './PhotographyUpload/PhotographyUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Competition = () => {
  const { user, loading } = useContext(AuthContext);
  const [myCompetition, setMyCompetition] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const maxUploads = {
    logo: 3,
    memes: 3,
    skid: 3,
    photography: 15,
    coding: 0, // Coding doesn't use uploads
  };

  useEffect(() => {
    const fetchMyCompetition = async () => {
      if (!user) {
        setFetchLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/participants');
        const participants = response.data.data;

        const myParticipant = participants.find(p => p.user && p.user._id === user._id);

        if (myParticipant) {
          const compResponse = await axiosInstance.get(`/competitions/${myParticipant.competition._id}`);
          setMyCompetition({
            ...compResponse.data,
            participantId: myParticipant._id,
            upload_path: Array.isArray(myParticipant.upload_path) ? myParticipant.upload_path : [],
            total_marks: myParticipant.total_marks,
          });
        } else {
          console.log('No matching participant found for user:', user._id);
          setMyCompetition(null);
        }
      } catch (error) {
        console.error('Error fetching participant:', error);
        showToast('error', 'Failed to fetch your competition');
      } finally {
        setFetchLoading(false);
      }
    };

    if (!loading) {
      fetchMyCompetition();
    }
  }, [user, loading]);

  const handleViewImages = (images) => {
    setPreviewImages(images || []);
    setCurrentImageIndex(0);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setPreviewImages([]);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % previewImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  };

  const handleUploadSuccess = (updatedParticipant) => {
    setMyCompetition({
      ...myCompetition,
      upload_path: Array.isArray(updatedParticipant.upload_path) ? updatedParticipant.upload_path : [],
    });
    showToast('success', 'File(s) uploaded successfully');
  };

  const getUploadSlotsInfo = () => {
    if (!myCompetition) return { usedSlots: 0, remainingSlots: 0 };
    const competitionName = myCompetition.name.toLowerCase();
    const max = maxUploads[Object.keys(maxUploads).find(key => competitionName.includes(key))] || 3;
    const usedSlots = Array.isArray(myCompetition.upload_path) ? myCompetition.upload_path.length : 0;
    const remainingSlots = max - usedSlots;
    return { usedSlots, remainingSlots };
  };

  if (loading || fetchLoading) {
    return <div className="text-center p-6 text-gray-600">Loading your competition...</div>;
  }

  if (!user) {
    return <div className="text-center p-6 text-gray-600">Please log in to view your competition.</div>;
  }

  if (!myCompetition) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Your Competition</h1>
        <p className="text-gray-600">
          No competition chosen yet to participate.
        </p>
      </div>
    );
  }

  const renderCompetitionComponent = () => {
    const competitionName = myCompetition.name.toLowerCase();
    if (competitionName.includes('logo')) {
      return (
        <LogoUpload
          participantId={myCompetition.participantId}
          upload_path={myCompetition.upload_path}
          onUploadSuccess={handleUploadSuccess}
        />
      );
    } else if (competitionName.includes('memes')) {
      return (
        <MemsUpload
          participantId={myCompetition.participantId}
          upload_path={myCompetition.upload_path}
          onUploadSuccess={handleUploadSuccess}
        />
      );
    } else if (competitionName.includes('skid')) {
      return (
        <SkidUpload
          participantId={myCompetition.participantId}
          upload_path={myCompetition.upload_path}
          onUploadSuccess={handleUploadSuccess}
        />
      );
    } else if (competitionName.includes('photography')) {
      return (
        <PhotographyUpload
          participantId={myCompetition.participantId}
          upload_path={myCompetition.upload_path}
          onUploadSuccess={handleUploadSuccess}
        />
      );
    } else if (competitionName.includes('coding')) {
      return <CodingSubmission />;
    }
    return null;
  };

  const { usedSlots, remainingSlots } = getUploadSlotsInfo();

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Your Chosen Competition</h1>
      <div className="border rounded-lg p-4 shadow-md max-w-md bg-white">
        <img
          src={myCompetition.competition_image}
          alt={myCompetition.name}
          className="w-full h-48 object-cover rounded mb-4"
          onError={(e) => {
            e.target.style.display = 'none';
            showToast('error', 'Failed to load competition image');
          }}
        />
        <h2 className="text-xl font-semibold mb-2 text-gray-800">{myCompetition.name}</h2>
        <p className="text-gray-600 mb-2">User Type: {myCompetition.role?.name || 'N/A'}</p>
        <p className="text-gray-600 mb-2">Total Marks: {myCompetition.total_marks || 0}</p>
        <p className="text-gray-600 mb-2">Team Based: {myCompetition.is_team_based ? 'Yes' : 'No'}</p>
        <p className="text-gray-600 mb-2">
          Upload Slots: {usedSlots} used, {remainingSlots} remaining
        </p>
        {myCompetition.upload_path.length > 0 && (
          <div className="text-gray-600 mb-4">
            <p>Uploaded File(s):</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewImages(myCompetition.upload_path)}
              className="mt-2"
            >
              View All Files
            </Button>
          </div>
        )}
        {renderCompetitionComponent()}
      </div>
      <Dialog open={showImageModal} onOpenChange={handleCloseModal} modal={true}>
        <DialogContent className="p-0 max-w-3xl">
          <DialogHeader className="flex justify-between items-center p-4">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {myCompetition?.name} Files
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
                  aria-label="Previous file"
                >
                  <ChevronLeft size={24} />
                </Button>
                {myCompetition?.name.toLowerCase().includes('skid') ? (
                  <video
                    src={previewImages[currentImageIndex]}
                    className="max-w-full max-h-[60vh] rounded-lg"
                    controls
                    onError={(e) => {
                      e.target.style.display = 'none';
                      showToast('error', 'Failed to load video');
                    }}
                  />
                ) : (
                  <img
                    src={previewImages[currentImageIndex]}
                    alt={`File ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[60vh] rounded-lg object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      showToast('error', 'Failed to load image');
                    }}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4"
                  onClick={handleNextImage}
                  disabled={previewImages.length <= 1}
                  aria-label="Next file"
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            )}
            {previewImages.length === 0 && (
              <p className="text-gray-500">No files available</p>
            )}
          </div>
          {previewImages.length > 1 && (
            <div className="text-center pb-4">
              <p className="text-gray-600">
                File {currentImageIndex + 1} of {previewImages.length}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Competition;