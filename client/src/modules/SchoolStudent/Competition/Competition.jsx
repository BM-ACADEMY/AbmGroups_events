import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/modules/AuthContext/AuthContext';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';
import DrawingUpload from './DrawingUpload';
import QuizTest from './QuizTest';
import { Upload, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Competition = () => {
  const { user, loading } = useContext(AuthContext);
  const [myCompetition, setMyCompetition] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showDrawingUpload, setShowDrawingUpload] = useState(false);
  const [showQuizTest, setShowQuizTest] = useState(false);
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
        const participants = response.data.data || [];
        
        const myParticipant = participants.find(p => 
          p && 
          p.user && 
          p.user._id && 
          p.user._id === user._id
        );

        if (myParticipant && myParticipant.competition && myParticipant.competition._id) {
          const compResponse = await axiosInstance.get(`/competitions/${myParticipant.competition._id}`);
          setMyCompetition({
            ...compResponse.data,
            participantId: myParticipant._id,
            upload_path: myParticipant.upload_path || [], // Ensure upload_path is always an array
            total_marks: myParticipant.total_marks,
          });
        } else {
          setMyCompetition(null);
        }
      } catch (error) {
        console.error('Error fetching participant:', error);
        showToast('error', 'Failed to fetch your competition');
        setMyCompetition(null);
      } finally {
        setFetchLoading(false);
      }
    };

    if (!loading) {
      fetchMyCompetition();
    }
  }, [user, loading]);

  const handleDrawingUploadClick = () => {
    setShowDrawingUpload(true);
    setShowQuizTest(false);
  };

  const handleQuizTestClick = () => {
    setShowQuizTest(true);
    setShowDrawingUpload(false);
  };

  const handleUploadSuccess = (updatedParticipant) => {
    setMyCompetition({
      ...myCompetition,
      upload_path: updatedParticipant.upload_path || [], // Ensure upload_path is always an array
    });
    setShowDrawingUpload(false);
    showToast('success', 'Drawing uploaded successfully');
  };

  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
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
        {myCompetition.upload_path?.length > 0 && (
          <p className="text-gray-600 mb-4">
            Uploaded Drawing:{' '}
            {myCompetition.upload_path.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => handleViewImage(imageUrl)}
                className="text-blue-500 underline hover:text-blue-600 mr-2"
              >
                View {index + 1}
              </button>
            ))}
          </p>
        )}
        <div className="flex gap-2">
          {myCompetition.name.toLowerCase().includes('drawing') && (
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded text-white transition-colors ${
                myCompetition.upload_path?.length > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={handleDrawingUploadClick}
              disabled={myCompetition.upload_path?.length > 0}
            >
              <Upload size={20} />
              Upload Drawing
            </button>
          )}
          {myCompetition.name.toLowerCase().includes('quiz') && (
            <button
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              onClick={handleQuizTestClick}
            >
              <FileText size={20} />
              Take Quiz
            </button>
          )}
        </div>
      </div>

      {showDrawingUpload && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <DrawingUpload
              participantId={myCompetition.participantId}
              onClose={() => setShowDrawingUpload(false)}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      )}
      {showQuizTest && (
        <QuizTest competitionId={myCompetition._id} onClose={() => setShowQuizTest(false)} />
      )}
      <Dialog open={showImageModal} onOpenChange={handleCloseModal} modal={true}>
        <DialogContent className="p-0">
          <DialogHeader className="flex justify-end p-4">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Uploaded drawing"
                className="max-w-full max-h-[80vh] rounded-lg object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  showToast("error", "Failed to load image");
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Competition;