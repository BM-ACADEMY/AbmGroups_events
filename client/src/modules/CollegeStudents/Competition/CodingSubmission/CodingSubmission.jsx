import React from 'react';
import { FileCode } from 'lucide-react';

const CodingSubmission = () => {
  return (
    <div className="mt-4">
      <button
        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded transition-colors opacity-50 cursor-not-allowed"
        disabled
      >
        <FileCode size={20} />
        Coding Submission (Not Available)
      </button>
    </div>
  );
};

export default CodingSubmission;