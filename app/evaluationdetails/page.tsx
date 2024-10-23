"use client";
import React, { useEffect, useState } from 'react';
import EvaluationForm from '../components/coach/EvaluationForm';
import { Evaluation } from '../types/types';
import { format } from 'date-fns';
import Image from 'next/image';
import Loading from '../components/Loading';
import { getSession } from 'next-auth/react';
import StarRating from '../components/StarRating';

type EvaluationPageProps = {
    searchParams: {
        evaluationId: string; // Assuming evaluationId is a string
    };
};

const EvaluationPage: React.FC<EvaluationPageProps> = ({ searchParams }) => {
    const { evaluationId } = searchParams; // Get evaluationId from searchParams
    const [evaluationData, setEvaluationData] = useState<Evaluation | null>(null); // State to store evaluation data
    const [error, setError] = useState<string | null>(null); // State to handle errors
    const [physicalScores, setPhysicalScores] = useState<any[]>([]);
    const [tacticalScores, setTacticalScores] = useState<any[]>([]);
    const [technicalScores, setTechnicalScores] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userType, setUserType] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<number>(0);

    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [remarks, setRemarks] = useState<string>('');
    const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

    const formattedDate = evaluationData?.created_at ? format(new Date(evaluationData.created_at), 'MM/dd/yyyy') : '';

    const handleSubmitRating = async () => {
        try {
            const response = await fetch('/api/submitRating', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ evaluationId, rating, remarks, playerId }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit rating');
            }

            setIsRatingSubmitted(true);
        } catch (error) {
            console.error('Error submitting rating:', error);
            // Handle error, e.g., show an error message
        }
    }

    const fetchEvaluationData = async () => {
        const session = await getSession();
        if (session) {
            setUserType(session.user.type);
            setPlayerId(Number(session.user.id)); // Assuming 'role' is stored in session
        }
        try {
            const response = await fetch(`/api/evaluationdetails?evaluationId=${evaluationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                setLoading(false);
                throw new Error('Failed to fetch evaluation data');
            }

            const data = await response.json();
setEvaluationData(data.result as Evaluation); // Type assertion here
setPhysicalScores(JSON.parse(data.result.physicalScores));
setTacticalScores(JSON.parse(data.result.tacticalScores));
setTechnicalScores(JSON.parse(data.result.technicalScores));
setLoading(false);
            // Set the fetched evaluation data
        } catch (error) {
            console.error('Error fetching evaluation data:', error);
            setError('Failed to fetch evaluation data'); // Set error message
        }
    };
    useEffect(() => {

        fetchEvaluationData();
    }, []); // Dependency array includes evaluationId
    if (loading) {
        return <Loading />; // Loading indicator
    }
    return (
        <>


            <div className="p-6 border border-gray-300 rounded-lg font-sans">
                {/* Evaluation Form Header - Full Width */}
                <div className="w-full mb-0">
                    <div className="bg-white p-6 border border-gray-300 rounded-lg">
                        <div className="flex justify-between border-b border-gray-300 pb-3 mb-0 flex-wrap">
                            <h2 className="text-xl font-bold">Evaluation Form</h2>
                            <div className="flex flex-col items-end">
                                <span className="bg-cyan-100 text-teal-800 px-3 py-1 rounded mb-2">Completed</span>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Player Information and Key Information - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Player Information */}
                    <div className="bg-white p-6 border border-gray-300 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">{evaluationData?.review_title}</h3>
                        <div className="flex items-center mb-4">
                            <strong className="mr-2">Player:</strong>
                            {evaluationData?.image ? (
                                <Image
                                    src={evaluationData.image} // image is guaranteed to be a string here
                                    alt="Player Avatar"
                                    width={30}
                                    height={30}
                                />
                            ) : (
                                <div>No Image Available</div> // Placeholder or alternative content
                            )}
                            <span className="text-gray-700">{evaluationData?.first_name} {evaluationData?.last_name}</span>
                            <span className="ml-2 text-gray-500">{evaluationData?.position}, {evaluationData?.team} #{evaluationData?.number}</span>
                        </div>



                        <div className="mb-4">
                            <strong className="mr-2">Date Requested:</strong> <span>{formattedDate}</span>
                        </div>

                        <div className="mb-4">
                            <strong className="mr-2">Primary link:</strong> <a href={evaluationData?.primary_video_link} className="text-blue-500" target='_blank'>Link to video</a>
                        </div>
                        <div className="mb-4">
                            <strong className="mr-2">Video link Two:</strong> <a href={evaluationData?.video_link_two} className="text-blue-500" target='_blank'>Link to video</a>
                        </div>
                        <div className="mb-4">
                            <strong className="mr-2">Video  link Three :</strong> <a href={evaluationData?.video_link_three
                            } className="text-blue-500" target='_blank'>Link to video</a>
                        </div>

                        <div className="mb-4">
                            <strong className="mr-2">Video description:</strong>
                            <span className="text-gray-700">{evaluationData?.video_description}</span>
                        </div>
                    </div>

                    {/* Key Information */}
                    <div className="bg-white p-6 border border-gray-300 rounded-lg">
                        <h4 className="text-lg font-semibold mb-3">Key</h4>
                        <ul className="list-none space-y-2">
                            <li>[1] Needs significant improvement</li>
                            <li>[2] Needs improvement</li>
                            <li>[3] At competition level</li>
                            <li>[4] Above competition level</li>
                            <li>[5] Exceeds competition level</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {/* Technical Section */}
                    <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                        <h1 className='text-xl mb-4'>Technical </h1>
                        {technicalScores ? (
                            <ul className="list-disc ml-5">
                                {Object.entries(technicalScores).map(([key, value]) => (
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No Technical scores available.</p>
                        )}
                        <label htmlFor={`remarks-tech`} className="mt-4 text-sm font-medium">Remarks:</label>
                        {evaluationData?.technicalRemarks}
                    </div>

                    {/* Tactical Section */}
                    <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                        <h2 className='text-xl mb-4'>Tactical</h2>
                        {tacticalScores ? (
                            <ul className="list-disc ml-5">
                                {Object.entries(tacticalScores).map(([key, value]) => (
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No Tactical scores available.</p>
                        )}
                        <label htmlFor={`remarks-tact`} className="mt-4 text-sm font-medium">Remarks:</label>
                        {evaluationData?.tacticalRemarks}
                    </div>

                    {/* Physical Section */}
                    <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                        <h3 className='text-xl mb-4'>Physical</h3>
                        {physicalScores ? (
                            <ul className="list-disc ml-5">
                                {Object.entries(physicalScores).map(([key, value]) => (
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No physical scores available.</p>
                        )}
                        <label htmlFor={`remarks-phys`} className="mt-4 text-sm font-medium">Remarks:</label>
                        {evaluationData?.physicalRemarks}
                    </div>
                </div>

                {/* Final Remarks Section */}
                <div className="mt-6 text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <label htmlFor="final-remarks" className="text-sm font-medium">Final Remarks:</label>
                    {evaluationData?.finalRemarks}{evaluationData?.rating}
                </div>

               {userType === 'player' && !isRatingSubmitted && evaluationData?.rating === null && (  

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
                            onClick={handleSubmitRating}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                        >
                            Submit Feedback
                        </button>
                    </div>

               )}  

                {userType === 'player' && isRatingSubmitted && (

                    <div className="p-4 bg-white shadow-md rounded-md max-w-md mx-auto">
                        <h3 className="text-lg font-semibold mb-2">Thanks for Your Feedback</h3>

                    </div>

                )}
            </div>



        </>
    );
};

export default EvaluationPage;
