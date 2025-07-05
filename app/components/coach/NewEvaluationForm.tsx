'use client';
import React, { useEffect, useRef, useState } from "react";
import { FormEvent } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Star } from 'lucide-react';

const headerMetrics = ['Speed', 'Ability', 'COD with ball', 'COD without ball', 'Counter Move Jump'];

const radarSkills = [
  { label: 'Receiving & 1st Touch', key: 'receivingFirstTouch' },
  { label: 'Shots on Goal', key: 'shotsOnGoal' },
  { label: 'Finishing Touches', key: 'finishingTouches' },
  { label: 'Combination Play', key: 'combinationPlay' },
  { label: 'Workrate', key: 'workrate' },
  { label: 'Pressing from the Front', key: 'pressingFromFront' },
  { label: '1v1 Domination', key: 'oneVOneDomination' },
  { label: 'Goal Threat', key: 'goalThreat' },
  { label: 'Being a Good Teammate', key: 'beingAGoodTeammate' },
  { label: 'Decision Making', key: 'decisionMakingScore' },
  { label: 'No. of Touches in Final 3rd', key: 'touchesInFinalThird' },
  { label: 'Off the Ball Movement', key: 'offTheBallMovement' },
  { label: 'Ability to find Space in the box', key: 'spaceInBoxAbility' },
  { label: 'Runs off the ball/Forward runs', key: 'forwardRuns' },
];

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
import Swal from 'sweetalert2';
// const RATING_OPTIONS = ['Excellent', 'Positive', 'Neutral'];

// At the top of your file or in a separate types file
type RatingInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

// Use React.FC with the prop type
const RatingInput: React.FC<RatingInputProps> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full border border-gray-300 rounded-md p-2 text-xs"
  >
    <option value=""className="font-bold">Select</option>
    <option value="EXCELLENT" className=" text-black text-xs ">EXCELLENT</option>
    <option value="POSITIVE" className=" text-black text-xs ">POSITIVE</option>
    <option value="NEUTRAL" className=" text-black text-xs ">NEUTRAL</option>
  </select>
);


const NewEvaluationForm: React.FC<NewEvaluationFormProps> = ({
  evaluationId,
  evaluationData,
  coachId,
  playerId,
  isOpen,
  onClose,

}) => {
  const [formData, setFormData] = useState({
    speed: '',
    ability: '',
    codWithBall: '',
    codWithoutBall: '',
    counterMoveJump: '',
    receivingFirstTouch: '',
    shotsOnGoal: '',
    finishingTouches: '',
    combinationPlay: '',
    workrate: '',
    pressingFromFront: '',
    oneVOneDomination: '',
    goalThreat: '',
    beingAGoodTeammate: '',
    decisionMakingScore: '',
    touchesInFinalThird: '',
    offTheBallMovement: '',
    spaceInBoxAbility: '',
    forwardRuns: '',

    ratings: {
      comm_persistence: '',
      comm_aggression: '',
      comm_alertness: '',
      exe_scoring: '',
      exe_receiving: '',
      exe_passing: '',
      dec_mobility: '',
      dec_anticipation: '',
      dec_pressure: '',
      soc_speedEndurance: '',
      soc_strength: '',
      soc_explosiveMovements: '',
    },

    // Additional text fields
    superStrengths: '',
    developmentAreas: '',
    idpGoals: '',
    keySkills: '',
    attacking: '',
    defending: '',
    transitionDefending: '',
    transitionAttacking: '',
  });
  const [headerRatings, setHeaderRatings] = useState<number[]>(Array(headerMetrics.length).fill(0));
  const [skillRatings, setSkillRatings] = useState<number[]>(Array(radarSkills.length).fill(0));
const [submitting, setSubmitting] = useState(false);
  const handleHeaderRatingChange = (index: number, value: number) => {
    const newRatings = [...headerRatings];
    newRatings[index] = value;
    setHeaderRatings(newRatings);
  };
  const [submittedEvaluations, setSubmittedEvaluations] = useState<number[]>([]);

  const handleSkillRatingChange = (index: number, value: number) => {
    const newRatings = [...skillRatings];
    newRatings[index] = value;
    setSkillRatings(newRatings);
  };

const handleSubmit = async () => {
  setSubmitting(true);

  const { ratings, ...rest } = formData;
  const payload = {
    ...rest,
    ...ratings,
    playerId,
    coachId,
    evaluationId,
    speed: headerRatings[0],
    ability: headerRatings[1],
    codWithBall: headerRatings[2],
    codWithoutBall: headerRatings[3],
    counterMoveJump: headerRatings[4],
    ...radarSkills.reduce((acc, skill, i) => {
      acc[skill.key] = skillRatings[i];
      return acc;
    }, {} as any),
  };

  try {
    const res = await fetch('/api/radarEvaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Unknown error');
    }

    const responseData = await res.json();
    console.log('New Evaluation submitted:', responseData);

    Swal.fire("Success", "New Evaluation submitted successfully!", "success");

    // ✅ Add to submittedEvaluations state and localStorage
    if (typeof evaluationId === 'number') {
      const updated = [...submittedEvaluations, evaluationId];
      setSubmittedEvaluations(updated);
      //localStorage.setItem('submittedEvaluations', JSON.stringify(updated));
    }

    onClose(); // close modal

    // ✅ Reload page to reflect button change (New Evaluate → View)
    window.location.reload();
  } catch (error) {
    console.error('Error submitting radar evaluation:', error);
    Swal.fire("Error", "Something went wrong. Please check console.", "error");
  } finally {
    setSubmitting(false);
  }
};

