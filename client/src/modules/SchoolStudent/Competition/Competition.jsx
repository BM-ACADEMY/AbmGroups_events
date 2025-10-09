import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/modules/AuthContext/AuthContext';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';

const Competition = () => {
  const { user, loading } = useContext(AuthContext);
  const [myCompetition, setMyCompetition] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchMyCompetition = async () => {
      if (!user) {
        setFetchLoading(false);
        return;
      }

      try {
        // Fetch all participants and find the one for this user
        const response = await axiosInstance.get('/participants');
        const participants = response.data.data; // Fixed: response.data.data instead of response.data
        const myParticipant = participants.find(p => p.user._id === user._id);
        
        if (myParticipant) {
          // Fetch full competition details with populated role
          const compResponse = await axiosInstance.get(`/competitions/${myParticipant.competition._id}`);
          setMyCompetition(compResponse.data);
        } else {
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

  if (loading || fetchLoading) {
    return <div>Loading your competition...</div>;
  }

  if (!user) {
    return <div>Please log in to view your competition.</div>;
  }

  if (!myCompetition) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Your Competition</h1>
        <p>No competition chosen yet. <a href="/competitions-list" className="text-blue-500 underline">Choose a competition</a> to participate.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Chosen Competition</h1>
      <div className="border rounded-lg p-4 shadow-md max-w-md">
        <img
          src={myCompetition.competition_image}
          alt={myCompetition.name}
          className="w-full h-48 object-cover rounded mb-4"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <h2 className="text-xl font-semibold mb-2">{myCompetition.name}</h2>
        <p className="text-gray-600 mb-2">User Type: {myCompetition.role.name}</p>
        <p className="text-gray-600 mb-2">Team Based: {myCompetition.is_team_based ? 'Yes' : 'No'}</p>
        <p className="text-gray-600 mb-4">Requires Upload: {myCompetition.requires_upload ? 'Yes' : 'No'}</p>
        {/* Optional: Button to change or view details */}
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => {
            showToast('info', `Viewing details for ${myCompetition.name}`);
            // TODO: Navigate to details or upload page if requires_upload
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default Competition;