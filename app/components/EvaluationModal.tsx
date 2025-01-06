// File: components/EvaluationModal.tsx

"use client"; // Ensure this is a client component
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Swal from 'sweetalert2';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
interface Kids {
  id: string;
  first_name: string;
  last_name: string;
}
interface EvaluationModalProps {
  onClose: () => void;
  isOpen: boolean;
  coachId: string | null;
  playerId: string | null;
  amount: number | null;
  coachClubId?: number;
  playerClubId?: number;
  kids?: Kids[];
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ isOpen, onClose, coachId, playerId, amount, coachClubId, playerClubId,kids }) => {
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [primaryVideoUrl, setPrimaryVideoUrl] = useState<string>('');
  const [videoUrl2, setVideoUrl2] = useState<string>('');
  const [turnaroundTime, setTurnaroundTime] = useState<string>('');
  const [videoUrl3, setVideoUrl3] = useState<string>('');
  const [videoDescription, setVideoDescription] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [evaluationCharges, setEvaluationCharges] = useState(null);
  const [userType, setUserType]=useState('Myself');
  const [child, setChild]=useState<string>('');
  const [currency, setCurrency]=useState<string>('usd');



  const validateUrl = (url: string): boolean => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' +
      '((([a-zA-Z0-9$_.+!*\'(),;?&=-]+)@)?' +
      '(([a-zA-Z0-9.-]+)\\.' +
      '([a-zA-Z]{2,}))|' +
      '(\\d{1,3}\\.){3}\\d{1,3}|' +
      '\\[([a-fA-F0-9:]+)\\])' +
      '(\\:\\d+)?' +
      '(\\/[-a-zA-Z0-9%_.~+@]*)*' +
      '(\\?[-a-zA-Z0-9%_.~+=]*)?' +
      '(#[-a-zA-Z0-9%_.~+=]*)?$',
      'i'
    );
    return urlPattern.test(url);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Reset errors

    const newErrors: { [key: string]: string } = {};
    if (!reviewTitle) newErrors.reviewTitle = 'Review Title is required.';
    if (playerClubId === 0) {
      if (!turnaroundTime) newErrors.turnaroundTime = 'Turnaround Time is required.';
    }

    if (!primaryVideoUrl) newErrors.primaryVideoUrl = 'Primary Video URL is required.';
    if (!videoDescription) newErrors.videoDescription = 'Video Description is required.';

    if (primaryVideoUrl && !validateUrl(primaryVideoUrl)) {
      newErrors.primaryVideoUrl = 'Primary Video URL is not valid. Please provide a valid URL.';
    }
    if (videoUrl2 && !validateUrl(videoUrl2)) {
      newErrors.videoUrl2 = 'Video URL #2 is not valid. Please provide a valid URL.';
    }
    if (videoUrl3 && !validateUrl(videoUrl3)) {
      newErrors.videoUrl3 = 'Video URL #3 is not valid. Please provide a valid URL.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    let status;
    if (playerClubId != coachClubId) {
      status = 'Pending';
    }
    else {
      status = 'Paid';
    }
     
    try {
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewTitle,
          primaryVideoUrl,
          videoUrl2,
          videoUrl3,
          videoDescription,
          coachId,
          playerId,
          turnaroundTime,
          status,
          userType,
          child
        }),
      });

      if (!response.ok) {
        const data=await response.json();
        Swal.fire({
          title: 'Error!',
          text: data.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }

      if (playerClubId != coachClubId) {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe is not loaded');
        }

        const evaluationReponse = await response.json();
let paidBy;
        if (child) {
          paidBy = evaluationReponse.result[0].parent_id; // Use '=' for assignment
      } else {
        paidBy =evaluationReponse.result[0].player_id;
      }
      const payload={
        evaluationId: evaluationReponse.result[0].id,
        coachId: evaluationReponse.result[0].coach_id,
        playerId: paidBy,
        amount: evaluationCharges && evaluationCharges > 0 ? evaluationCharges : amount,
        currency:currency
      };

      // console.log(payload);
      // return;
        const paymentResponse = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const session = await paymentResponse.json();
        const result = await stripe.redirectToCheckout({ sessionId: session.id });

        if (result.error) {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unable to make payment right now',
            confirmButtonText: 'Proceed',
          });
        }

        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Evaluation submitted successfully. You will now be redirected for payment.',
          confirmButtonText: 'Proceed',
        });


        window.location.href = '/dashboard';
      }
      else {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Evaluation submitted successfully.',
          confirmButtonText: 'Proceed',
        });
        onClose();
      }

    } catch (err: any) {
      ///setErrors({ general: err.message || 'An error occurred during submission.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationCharges = async (time: any) => {
    try {
      const response = await fetch('/api/coach/checkcharges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Ensure the content type is JSON
        },
        body: JSON.stringify({ turnaroundime: time,coach_id:coachId }), // Sending the time as JSON in the body
      });
  
      const data = await response.json();
      setEvaluationCharges(data.amount); // Assuming the API returns { charges }
      setCurrency(data.currency); // Assuming the API returns { charges }
    } catch (error) {
      console.error('Error fetching evaluation charges:', error);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-3 text-center">Request Evaluation</h2>

        {errors.general && <p className="text-red-500 text-xs mb-4">{errors.general}</p>}
        {loading ? (
      // Show spinner when loading is true
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex">
            <div className="mb-4 w-1/2 ml-1">
              <label htmlFor="reviewTitle" className="block text-gray-700 mb-1">
               Evaluation For?

              </label>
              <select name='userType' value={userType}
                  onChange={(e) => {
                    setUserType(e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-md`}>
                  
                  <option value='Myself'>Myself</option>
                  <option value='Child'>Add on Player</option>
                 
                </select>
              
            </div>
            {userType === 'Child' && (
              <div className="mb-4 w-1/2 ml-1">
                <label htmlFor="reviewTitle" className="block text-gray-700 mb-1">
                 Select Add on Player
                </label>
                <select name='child' value={child}
                  onChange={(e) => {
                    setChild(e.target.value);
                    
                  }}
                  className={`w-full px-3 py-2 border rounded-md`}>
                  <option value=''>Select Player</option>
                  {kids?.map((kid:any)=>{
                    return(
                      <option key={kid.id} value={kid.id}>{kid.first_name} {kid.last_name}</option>
                    )
                  })}
                  
                
                </select>
                {errors.turnaroundTime && <p className="text-red-500 text-xs">{errors.turnaroundTime}</p>}
              </div>
            )}
           
          </div>
          <div className="flex">
            <div className="mb-4 w-3/4 ml-1">
              <label htmlFor="reviewTitle" className="block text-gray-700 mb-1">
                Review Title

              </label>
              <input
                type="text"
                id="reviewTitle"
                placeholder="Team name vs Team name on mm/dd/yyyy"
                className={`w-full px-3 py-2 border ${errors.reviewTitle ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                value={reviewTitle}
                onChange={(e) => {
                  setReviewTitle(e.target.value);
                  if (errors.reviewTitle) {
                    const { reviewTitle, ...remainingErrors } = errors;
                    setErrors(remainingErrors);
                  }
                }}
              />
              {errors.reviewTitle && <p className="text-red-500 text-xs">{errors.reviewTitle}</p>}
            </div>
            {playerClubId === 0 && (
              <div className="mb-4 w-1/4 ml-1">
                <label htmlFor="reviewTitle" className="block text-gray-700 mb-1">
                  Turnaround Time
                </label>
                <select name='turnaroundtime' value={turnaroundTime}
                 onChange={(e) => {
                  const value = e.target.value;
                  setTurnaroundTime(value);
        
                  // Fetch evaluation charges on change
                  fetchEvaluationCharges(value);
        
                  if (errors.turnaroundTime) {
                    const { turnaroundTime, ...remainingErrors } = errors;
                    setErrors(remainingErrors);
                  }
                }}
                  className={`w-full px-3 py-2 border ${errors.turnaroundTime ? 'border-red-500' : 'border-gray-300'} rounded-md`}>
                  <option value=''>Turnaround Time</option>
                  <option value='24'>24 Hours</option>
                  <option value='48'>48 Hours</option>
                  <option value='72'>72 Hours</option>
                  <option value='96'>96 Hours</option>
                  <option value='120'>120 Hours</option>
                </select>
                {errors.turnaroundTime && <p className="text-red-500 text-xs">{errors.turnaroundTime}</p>}
              </div>
            )}
          </div>
          {evaluationCharges && evaluationCharges > 0 ? (
  <div className="mb-4 text-red-500">
    Evaluation charges for this Turnaround time is <b>{currency} {evaluationCharges}</b>
  </div>
) : (
 <></>
)}
        
          <div className="mb-4">
            {/* Primary Video URL */}
            <label htmlFor="primaryVideoUrl" className="block text-gray-700 mb-1">
              Primary Video Link/URL
            </label>
            <input
              type="url"
              id="primaryVideoUrl"
              placeholder="Do not just submit highlights as the low light and activity without the ball are important."
              className={`w-full px-3 py-2 border ${errors.primaryVideoUrl ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              value={primaryVideoUrl}
              onChange={(e) => {
                setPrimaryVideoUrl(e.target.value);
                if (errors.primaryVideoUrl) {
                  const { primaryVideoUrl, ...remainingErrors } = errors;
                  setErrors(remainingErrors);
                }
              }}
            />
            <p className="text-xs text-gray-500"> If you want feedback on a Trace video, download the file from Trace, upload to Google Drive,
              and share that link here for the coach. For Veo, ensure the match is set to public in order to share the
              link.  If you continue to have technical difficulties, email us at <a href='mailto: team@d1notes.com' className="text-xs text-gray-900">team@d1notes.com</a> .</p>
            {errors.primaryVideoUrl && <p className="text-red-500 text-xs">{errors.primaryVideoUrl}</p>}
          </div>

          <div className="flex">
            <div className="w-1/2 mr-1">
              <label htmlFor="videoUrl2" className="block text-gray-700 mb-1">
                Video Link/URL #2 (Optional)
              </label>
              <input
                type="url"
                id="videoUrl2"
                placeholder="www.exampleurl.com"
                className={`w-full px-3 py-2 border ${errors.videoUrl2 ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                value={videoUrl2}
                onChange={(e) => {
                  setVideoUrl2(e.target.value);
                  if (errors.videoUrl2) {
                    const { videoUrl2, ...remainingErrors } = errors;
                    setErrors(remainingErrors);
                  }
                }}
              />

              {errors.videoUrl2 && <p className="text-red-500 text-xs">{errors.videoUrl2}</p>}
            </div>

            {/* Video URL #3 */}
            <div className="w-1/2 ml-1">
              <label htmlFor="videoUrl3" className="block text-gray-700 mb-1">
                Video Link/URL #3 (Optional)
              </label>
              <input
                type="url"
                id="videoUrl3"
                placeholder="www.exampleurl.com"
                className={`w-full px-3 py-2 border ${errors.videoUrl3 ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                value={videoUrl3}
                onChange={(e) => {
                  setVideoUrl3(e.target.value);
                  if (errors.videoUrl3) {
                    const { videoUrl3, ...remainingErrors } = errors;
                    setErrors(remainingErrors);
                  }
                }}
              />
              {errors.videoUrl3 && <p className="text-red-500 text-xs">{errors.videoUrl3}</p>}
            </div>
          </div>

          {/* Video Description */}
          <div className="mb-4">
            <label htmlFor="videoDescription" className="block text-gray-700 mb-1">
              Video Description
            </label>
            <textarea
              id="videoDescription"
              placeholder="Describe the key elements of the video..."
              className={`w-full px-3 py-2 border ${errors.videoDescription ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              value={videoDescription}
              onChange={(e) => {
                setVideoDescription(e.target.value);
                if (errors.videoDescription) {
                  const { videoDescription, ...remainingErrors } = errors;
                  setErrors(remainingErrors);
                }
              }}
            />
            <p className="text-xs text-gray-500">Provide a brief description of the video you are submitting, including if you are starting the first and/ or
              second halves, position(s) played in each half, jersey color and #, opposing team info and any other
              specific info you would like the coach to be aware of, such as, team’s style of play, areas to focus on,
              external factors, etc.</p>
            {errors.videoDescription && <p className="text-red-500 text-xs">{errors.videoDescription}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
    )}
      </div>
    </div>
  );
};

export default EvaluationModal;
