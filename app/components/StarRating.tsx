import React, { useState } from 'react';

interface StarRatingProps {
  onSubmit: (rating: number, remarks: string, playerId: number, evaluationId: number) => void;
  playerId: number; // Ensure this is defined as a number
  evaluationId: number; // Ensure this is defined as a number
}

const StarRating: React.FC<StarRatingProps> = ({ onSubmit, playerId, evaluationId }) => {
  const [rating, setRating] = useState<number>(0);  
  const [hover, setHover] = useState<number>(0);    
  const [remarks, setRemarks] = useState<string>(''); 

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (remarks.trim() === '') {
      alert('Please provide some remarks');
      return;
    }

    onSubmit(rating, remarks, playerId, evaluationId);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-2">Provide Your Feedback</h3>

      {/* Star Rating */}
      <div className="flex justify-center items-center mb-4">
        {Array.from({ length: 5 }, (_, index) => index + 1).map(star => (
          <svg
            key={star}
            className={`w-10 h-10 cursor-pointer ${star <= (hover || rating) ? 'text-yellow-500' : 'text-gray-300'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
          >
            <path d="M12 .587l3.668 7.431 8.21 1.192-5.938 5.784 1.404 8.189L12 18.897l-7.344 3.866 1.404-8.189L.122 9.21l8.21-1.192L12 .587z" />
          </svg>
        ))}
      </div>

      {/* Remarks Textarea */}
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md mb-4 resize-none"
        rows={4}
        placeholder="Enter your remarks..."
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
      >
        Submit Feedback
      </button>
    </div>
  );
};

export default StarRating;
