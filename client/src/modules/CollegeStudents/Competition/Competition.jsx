import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/modules/AuthContext/AuthContext';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import LogoUpload from './LogoUpload/LogoUpload';
import MemsUpload from './MemsUpload/MemsUpload';
import SkidUpload from './SkidUpload/SkidUpload';
import CodingSubmission from './CodingSubmission/CodingSubmission';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Competition = () => {
  const { user, loading } = useContext(AuthContext);
  const [myCompetition, setMyCompetition] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchMyCompetition = async () => {
      if (!user) {
        setFetchLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/participants');
        const participants = response.data.data;

        // Debug: Log participants to inspect data
        console.log('Participants:', participants);

        // Add null check for p.user
        const myParticipant = participants.find(p => p.user && p.user._id === user._id);

        if (myParticipant) {
          const compResponse = await axiosInstance.get(`/competitions/${myParticipant.competition._id}`);
          setMyCompetition({
            ...compResponse.data,
            participantId: myParticipant._id,
            upload_path: myParticipant.upload_path,
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

  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const handleUploadSuccess = (updatedParticipant) => {
    setMyCompetition({
      ...myCompetition,
      upload_path: updatedParticipant.upload_path,
    });
    showToast('success', 'File(s) uploaded successfully');
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
    } else if (competitionName.includes('coding')) {
      return <CodingSubmission />;
    }
    return null;
  };

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
          }}
        />
        <h2 className="text-xl font-semibold mb-2 text-gray-800">{myCompetition.name}</h2>
        <p className="text-gray-600 mb-2">User Type: {myCompetition.role.name}</p>
        <p className="text-gray-600 mb-2">Total Marks: {myCompetition.total_marks}</p>
        <p className="text-gray-600 mb-2">Team Based: {myCompetition.is_team_based ? 'Yes' : 'No'}</p>
        {myCompetition.upload_path && (
          <div className="text-gray-600 mb-4">
            <p>Uploaded File(s):</p>
            {Array.isArray(myCompetition.upload_path) ? (
              myCompetition.upload_path.map((path, index) => (
                <button
                  key={index}
                  onClick={() => handleViewImage(path)}
                  className="text-blue-500 underline hover:text-blue-600 mr-2"
                >
                  View File {index + 1}
                </button>
              ))
            ) : (
              <button
                onClick={() => handleViewImage(myCompetition.upload_path)}
                className="text-blue-500 underline hover:text-blue-600"
              >
                View File
              </button>
            )}
          </div>
        )}
        {renderCompetitionComponent()}
      </div>
      <Dialog open={showImageModal} onOpenChange={handleCloseModal} modal={true}>
        <DialogContent className="p-0">
          <DialogHeader className="flex justify-end p-4">
            <DialogTitle className="sr-only">File Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {selectedImage && (
              myCompetition.name.toLowerCase().includes('skid') ? (
                <video
                  src={selectedImage}
                  className="max-w-full max-h-[80vh] rounded-lg"
                  controls
                  onError={(e) => {
                    e.target.style.display = 'none';
                    showToast('error', 'Failed to load video');
                  }}
                />
              ) : (
                <img
                  src={selectedImage}
                  alt="Uploaded file"
                  className="max-w-full max-h-[80vh] rounded-lg object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    showToast('error', 'Failed to load image');
                  }}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Competition;