const chartData = radarSkills.map((skill, i) => ({
    subject: skill.label,
    A: skillRatings[i],
  }));
  const userId = evaluationId;

  const formattedDate = evaluationData?.created_at
    ? format(new Date(evaluationData.created_at), "MM/dd/yyyy")
    : "";

    useEffect(() => {
        const saved = localStorage.getItem('submittedEvaluations');
        if (saved) {
          setSubmittedEvaluations(JSON.parse(saved));
        }
      }, []);
      

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
          <div className="p-4 bg-white rounded-xl shadow-lg">
      {/* Top Section: Header metrics */}
      <div className="w-fit bg-white p-4 rounded-xl shadow mb-6">
        <table className="table-auto border-collapse border-gray-300">
          <thead>
            <tr>
              {headerMetrics.map((metric, index) => (
                <th key={index} className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                  {metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {headerRatings.map((rating, index) => (
                <td key={index} className="px-4 py-2 border border-gray-300 bg-white">
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`cursor-pointer ${rating > i ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-300'}`}
                        onClick={() => handleHeaderRatingChange(index, i + 1)}
                      />
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Body: Skills sidebar + Radar */}
      <div className="p-5 flex flex-row gap-8">
        <div className="flex flex-col gap-2 w-[250px]">
          {radarSkills.map((skill, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <label className="text-sm text-gray-700 w-[180px]">{skill.label}</label>
              <input
                type="number"
                min={0}
                max={10}
                value={skillRatings[i]}
                onChange={(e) => handleSkillRatingChange(i, Number(e.target.value))}
                className="w-12 text-center border rounded px-1 py-0.5 text-sm"
              />
            </div>
          ))}
        </div>

        {/* Radar Chart */}
        <div className="flex-1 h-[500px] min-w-[400px]">
          <ResponsiveContainer>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={80} domain={[0, 10]} tickCount={11} />
              <Radar name="Player" dataKey="A" stroke="#1e40af" fill="#3b82f6" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      
    </div>        </div>



        {/* Form */}
        <form  className="p-6 space-y-12 bg-white">
          {/* Characteristics Header */}
          <div className="flex items-center gap-6 mb-6">

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
            <div>
              <h2 className="text-3xl font-bold text-gray-700">CHARACTERISTICS</h2>
              <div className="text-sm mt-2 flex gap-4 flex-wrap">
                <span className="bg-yellow-400 text-white px-2 py-0.5 rounded">EXCELLENT</span>
                <span className="bg-cyan-400 text-white px-2 py-0.5 rounded">POSITIVE</span>
                <span className="bg-blue-300 text-white px-2 py-0.5 rounded">NEUTRAL</span>
              </div>
            </div>
          </div>

          {/* Ratings Sections */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-8"> */}

          <input type="hidden" name="userId" value={userId || ''} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Communication */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-4">Communication</h3>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-700 font-bold">Persistence</span> <span className="text-gray-700">(Remain in advance position)</span>
                </label>
                <RatingInput
                  value={formData.ratings.comm_persistence}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        comm_persistence: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Aggression</span> <span className="text-gray-700">(Aggressive attitude to complete for the ball)</span>
                </label>
                <RatingInput
                  value={formData.ratings.comm_aggression}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        comm_aggression: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Alertness</span> <span className="text-gray-700">(Anticipate positive opportunities)</span>
                </label>
                <RatingInput
                  value={formData.ratings.comm_alertness}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        comm_alertness: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            {/* Execution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-4">Execution</h3>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Scoring</span> <span className="text-gray-700">(One touch finishes (head and feet))</span>
                </label>
                <RatingInput
                  value={formData.ratings.exe_scoring}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        exe_scoring: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Receiving</span> <span className="text-gray-700">(Secure ball under pressure. Turn & face their goal)</span>
                </label>
                <RatingInput
                  value={formData.ratings.exe_receiving}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        exe_receiving: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-semibold">Passing</span> <span className="text-gray-700">(Layoffs, penetrating, creating goal scoring opportunities)</span>
                </label>
                <RatingInput
                  value={formData.ratings.exe_passing}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        exe_passing: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            {/* Decision Making */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-4">Decision Making</h3>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-semibold">Mobility</span> <span className="text-gray-700">(Timing to optimise scoring opportunities)</span>
                </label>
                <RatingInput
                  value={formData.ratings.dec_mobility}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        dec_mobility: e.target.value,
                      },
                    }))
                  }
                />              </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Anticipation</span> <span className="text-gray-700">(Attack the spaces behind defence)</span>
                </label>
                <RatingInput
                  value={formData.ratings.dec_anticipation}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        dec_anticipation: e.target.value,
                      },
                    }))
                  }
                />              </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Pressure</span> <span className="text-gray-700">(Contain/disrupt opponents build up)</span>
                </label>
                <RatingInput
                  value={formData.ratings.dec_pressure}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        dec_pressure: e.target.value,
                      },
                    }))
                  }
                />              </div>
            </div>

            {/* Soccer Fitness */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-4">Soccer Fitness</h3>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Speed Endurance</span> <span className="text-gray-700">(Repetition of explosive runs)</span>
                </label>
                <RatingInput
                  value={formData.ratings.soc_speedEndurance}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        soc_speedEndurance: e.target.value,
                      },
                    }))
                  }
                />              </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Strength</span> <span className="text-gray-700">(Compete for possession of the ball)</span>
                </label>
                <RatingInput
                  value={formData.ratings.soc_strength}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        soc_strength: e.target.value,
                      },
                    }))
                  }
                />              </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Explosive Movements</span> <span className="text-gray-700">(Acceleration, deceleration, COD)</span>
                </label>
                <RatingInput
                  value={formData.ratings.soc_explosiveMovements}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData(prev => ({
                      ...prev,
                      ratings: {
                        ...prev.ratings,
                        soc_explosiveMovements: e.target.value,
                      },
                    }))
                  }
                />              </div>
            </div>


            {/* Dropdown Rating Options */}


          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Super Strengths</label>
              <textarea
                rows={5}
                value={formData.superStrengths}
                onChange={e => setFormData(prev => ({ ...prev, superStrengths: e.target.value }))}
                placeholder="Write player's super strengths..."
                className="w-full text-sm border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Areas for Development</label>
              <textarea
                rows={5}
                value={formData.developmentAreas}
                onChange={e => setFormData(prev => ({ ...prev, developmentAreas: e.target.value }))}
                placeholder="Write areas of development..."
                className="w-full text-sm border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">IDP Goals</label>
              <textarea
                rows={5}
                value={formData.idpGoals}
                onChange={e => setFormData(prev => ({ ...prev, idpGoals: e.target.value }))}
                placeholder="Write IDP goals..."
                className="w-full text-sm border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Key Skills */}
            <div>
              <label className="block text-semibold font-semibold text-gray-800 mb-2">Centre Forward – Key Skills</label>
              <textarea
                rows={5}
                value={formData.keySkills}
                onChange={e => setFormData(prev => ({ ...prev, keySkills: e.target.value }))}
                placeholder="Write key skills..."
                className="w-full text-sm border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Attacking */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Attacking</label>
              <textarea
                rows={5}
                value={formData.attacking}
                onChange={e => setFormData(prev => ({ ...prev, attacking: e.target.value }))}
                placeholder="Write attacking notes..."
                className="w-full text-sm border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Defending */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Defending</label>
              <textarea
                rows={5}
                value={formData.defending}
                onChange={e => setFormData(prev => ({ ...prev, defending: e.target.value }))}
                placeholder="Write defending notes..."
                className="w-full text-sm border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Transition of Defending */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Transition of Defending</label>
              <textarea
                rows={5}
                value={formData.transitionDefending}
                onChange={e => setFormData(prev => ({ ...prev, transitionDefending: e.target.value }))}
                placeholder="Write notes on defending transitions..."
                className="w-full text-sm border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Transition to Attack */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Transition to Attack</label>
              <textarea
                rows={5}
                value={formData.transitionAttacking}
                onChange={e => setFormData(prev => ({ ...prev, transitionAttacking: e.target.value }))}
                placeholder="Write notes on transition to attack..."
                className="w-full text-sm border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-right mt-6">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          {submitting ? 'Submitting...' : 'Submit Evaluation'}
        </button>
      </div>
        </form>
      </div>
    </div>
  );
};

export default NewEvaluationForm;