import React from 'react';
import Schoolvideo from '@/assets/samplevideo/school.mp4'

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
        Procedure for Participating in the Contest - Sample Video
      </h1>

      <div className="w-full max-w-4xl">
        <video
          className="w-full h-auto rounded-xl shadow-lg border border-gray-200"
          autoPlay
          loop
          muted
          playsInline
          controls
        >
          <source
            src={Schoolvideo}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default Dashboard;
