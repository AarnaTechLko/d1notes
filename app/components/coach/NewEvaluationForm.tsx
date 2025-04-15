'use client';
import React, { useEffect, useRef, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import Image from "next/image";
import defaultImage from "../../public/default.jpg";
import { Evaluation, EvaluationsByStatus } from "../../types/types";
import { format } from "date-fns";
import Playerdata from "./ReviewForm";
type NewEvaluationFormProps = {
  evaluationId?: number | null; // Optional or null
  evaluationData?: Evaluation | null; // Update to accept Evaluation or null
  coachId?: number | null; // Optional or null
  playerId?: number | null; // Optional or null
  isOpen: boolean;
  onClose: () => void;
};



const CHARACTERISTICS: Record<string, string[]> = {
  Communication: ['Persistence', 'Aggression', 'Alertness'],
  Execution: ['Scoring', 'Receiving', 'Passing'],
  'Decision Making': ['Mobility', 'Anticipation', 'Pressure'],
  'Soccer Fitness': ['Speed Endurance', 'Strength', 'Explosive Movements'],
};

const RATING_OPTIONS = ['Excellent', 'Positive', 'Neutral'];


const NewEvaluationForm: React.FC<NewEvaluationFormProps> = ({
  evaluationId,
  evaluationData,
  coachId,
  playerId,
  isOpen,
  onClose,

}) => {
  const [ratings, setRatings] = useState<Record<string, Record<string, string>>>({});
  const [superStrengths, setSuperStrengths] = useState('');
  const [areasForDevelopment, setAreasForDevelopment] = useState('');
  const [idpGoals, setIdpGoals] = useState('');
  const [playerID, setPlayerID] = useState<number | undefined>(undefined); // Allowing for undefined
  const [coachID, setCoachID] = useState<number | undefined>(undefined);
 
  const [openDropdown, setOpenDropdown] = useState<Record<string, boolean>>({});

  const handleRatingChange = (category: string, skill: string, value: string) => {
    setRatings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [skill]: value,
      },
    }));
  };

