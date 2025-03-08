"use client";
import React, { useEffect, useState, useRef } from 'react';
import EvaluationForm from '../components/coach/EvaluationForm';
import { Evaluation } from '../types/types';
import { format } from 'date-fns';
import Image from 'next/image';
import Loading from '../components/Loading';
import { getSession } from 'next-auth/react';
import StarRating from '../components/StarRating';
import defaultImage from '../../public/default.jpg'
import { FaFacebook, FaFileAlt, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { showError } from '../components/Toastr';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
    const [organizationScores, setOrganizationScores] = useState<any[]>([]);
    const [distributionScores, setDistributionScores] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userType, setUserType] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<number>(0);

    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [remarks, setRemarks] = useState<string>('');
    const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

    const formattedDate = evaluationData?.updated_at ? format(new Date(evaluationData.updated_at), 'MM/dd/yyyy') : '';

    const pdfRef = useRef<HTMLDivElement>(null);

    const downloadPDF = async () => {
      if (!pdfRef.current) return;
      const canvas = await html2canvas(pdfRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("download.pdf");
    };
    const handleSubmitRating = async () => {
        if(rating<=0)
        {
            showError("Please select rating");
            return
        }
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
setOrganizationScores(JSON.parse(data.result.organizationScores));
setDistributionScores(JSON.parse(data.result.distributionScores));
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
            <button onClick={downloadPDF} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Download PDF
      </button>
                </div>
                <div ref={pdfRef}> 
            <div className="p-6 border border-gray-300 rounded-lg font-sans" >
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Player Information */}
                    <div className="bg-white p-6 border border-gray-300 rounded-lg md:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">{evaluationData?.review_title}</h3>
                        <div className="flex items-center mb-4">
                            <strong className="mr-2">Player:</strong>
                            {evaluationData?.image && evaluationData?.image !== 'null' && (
  <Image
    src={evaluationData?.image}
    alt="Player Avatar"
                    className='w-12 h-12 mr-3 rounded-full object-cover'
                    width={30}
                    height={30}
  />
)}
{(!evaluationData?.image || evaluationData?.image === 'null') && (
  <Image
    src={defaultImage}
    alt="Player Avatar"
    className='w-12 h-12 mr-3 rounded-full object-cover'
    width={30}
    height={30}
  />
)}
                            <span className="text-gray-700">
                                <a href={`/players/${evaluationData?.playerSlug}`} className='text-blue-700' target='_blank'>{evaluationData?.first_name} {evaluationData?.last_name}</a></span>
                             
                        </div>

                        <div className="flex items-center mb-4">
                            <strong className="mr-2">Coach:</strong>
                            {evaluationData?.coachimage && evaluationData?.coachimage !== 'null' && (
  <Image
    src={evaluationData?.coachimage}
    alt="Player Avatar"
                    className='w-12 h-12 mr-3 rounded-full object-cover'
                    width={30}
                    height={30}
  />
)}
{(!evaluationData?.coachimage || evaluationData?.coachimage === 'null') && (
  <Image
    src={defaultImage}
    alt="Player Avatar"
    className='w-12 h-12 mr-3 rounded-full object-cover'
    width={30}
    height={30}
  />
)}
                            <span className="text-gray-700">
                                <a href={`/coach/${evaluationData?.coachSlug}`} className='text-blue-700' target='_blank'>{evaluationData?.coachFirstName} {evaluationData?.coachLastName}</a></span>
                             
                        </div>

                        <div className="mb-4">
                            <strong className="mr-2">Date Completed:</strong> <span>{formattedDate}</span> 
                        </div>
                        {evaluationData?.document && (
                        <div className="mb-4 flex items-center space-x-2">
  <strong>View / Download Additional Document:</strong> 
  <a className="text-[15px] text-blue-700  flex items-center space-x-1" target='_blank' href={evaluationData?.document}>
    <FaFileAlt />
    <span>Download</span>
  </a>
</div>
)}


                        <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
  <legend className="text-lg font-semibold text-gray-700">Video 1</legend>
                                    <div className="mb-4"> 
                                        <strong className="mr-2">Link:</strong> <a href={evaluationData?.primary_video_link} className="text-blue-500" target='_blank'>Link to video</a> <span className="mx-2">|</span> 
                                        <strong>Length:</strong> {evaluationData?.videoOneTiming} min.
                                        <span className="mx-2">|</span>
                                         <strong>Jersey Color:</strong> {evaluationData?.jerseyColorOne} 
                                         <span className="mx-2">|</span>
                                         <strong>Jersey Number:</strong> {evaluationData?.jerseyNumber} <span className="mx-2">|</span>
                                         <strong>Position(s):</strong> {evaluationData?.positionOne}
                                    </div>
                                    <div className="mb-4">
<strong>Description: </strong>{evaluationData?.video_description}
                                        </div>
                                    </fieldset>
                                    
                                    {evaluationData?.video_link_two && (
                                        <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
  <legend className="text-lg font-semibold text-gray-700">Video 2</legend>
                                   
  <div className="mb-4"> 
                                        <strong className="mr-2">Link:</strong> <a href={evaluationData?.video_link_two} className="text-blue-500" target='_blank'>Link to video</a> <span className="mx-2">|</span> 
                                        <strong>Length:</strong> {evaluationData?.videoTwoTiming} min.
                                        <span className="mx-2">|</span>
                                         <strong>Jersey Color:</strong> {evaluationData?.jerseyColorTwo} 
                                         <span className="mx-2">|</span>
                                         <strong>Jersey Number:</strong> {evaluationData?.jerseyNumberTwo} <span className="mx-2">|</span>
                                         <strong>Position:</strong> {evaluationData?.positionTwo}
                                    </div>
                                    
                                    <div className="mb-4">
<strong>Description: </strong>{evaluationData?.video_descriptionTwo}
                                        </div>
                                    </fieldset>
                                     )}
                                    {evaluationData?.video_link_three && (
                                        <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
  <legend className="text-lg font-semibold text-gray-700">Video 3</legend>
                                   
  <div className="mb-4"> 
                                        <strong className="mr-2">Link:</strong> <a href={evaluationData?.video_link_three} className="text-blue-500" target='_blank'>Link to video</a> <span className="mx-2">|</span> 
                                        <strong>Length:</strong> {evaluationData?.videoThreeTiming} min.
                                        <span className="mx-2">|</span>
                                         <strong>Jersey Color:</strong> {evaluationData?.jerseyColorThree} 
                                         <span className="mx-2">|</span>
                                         <strong>Jersey Number:</strong> {evaluationData?.jerseyNumberThree} <span className="mx-2">|</span>
                                         <strong>Position:</strong> {evaluationData?.positionThree}
                                    </div>
                                    <div className="mb-4">
<strong>Description: </strong>{evaluationData?.video_descriptionThree}
                                        </div>
                                  

                                    </fieldset>
                                     )}
                    </div>

                    {/* Key Information */}
                    <div className="bg-white p-6 border border-gray-300 rounded-lg md:col-span-1">
                        <h4 className="text-lg font-semibold mb-3">Key</h4>
                        <ul className="list-none space-y-2">
                        <li>[1] Significantly below competition level – Needs major improvement</li>
                                        <li>[2] Far below competition level – Needs substantial improvement</li>
                                        <li>[3] Below competition level – Needs improvement</li>
                                        <li>[4] Slightly below competition level – Shows potential but needs significant work</li>
                                        <li>[5] Approaching competition level – Almost there but still inconsistent</li>
                                        <li>[6] At competition level – Meets standard expectations</li>
                                        <li>[7] Slightly above competition level – Consistently performs well</li>
                                        <li>[8] Above competition level – Strong competitor</li>
                                        <li>[9] Highly above competition level – Among the top performers</li>
                                        <li>[10] Elite competition level – Exceptional, top-tier performance</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="p-6">
            <div className={`grid grid-cols-1 ${evaluationData?.position.toString() === 'Goalkeeper' ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-4 mt-6`}>
                    {/* Technical Section */}
                    <div className="text-black p-4 border  border-gray-300 rounded-md flex flex-col">
                        <h1 className='text-xl mb-4'>Technical </h1>
                        {technicalScores ? (
                            <ul className="list-disc ml-5 h-[350px]">
                                {Object.entries(technicalScores).map(([key, value]) => (
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No Technical scores available.</p>
                        )}
                        <label htmlFor={`remarks-tech`} className="mt-4 text-sm font-medium">Comments:</label>
                        {evaluationData?.technicalRemarks}
                    </div>

                    {/* Tactical Section */}
                    <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                        <h2 className='text-xl mb-4'>Tactical</h2>
                        {tacticalScores ? (
                            <ul className="list-disc ml-5  h-[350px]">
                                {Object.entries(tacticalScores).map(([key, value]) => (
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No Tactical scores available.</p>
                        )}
                        <label htmlFor={`remarks-tact`} className="mt-4 text-sm font-medium">Comments:</label>
                        {evaluationData?.tacticalRemarks}
                    </div>

{evaluationData?.position.toString() === 'Goalkeeper' &&(
                    <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                        <h3 className='text-xl mb-4'>Distribution</h3>
                        {distributionScores ? (
                            <ul className="list-disc ml-5  h-[350px]">
                                {Object.entries(distributionScores).map(([key, value]) => (
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No Distribution scores available.</p>
                        )}
                        <label htmlFor={`remarks-phys`} className="mt-4 text-sm font-medium">Comnents:</label>
                        {evaluationData?.distributionRemarks
                        }
                    </div>
)}
                    <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                        <h3 className='text-xl mb-4'>Physical</h3>
                        {physicalScores ? (
                            <ul className="list-disc ml-5  h-[350px]">
                                {Object.entries(physicalScores).map(([key, value]) => (
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No physical scores available.</p>
                        )}
                        <label htmlFor={`remarks-phys`} className="mt-4 text-sm font-medium">Comments:</label>
                        {evaluationData?.physicalRemarks}
                    </div>

                   {evaluationData?.position.toString() === 'Goalkeeper' && (
                    <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                        <h3 className='text-xl mb-4'>Organization</h3>
                        {organizationScores ? (
                            <ul className="list-disc ml-5  h-[350px]">
                                {Object.entries(organizationScores).map(([key, value]) => (
                                    <li key={key}>
                                        {key}: {value}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No Organization scores available.</p>
                        )}
                        <label htmlFor={`remarks-phys`} className="mt-4 text-sm font-medium">Comments:</label>
                        {evaluationData?.organizationalRemarks
                        }
                    </div>
                   )}
                </div>

               
                {/* Final Remarks Section */}
                <div className="mt-6 text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <label htmlFor="final-remarks" className="text-sm font-medium">Additional Comments:</label>
                    {evaluationData?.finalRemarks} 
                </div>

                <div className="mt-6 text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <label htmlFor="final-remarks" className="text-sm font-medium">Things to Work On:</label>
                    {evaluationData?.thingsToWork} 
                </div>
               
               {userType === 'player' && !isRatingSubmitted && evaluationData?.rating === null && (  

                    <div className="p-4 bg-white shadow-md rounded-md max-w-md mx-auto">
                        <h3 className="text-lg text-center font-semibold mb-2">Please Provide a Review<span className='font-red'>*</span></h3>

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
                            placeholder="Leave a Testimonial..."
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
            </div>



        </>
    );
};

export default EvaluationPage;
