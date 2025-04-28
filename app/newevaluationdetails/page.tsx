"use client";
import React, { useEffect, useState, useRef } from 'react';
import NewEvaluationForm from '../components/coach/NewEvaluationForm';
import { Evaluation } from '../types/types';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
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
import parse from "html-react-parser"
type NewEvaluationPageProps = {
  searchParams: {
    evaluationId: string; // Assuming evaluationId is a string
  };
};

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

const NewEvaluationPage: React.FC<NewEvaluationPageProps> = ({ searchParams

}) => {
  const [headerRatings, setHeaderRatings] = useState<number[]>(Array(headerMetrics.length).fill(0));
  const [skillRatings, setSkillRatings] = useState<number[]>(Array(radarSkills.length).fill(0));
  const { evaluationId } = searchParams; // Get evaluationId from searchParams
  const [evaluationData, setEvaluationData] = useState<Evaluation | null>(null); // State to store evaluation data
  const [error, setError] = useState<string | null>(null); // State to handle errors

  const [loading, setLoading] = useState<boolean>(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number>(0);



  const formattedDate = evaluationData?.updated_at ? format(new Date(evaluationData.updated_at), 'MM/dd/yyyy') : '';

  const pdfRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({

    speed: '',
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

    superStrengths: '',
    developmentAreas: '',
    idpGoals: '',
    keySkills: '',
    attacking: '',
    defending: '',
    transitionDefending: '',
    transitionAttacking: '',
  });
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

  const getRatingBgClass = (value: string) => {
    switch (value.toLowerCase()) {
      case "excellent":
        return "bg-yellow-100 text-yellow-700 rounded";
      case "positive":
        return "bg-cyan-100 text-cyan-700  rounded";
      case "neutral":
        return "bg-blue-100 text-blue-700 rounded";
      default:
        return "";
    }
  };

  const fetchEvaluationData = async () => {
    setLoading(true);
    const session = await getSession();

    if (session) {
      setUserType(session.user.type);
      setPlayerId(Number(session.user.id));
    }

    try {
      const response = await fetch(`/api/newevaluationdetails?evaluationId=${evaluationId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evaluation data');
      }

      const { result: data } = await response.json(); // <- Corrected here

      console.log("Fetched evaluation data:", data);
      setEvaluationData(data);
      setFormData({
        speed: data.speed || "",
        comm_persistence: data.comm_persistence || "",
        comm_aggression: data.comm_aggression || "",
        comm_alertness: data.comm_alertness || "",
        exe_scoring: data.exe_scoring || "",
        exe_receiving: data.exe_receiving || "",
        exe_passing: data.exe_passing || "",
        dec_mobility: data.dec_mobility || "",
        dec_anticipation: data.dec_anticipation || "",
        dec_pressure: data.dec_pressure || "",
        soc_speedEndurance: data.soc_speedEndurance || "",
        soc_strength: data.soc_strength || "",
        soc_explosiveMovements: data.soc_explosiveMovements || "",
        // ratings: data.ratings || "",
        superStrengths: data.superStrengths || "",
        developmentAreas: data.developmentAreas || "",
        idpGoals: data.idpGoals || "",
        keySkills: data.keySkills || "",
        attacking: data.attacking || "",
        defending: data.defending || "",
        transitionDefending: data.transitionDefending || "",
        transitionAttacking: data.transitionAttacking || "",
      });

      setHeaderRatings([
        data.speed,
        data.ability,
        data.codWithBall,
        data.codWithoutBall,
        data.counterMoveJump,
      ]);

      setSkillRatings(radarSkills.map(skill => data[skill.key] || 0));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching evaluation data:', error);
      setError('Failed to fetch evaluation data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (evaluationId) {
      fetchEvaluationData();
    }
  }, [evaluationId]);


  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }


  const chartData = radarSkills.map((skill, index) => ({
    subject: skill.label,
    A: skillRatings[index],
  }));

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

              <h3 className="text-lg font-semibold mb-4">  Review Title:{" "}
                <span>{evaluationData?.reviewTitle}</span></h3>
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
                  <a href={`/players/${evaluationData?.playerSlug}`} className='text-blue-700' target='_blank'>{evaluationData?.playerFirstName} {evaluationData?.playerLastName}
                  </a></span>

              </div>

              <div className="flex items-center mb-4">
                <strong className="mr-2">Coach:</strong>
                {evaluationData?.coachImage && evaluationData?.coachImage !== 'null' && (
                  <Image
                    src={evaluationData?.coachImage}
                    alt="Player Avatar"
                    className='w-12 h-12 mr-3 rounded-full object-cover'
                    width={30}
                    height={30}
                  />
                )}
                {(!evaluationData?.coachImage || evaluationData?.coachImage === 'null') && (
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


        <div className="metrics-table">
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
                {headerRatings.map((score, index) => (
                  <td key={index} className="px-4 py-2 border border-gray-300 bg-white">
                    <div className="flex justify-center gap-1">
                      {Array(score).fill("⭐").join("")}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Display radar chart */}
        <div className="radar-chart-container">
          <div ref={pdfRef} className="p-5 flex flex-row gap-8">
            <div className="flex flex-col gap-2 w-[250px]">
              {radarSkills.map((skill, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <label className="text-sm text-gray-700 w-[180px]">{skill.label}</label>
                  <div>{skillRatings[i]}</div>
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
        </div>

        <div className="p-6 space-y-12 bg-white">
          <div className="flex items-center gap-6 mb-6">
            <h2 className="text-3xl font-bold text-gray-700">CHARACTERISTICS</h2>
            <div className="text-sm mt-2 flex gap-4 flex-wrap">
              <span className="bg-yellow-400 text-white px-2 py-0.5 rounded">EXCELLENT</span>
              <span className="bg-cyan-400 text-white px-2 py-0.5 rounded">POSITIVE</span>
              <span className="bg-blue-300 text-white px-2 py-0.5 rounded">NEUTRAL</span>
            </div>
          </div>


          {/* Ratings Sections */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Communication */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-4">Communication</h3>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-700 font-bold">Persistence</span> <span className="text-gray-700">(Remain in advance position)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.comm_persistence || '')}`}>
                    {formData.comm_persistence || 'N/A'}
                  </span>
                </p>

              </div>

              {/* Repeat other fields for Communication, Execution, Decision Making, etc. */}
              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-700 font-bold">Aggression</span><span className="text-gray-700">(Aggressive attitude to complete for the ball)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.comm_aggression || '')}`}>
                    {formData.comm_aggression || 'N/A'}
                  </span>
                </p>

              </div>
              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Alertness</span> <span className="text-gray-700">(Anticipate positive opportunities)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.comm_alertness || '')}`}>
                    {formData.comm_alertness || 'N/A'}
                  </span>
                </p>                            </div>
            </div>
            {/* Execution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-4">Execution</h3>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Scoring</span> <span className="text-gray-700">(One touch finishes (head and feet))</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.exe_scoring || '')}`}>
                    {formData.exe_scoring || 'N/A'}
                  </span>
                </p>                            </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Receiving</span> <span className="text-gray-700">(Secure ball under pressure. Turn & face their goal)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.exe_receiving || '')}`}>
                    {formData.exe_receiving || 'N/A'}
                  </span>
                </p>                                           </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-semibold">Passing</span> <span className="text-gray-700">(Layoffs, penetrating, creating goal scoring opportunities)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.exe_passing || '')}`}>
                    {formData.exe_passing || 'N/A'}
                  </span>
                </p>                                           </div>
            </div>
            {/* Decision Making */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-4">Decision Making</h3>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-semibold">Mobility</span> <span className="text-gray-700">(Timing to optimise scoring opportunities)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.dec_mobility || '')}`}>
                    {formData.dec_mobility || 'N/A'}
                  </span>
                </p>                                                       </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Anticipation</span> <span className="text-gray-700">(Attack the spaces behind defence)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.dec_anticipation || '')}`}>
                    {formData.dec_anticipation || 'N/A'}
                  </span>
                </p>                                         </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Pressure</span> <span className="text-gray-700">(Contain/disrupt opponents build up)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.dec_pressure || '')}`}>
                    {formData.dec_pressure || 'N/A'}
                  </span>
                </p>                                             </div>
            </div>

            {/* Soccer Fitness */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-4">Soccer Fitness</h3>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Speed Endurance</span> <span className="text-gray-700">(Repetition of explosive runs)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.soc_speedEndurance || '')}`}>
                    {formData.soc_speedEndurance || 'N/A'}
                  </span>
                </p>                                          </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Strength</span> <span className="text-gray-700">(Compete for possession of the ball)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.soc_strength || '')}`}>
                    {formData.soc_strength || 'N/A'}
                  </span>
                </p>                                         </div>

              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-blue-500 font-bold">Explosive Movements</span> <span className="text-gray-700">(Acceleration, deceleration, COD)</span>
                </label>
                <p className="text-xs text-gray-800">
                  <span className={`px-1 rounded ${getRatingBgClass(formData.soc_explosiveMovements || '')}`}>
                    {formData.soc_explosiveMovements || 'N/A'}
                  </span>
                </p>                              </div>
            </div>
          </div>
          {/* Add other rating fields in a similar way */}


          {/* Display Super Strengths, Development Areas, and other fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Super Strengths</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.superStrengths || 'N/A'}</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Development Areas</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.developmentAreas || 'N/A'}</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">IDP Goals</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.idpGoals || 'N/A'}</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Key Skills</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.keySkills || 'N/A'}</p>
            </div>
          </div>

          {/* Repeat for other sections like Attacking, Defending, Transition */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Attacking</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.attacking || 'N/A'}</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Defending</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.defending || 'N/A'}</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Transition Defending</label>
              <p className="  whitespace-pre-line text-sm text-gray-800">{formData.transitionDefending || 'N/A'}</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Transition Attacking</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.transitionAttacking || 'N/A'}</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default NewEvaluationPage;