/* ***************************data facthing************************* */
// Handle Data fetching for Saved Drafts
const fetchEvaluationResultData = async () => {
  try {
    const response = await fetch(
      `/api/evaluationdetails?evaluationId=${evaluationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch evaluation data");
    }

    const data = await response.json();

    console.log("fatching data evaluations:",data.data);
  } catch (error) {
    console.error("Error fetching evaluation data:", error);
  }
};
const userId = evaluationId;

const formattedDate = evaluationData?.created_at
    ? format(new Date(evaluationData.created_at), "MM/dd/yyyy")
    : "";

  useEffect(() => {
    evaluationData?.evaluationId != null ? fetchEvaluationResultData() : "";
  }, [evaluationData]);


  /* data fatching end  */


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const payload = {
      ratings,
      superStrengths,
      areasForDevelopment,
      idpGoals,
      submittedAt: new Date().toISOString(),
    };
  
    try {
      const res = await fetch('/api/playerevaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) throw new Error('Submission failed');
  
      const data = await res.json();
      alert('Evaluation submitted successfully!');
      // Optionally reset form or redirect
    } catch (error) {
      console.error(error);
      alert('There was an error submitting the evaluation.');
    }
  };
  

  if (!isOpen) return null;


  return (

    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white w-full  rounded-2xl shadow-xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-700 text-white p-5 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-xl font-bold">Player Evaluation Form</h2>
         
          <button onClick={onClose} className="text-white text-2xl hover:text-gray-200">
            &times;
          </button>
        </div>

        {/* Evaluation Summary Block */}
        <div className="p-6 border-b border-gray-300 rounded-lg font-sans bg-white">
          {/* Evaluation Form Header */}
          <div className="w-full mb-6">
            <div className="bg-white p-6 border border-gray-300 rounded-lg">
              <div className="flex justify-between border-b border-gray-300 pb-3 mb-0 flex-wrap">
                <h2 className="text-xl font-bold">Evaluation Form</h2>
                <h2> Evaluating user: {userId}</h2>
                <div className="flex flex-col items-end">
                  <span className="bg-cyan-100 text-teal-800 px-3 py-1 rounded mb-2">Accepted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 border border-gray-300 rounded-lg md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">
                    Review Title:{" "}
                    <span className="font-normal">
                      {evaluationData?.review_title}
                    </span>
                  </h3>

              <div className="flex items-center mb-4">
                <strong className="mr-2">Player:</strong>
                {evaluationData?.image && evaluationData.image !== "null" ? (
                  <Image
                    src={evaluationData.image}
                    alt="Player Avatar"
                    className="w-12 h-12 mr-3 rounded-full object-cover"
                    width={48}
                    height={48}
                  />
                ) : (
                  <Image
                    src={defaultImage}
                    alt="Default Player Avatar"
                    className="w-12 h-12 mr-3 rounded-full object-cover"
                    width={48}
                    height={48}
                  />
                )}
                <span className="text-gray-700">
                  <a href={`/players/${evaluationData?.playerSlug}`} target="_blank" className="text-blue-700">
                    {evaluationData?.first_name} {evaluationData?.last_name}
                  </a>
                </span>
              </div>

              
                <div className="mb-4">
                  <strong className="mr-2">Evaluation Rate:</strong> <span>${evaluationData?.expectedCharge}</span>
                </div>
             

              <div className="mb-4">
                <strong className="mr-2">Date Requested:</strong> <span>{formattedDate}</span>
              </div>

              {/* Video 1 Section */}
              <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
                <legend className="text-lg font-semibold text-gray-700">Video 1</legend>
                <div className="mb-2">
                  <strong className="mr-2">Link:</strong>
                  <a href={evaluationData?.primary_video_link} target="_blank" className="text-blue-500">Link to video</a>
                  <span className="mx-2">|</span>
                  <strong>Length:</strong> {evaluationData?.videoOneTiming} min
                  <span className="mx-2">|</span>
                  <strong>Jersey Color:</strong> {evaluationData?.jerseyColorOne}
                  <span className="mx-2">|</span>
                  <strong>Jersey Number:</strong> {evaluationData?.jerseyNumber}
                  <span className="mx-2">|</span>
                  <strong>Position:</strong> {evaluationData?.positionOne}
                </div>
                <div className="mb-2">
                  <strong>Description:</strong> {evaluationData?.video_description}
                </div>
              </fieldset>

              {/* Video 2 Section */}
              {evaluationData?.video_link_two && (
                <fieldset className="border border-gray-300 rounded-md p-4">
                  <legend className="text-lg font-semibold text-gray-700">Video 2</legend>
                  <div className="mb-2">
                    <strong className="mr-2">Link:</strong>
                    <a href={evaluationData?.video_link_two} target="_blank" className="text-blue-500">Link to video</a>
                    <span className="mx-2">|</span>
                    <strong>Length:</strong> {evaluationData?.videoTwoTiming} min
                    <span className="mx-2">|</span>
                    <strong>Jersey Color:</strong> {evaluationData?.jerseyColorTwo}
                    <span className="mx-2">|</span>
                    <strong>Jersey Number:</strong> {evaluationData?.jerseyNumberTwo}
                    <span className="mx-2">|</span>
                    <strong>Position:</strong> {evaluationData?.positionTwo}
                  </div>

                </fieldset>
              )}

            </div>
            <div className="bg-white p-6 border border-gray-300 rounded-lg md:col-span-1">
              <h4 className="text-lg font-semibold mb-3">
                Evaluation Rating Guide
              </h4>
              <ul className="list-none space-y-2">
                <li>
                  [1] Significantly below competition level – Needs major
                  improvement
                </li>
                <li>
                  [2] Far below competition level – Needs substantial
                  improvement
                </li>
                <li>[3] Below competition level – Needs improvement</li>
                <li>
                  [4] Slightly below competition level – Shows potential but
                  needs significant work
                </li>
                <li>
                  [5] Approaching competition level – Almost there but still
                  inconsistent
                </li>
                <li>
                  [6] At competition level – Meets standard expectations
                </li>
                <li>
                  [7] Slightly above competition level – Consistently
                  performs well
                </li>
                <li>[8] Above competition level – Strong competitor</li>
                <li>
                  [9] Highly above competition level – Among the top
                  performers
                </li>
                <li>
                  [10] Elite competition level – Exceptional, top-tier
                  performance
                </li>
              </ul>
            </div>
          </div>
          <Playerdata/> 
        </div>

             

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-12 bg-white">
          {/* Characteristics Header */}
          <div className="flex items-center gap-6 mb-6">
            <img
              src="/path/to/player-image.jpg"
              alt="Player"
              className="w-28 h-28 rounded-lg border-4 border-blue-600 object-cover"
            />
            <div>
              <h2 className="text-3xl font-bold text-blue-700">CHARACTERISTICS</h2>
              <div className="text-sm mt-2 flex gap-4 flex-wrap">
                <span className="bg-yellow-400 text-black px-2 py-0.5 rounded">EXCELLENT</span>
                <span className="bg-cyan-400 text-black px-2 py-0.5 rounded">POSITIVE</span>
                <span className="bg-blue-300 text-black px-2 py-0.5 rounded">NEUTRAL</span>
              </div>
            </div>
          </div>

          {/* Ratings Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(CHARACTERISTICS).map(([category, skills]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-blue-700 border-b pb-1 mb-4">{category}</h3>
            {skills.map(skill => (
              <div key={skill} className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">{skill}</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={ratings[category]?.[skill] || ''}
                    onClick={() =>
                      setOpenDropdown(prev => ({
                        ...prev,
                        [`${category}-${skill}`]: !prev[`${category}-${skill}`],
                      }))
                    }
                    className={`w-full cursor-pointer border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      ratings[category]?.[skill] === 'Excellent'
                        ? 'text-yellow-400 '
                        : ratings[category]?.[skill] === 'Positive'
                        ? 'text-cyan-400 '
                        : ratings[category]?.[skill] === 'Neutral'
                        ? 'text-blue-300 '
                        : 'text-white'
                    }`}
                    placeholder="Select Rating"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-700">
                    ▼
                  </div>

                  {openDropdown[`${category}-${skill}`] && (
                    <div className="absolute right-0 z-20 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg">
                      {RATING_OPTIONS.map(option => (
                        <div
                          key={option}
                          onClick={() => {
                            handleRatingChange(category, skill, option);
                            setOpenDropdown(prev => ({
                              ...prev,
                              [`${category}-${skill}`]: false,
                            }));
                          }}
                          className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                            option === 'Excellent'
                              ? 'text-yellow-400 '
                              : option === 'Positive'
                              ? 'text-cyan-400 '
                              : option === 'Neutral'
                              ? 'text-blue-300 '
                              : ''
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Super Strengths</label>
          <textarea
            rows={5}
            value={superStrengths}
            onChange={e => setSuperStrengths(e.target.value)}
            placeholder="Write player's super strengths..."
            className="w-full border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Areas for Development</label>
          <textarea
            rows={5}
            value={areasForDevelopment}
            onChange={e => setAreasForDevelopment(e.target.value)}
            placeholder="Write areas of development..."
            className="w-full border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-lg font-semibold text-gray-800 mb-2">IDP Goals</label>
          <textarea
            rows={5}
            value={idpGoals}
            onChange={e => setIdpGoals(e.target.value)}
            placeholder="Write IDP goals..."
            className="w-full border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
          {/* Key Skills & Game Phases */}
          <div className="space-y-12">
            <h2 className="text-2xl font-bold text-blue-700 text-center">Centre Forward Key Skills & Game Phases</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-800">
              <div>
                <h3 className="text-xl font-bold text-blue-700 mb-4">Centre Forward – Key Skills</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>1 v 1 Attacking (Outplay)</li>
                  <li>Finishing – Heading, volleys, 1st time etc.</li>
                  <li>Movement to create space for self or others</li>
                  <li>Dribbling and running with the ball</li>
                  <li>Hold up and link play</li>
                  <li>Creating opportunities & clever movement</li>
                  <li>Receiving skills</li>
                  <li>Transition to Defend and pressing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-700 mb-4">Attacking</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Movements to receive or open passing lines</li>
                  <li>Receiving under pressure</li>
                  <li>Dribbling and running with the ball depending on press</li>
                  <li>Crossing and cutbacks</li>
                  <li>Creativity and combination play</li>
                  <li>Secure, hold up, link and support play</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-700 mb-4">Defending</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Pressing responsibilities (Start the press)</li>
                  <li>Protect key areas</li>
                  <li>1 v 1 Defending</li>
                  <li>Compact shape</li>
                  <li>Direct play into pressing traps</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-700 mb-4">Transition (Attack & Defend)</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Quick reactions and early decisions</li>
                  <li>Angles of press to deny options</li>
                  <li>Link with wingers and attacking mids</li>
                  <li>Recovery runs and regain possession</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-6">
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold px-8 py-3 rounded-lg transition"
            >
              Submit Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEvaluationForm;