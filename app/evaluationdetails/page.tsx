"use client";
import '@fortawesome/fontawesome-free/css/all.min.css';

import React, { useEffect, useState, useRef } from 'react';
import EvaluationForm from '../components/coach/EvaluationForm';
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
import { FaFileAlt } from 'react-icons/fa';
import { showError } from '../components/Toastr';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import parse from "html-react-parser"
type EvaluationPageProps = {
  searchParams: {
    evaluationId: string;

  };
};
type FileData = {
  filename: string;
  comments: string;
  size?: number; // Add size as an optional property

};

type AbilityData = {
  evaluationId: string;
  files: {
    file1?: FileData;
    file2?: FileData;
    file3?: FileData;
    file4?: FileData;
    file5?: FileData;
  };
};
const position = "Goalkeeper"; // or any dynamic value

const headerMetrics = ['Technical Average', 'Tactical Average', 'Distribution Average', 'Physical Average', 'Organization Average'];

const radarSkills =
  position === "Goalkeeper"
    ? [
      { label: 'Technical Average', key: 'technicalAverage' },
      { label: 'Tactical Average', key: 'tacticalAverage' },
      { label: 'Distribution Average', key: 'distributionAverage' },
      { label: 'Physical Average', key: 'physicalAverage' },
      { label: 'Organization Average', key: 'organizationAverage' }
    ]
    : [
      { label: 'Technical Average', key: 'technicalAverage' },
      { label: 'Tactical Average', key: 'tacticalAverage' },
      { label: 'Physical Average', key: 'physicalAverage' }
    ];

const EvaluationPage: React.FC<EvaluationPageProps> = ({ searchParams }) => {
  const [headerRatings, setHeaderRatings] = useState<number[]>(Array(headerMetrics.length).fill(0));
  const [skillRatings, setSkillRatings] = useState<number[]>(Array(radarSkills.length).fill(0));

  const { evaluationId } = searchParams; // Get evaluationId from searchParams
  const [evaluationData, setEvaluationData] = useState<Evaluation | null>(null); // State to store evaluation data
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [technicalScores, setTechnicalScores] = useState<{ [key: string]: string }>({});
  const [tacticalScores, setTacticalScores] = useState<{ [key: string]: string }>({});
  const [physicalScores, setPhysicalScores] = useState<{ [key: string]: string }>({});
  const [distributionScores, setDistributionScores] = useState<{ [key: string]: string }>({});
  const [organizationScores, setOrganizationScores] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number>(0);
  const [data, setData] = useState<AbilityData | null>(null);
  // const [abilities, setAbilities] = useState<AbilityData[]>([]);
  const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9MB

  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

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

  const getRatingBgClass = (value: string) => {
    switch (value.toLowerCase()) {
      case "excellent":
        return " text-yellow-400 rounded";
      case "positive":
        return " text-cyan-400  rounded";
      case "neutral":
        return " text-blue-300 rounded";
      default:
        return "";
    }
  };
  const downloadPDF = async () => {
    if (!pdfRef.current || !data?.files) return;

    await document.fonts.ready;

    const tempElements: { original: HTMLElement | null, replacement: HTMLElement }[] = [];

    Object.values(data.files).forEach((file) => {
      const ext = file.filename.toLowerCase();
      const fileUrl = file.filename.startsWith("http")
        ? file.filename
        : `/uploads/${file.filename}`;

      let element: HTMLElement | null = null;

      if (pdfRef.current) {
        const images = Array.from(pdfRef.current.querySelectorAll<HTMLImageElement>('img'));
        const videos = Array.from(pdfRef.current.querySelectorAll<HTMLVideoElement>('video'));
        const anchors = Array.from(pdfRef.current.querySelectorAll<HTMLAnchorElement>('a'));
        const iframes = Array.from(pdfRef.current.querySelectorAll<HTMLIFrameElement>('iframe'));
        const embeds = Array.from(pdfRef.current.querySelectorAll<HTMLEmbedElement>('embed'));

        if (ext.match(/\.(jpg|jpeg|png)$/)) {
          element = images.find(img => img.src.includes(file.filename) || img.src.includes(fileUrl)) || null;
        } else if (ext.endsWith(".mp4")) {
          element = videos.find(video => {
            const source = video.querySelector("source");
            return source && (source.src.includes(file.filename) || source.src.includes(fileUrl));
          }) || null;
        } else if (ext.endsWith(".pdf")) {
          element =
            iframes.find(frame => frame.src.includes(file.filename) || frame.src.includes(fileUrl)) ||
            embeds.find(embed => embed.src.includes(file.filename) || embed.src.includes(fileUrl)) ||
            anchors.find(a => a.href.includes(file.filename) || a.href.includes(fileUrl)) ||
            null;
        }
      }

      // Create a replacement link element
      const linkEl = document.createElement("div");
      linkEl.style.color = "blue";
      linkEl.style.textDecoration = "underline";
      linkEl.style.margin = "10px 0";
      linkEl.innerText = file.filename;

      // Replace or append the link
      if (element && element.parentNode) {
        const parent = element.parentNode;
        const next = element.nextSibling;
        element.remove();
        if (parent) parent.insertBefore(linkEl, next);

        tempElements.push({ original: element, replacement: linkEl });
      } else if (pdfRef.current) {
        pdfRef.current.appendChild(linkEl);
        tempElements.push({ original: null, replacement: linkEl });
      }

    });

    // Remove download buttons temporarily
    const downloadButtons = Array.from(pdfRef.current.querySelectorAll("a[download]")) as HTMLElement[];
    const removedButtons: { node: HTMLElement; parent: Node; nextSibling: ChildNode | null }[] = [];

    downloadButtons.forEach((btn) => {
      if (btn.parentNode) {
        removedButtons.push({
          node: btn,
          parent: btn.parentNode,
          nextSibling: btn.nextSibling,
        });
        btn.remove(); // Fully remove from DOM (no space left)
      }
    });
    // Capture screenshot of pdfRef content
    const canvas = await html2canvas(pdfRef.current, {
      scrollX: 0,
      scrollY: 0,
      backgroundColor: "#fff",
      useCORS: true,
      scale: 2,
      windowWidth: pdfRef.current.scrollWidth,
      windowHeight: pdfRef.current.scrollHeight,
    });



    // Restore original elements
    tempElements.forEach(({ original, replacement }) => {
      replacement.remove();
      if (original) original.style.display = "";
    });

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdfHeight = pdf.internal.pageSize.getHeight();

    let position = 0;
    let heightLeft = imgHeight;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("evaluation-detail.pdf");
  };
  useEffect(() => {
    if (evaluationId) {
      fetch(`/api/ability?evaluationId=${evaluationId}`)
        .then((res) => res.json())
        .then((result) => {
          console.log("API result:", result); // Log the full response
          if (result.ability) {
            setData(result.ability); // If ability data exists, update the state
          } else {
            alert('Unable to fetch data');
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          alert('Error fetching data');
        });
    }
  }, [evaluationId]);



  const handleSubmitRating = async () => {
    if (rating <= 0) {
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
      console.log(data);

      setEvaluationData(data.result as Evaluation); // Type assertion here
      setPhysicalScores(JSON.parse(data.result.physicalScores));
      setTacticalScores(JSON.parse(data.result.tacticalScores));
      setTechnicalScores(JSON.parse(data.result.technicalScores));
      setOrganizationScores(JSON.parse(data.result.organizationScores));
      setDistributionScores(JSON.parse(data.result.distributionScores));
      setDistributionScores(JSON.parse(data.result.distributionScores));
      setFormData({
        speed: data.result.speed || "",
        comm_persistence: data.result.comm_persistence || "",
        comm_aggression: data.result.comm_aggression || "",
        comm_alertness: data.result.comm_alertness || "",
        exe_scoring: data.result.exe_scoring || "",
        exe_receiving: data.result.exe_receiving || "",
        exe_passing: data.result.exe_passing || "",
        dec_mobility: data.result.dec_mobility || "",
        dec_anticipation: data.result.dec_anticipation || "",
        dec_pressure: data.result.dec_pressure || "",
        soc_speedEndurance: data.result.soc_speedEndurance || "",
        soc_strength: data.result.soc_strength || "",
        soc_explosiveMovements: data.result.soc_explosiveMovements || "",
        // ratings: data.ratings || "",
        superStrengths: data.result.superStrengths || "",
        developmentAreas: data.result.developmentAreas || "",
        idpGoals: data.result.idpGoals || "",
        keySkills: data.result.keySkills || "",
        attacking: data.result.attacking || "",
        defending: data.result.defending || "",
        transitionDefending: data.result.transitionDefending || "",
        transitionAttacking: data.result.transitionAttacking || "",
      });
      setHeaderRatings([
        data.result.technicalAverage,

        data.result.tacticalAverage,
        data.result.distributionAverage,
        data.result.physicalAverage,
        data.result.organizationAverage,
      ]);

      setSkillRatings(radarSkills.map(skill => data.result[skill.key] || 0));

      setLoading(false);
      // Set the fetched evaluation data
    } catch (error) {
      console.error('Error fetching evaluation data:', error);
      setError('Failed to fetch evaluation data'); // Set error message
    }
  };
  const calculateAverage = (scores: Record<string, string | number>) => {
    const values = Object.values(scores)
      .map(Number)
      .filter((v) => !isNaN(v));
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg * 10) / 10; // Round to 1 decimal
  };
  useEffect(() => {

    fetchEvaluationData();
  }, []); // Dependency array includes evaluationId
  if (loading) {
    return <Loading />; // Loading indicator
  }

  const chartData = radarSkills
    .filter((skill) => {
      // Filter skills based on position
      if (position === "Goalkeeper") {
        return true; // Include all skills for Goalkeeper
      }
      // Exclude Distribution and Organization for non-Goalkeepers
      return skill.key !== "distributionAverage" && skill.key !== "organizationAverage";
    })
    .map((skill) => {
      let averageValue = 0;

      // Get the average value for each skill
      switch (skill.key) {
        case "technicalAverage":
          averageValue = calculateAverage(technicalScores); // Use the average for technical scores
          break;
        case "tacticalAverage":
          averageValue = calculateAverage(tacticalScores); // Use the average for tactical scores
          break;
        case "distributionAverage":
          averageValue = calculateAverage(distributionScores); // Use the average for distribution scores
          break;
        case "physicalAverage":
          averageValue = calculateAverage(physicalScores); // Use the average for physical scores
          break;
        case "organizationAverage":
          averageValue = calculateAverage(organizationScores); // Use the average for organization scores
          break;
        default:
          averageValue = 0; // Default to 0 if no match
      }

      return {
        subject: skill.label,
        A: averageValue, // Use the calculated average value
      };
    });

  const calculateOverallAverage = () => {
    let total = 0;
    let count = 0;

    // Add averages if they exist (ensuring no undefined values)
    if (technicalScores) {
      total += calculateAverage(technicalScores);
      count += 1;
    }
    if (tacticalScores) {
      total += calculateAverage(tacticalScores);
      count += 1;
    }
    if (position === "Goalkeeper") {
      if (distributionScores) {
        total += calculateAverage(distributionScores);
        count += 1;
      }
      if (organizationScores) {
        total += calculateAverage(organizationScores);
        count += 1;
      }
    }
    if (physicalScores) {
      total += calculateAverage(physicalScores);
      count += 1;
    }

    // Calculate and return the overall average
    return count > 0 ? (total / count).toFixed(2) : "N/A";
  };

  return (
    <>


      <div className="p-6 border border-gray-300 rounded-lg font-sans">
        <button onClick={downloadPDF} className="mt-4 p-2 bg-blue-500 text-white rounded">
          Download PDF
        </button>
      </div>
      <div ref={pdfRef} className="w-full  mx-auto bg-white">
        <div className="p-6 border border-gray-300 rounded-lg font-sans" >
          {/* Evaluation Form Header - Full Width */}
          <div className="w-full mb-0">
            <div className="bg-white p-6 border border-gray-300 rounded-lg">
              <div className="flex justify-between border-b border-gray-300 pb-3 mb-0 flex-wrap">
                <h2 className="text-xl font-bold">Evaluation Form</h2>
                <div className="flex flex-col items-end">
                  {/* <span className="text-white bg-blue-500  px-3 py-2 rounded ">Completed</span> */}
                  <div
                    className=" bg-green-600 text-white text-sm w-24 h-8 leading-8 text-center rounded uppercase shadow-md cursor-pointer">
                    Completed
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Player Information and Key Information - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Player Information */}

            <div className="bg-white p-6 border border-gray-300 rounded-lg md:col-span-2 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                  {/* Review Title */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold">
                      Review Title:{" "}
                      <span className="font-normal">
                        {evaluationData?.reviewTitle || "N/A"}
                      </span>
                    </h3>
                  </div>
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
                  <div className="mt-4">
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
                </div>
                {/* RIGHT COLUMN */}
                <div className="relative">
                  {/* Overall Score Box Fixed to Top Right */}
                  <div className="absolute top-0 right-0 m-4">
                    <div className="flex flex-col items-center justify-center border rounded-xl p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg w-40">
                      <div className="text-base font-semibold mb-2">Overall Score</div>
                      <div className="bg-white text-blue-700 border-4 border-white rounded-full font-bold text-xl shadow-inner w-20 h-20 flex items-center justify-center mx-auto">
                        {calculateOverallAverage()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <fieldset className="border border-gray-300 rounded-md p-4 mb-4 mt-4">
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
        <div className="radar-chart-container px-4 py-6">
          <div
            ref={pdfRef}
            className="flex flex-col md:flex-row gap-8 items-center justify-center"
          >
            {/* Left: Radar Chart Column */}
            <div className="flex-1 min-w-[300px] max-w-[800px] h-[500px] border border-gray-300 rounded-xl shadow-md  bg-white flex flex-col items-center">
              {/* <h2 className="text-indigo-700 font-bold text-lg mb-4 text-center">Radar Chart</h2> */}
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={80} domain={[0, 10]} tickCount={11} tick={{ fontSize: 10 }} />
                  <Radar name="Player" dataKey="A" stroke="#1e40af" fill="#3b82f6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Metrics Table Column */}
            <div className="border border-gray-300 rounded-xl shadow-md p-6 bg-white flex flex-col items-center w-full md:w-auto">
              {/* <h2 className="text-teal-700 font-bold text-lg mb-4 text-center">Performance Metrics</h2> */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { title: 'Technical', value: calculateAverage(technicalScores) },
                  { title: 'Tactical', value: calculateAverage(tacticalScores) },
                  { title: 'Distribution', value: calculateAverage(distributionScores) },
                  physicalScores && { title: 'Physical', value: calculateAverage(physicalScores) },
                  organizationScores && { title: 'Organization', value: calculateAverage(organizationScores) },
                ]
                  .filter(Boolean)
                  .map((metric, index) => (
                    <div
                      key={index}
                      className="w-[160px] h-[140px] rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center shadow-md"
                    >
                      <div className="text-white font-semibold text-sm mb-2">{metric.title} Average</div>
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-xl">{metric.value}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        {/* <h1 className="p-4 text-xl font-bold mt-6 text-start text-gray-800  border-b border-gray-300">
          Goalkeeper Evaluation Form
        </h1> */}
        <div className="p-2">
                   <h1 className="p-4 text-xl font-bold mt-6 text-start text-gray-800 border-b border-gray-300">
  {evaluationData?.position?.toString() === 'Goalkeeper'
    ? 'Goalkeeper Evaluation Form'
    : 'Player Evaluation Form'}
</h1>

          <div className={`grid grid-cols-1 ${evaluationData?.position.toString() === 'Goalkeeper' ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-4 mt-6`}>
 
            {/* Technical Section */}
            <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
              {/* Heading Row */}
              <div className="bg-blue-600 text-white px-4 py-4">
                <h1 className="text-sm">Technical</h1>
              </div>
              {/* Content Section with fixed height and flex column layout */}
              <div className="p-4 flex flex-col justify-between h-[460px]">
                {/* Score List */}
                <div className="flex-grow overflow-y-auto">
                  {technicalScores ? (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {Object.entries(technicalScores).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium">{key}</span>: {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic">No Technical scores available.</p>
                  )}
                </div>
                {/* Comment Section */}
                <div className="mt-4  w-full border border-gray-300 bg-white rounded-md p-3">
                  <label htmlFor={`remarks-tech`} className="text-sm font-medium font-bold block mb-2">
                    Comments:
                  </label>
                  <div className="text-sm text-gray-700">
                    {evaluationData?.technicalRemarks || "No remarks provided."}
                  </div>
                </div>
              </div>
            </div>
            {/* Tactical Section */}
            <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
              <div className="bg-blue-600 text-white px-4 py-4">
                <h1 className="text-sm ">Tactical</h1>
              </div>
              {/* Main content wrapper to push comments to bottom */}
              <div className="p-4 flex flex-col justify-between h-[460px]"> {/* Adjust height as needed */}
                <div className="flex-grow overflow-y-auto">
                  {tacticalScores ? (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {Object.entries(tacticalScores).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium">{key}</span>: {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No Tactical scores available.</p>
                  )}
                </div>
                {/* Comment section at bottom */}
                <div className="mt-4 border border-gray-300 bg-white rounded-md p-3">
                  <label htmlFor={`remarks-tact`} className="text-sm font-medium">Comments:</label>
                  <div className="text-sm text-gray-700">
                    {evaluationData?.tacticalRemarks}
                  </div>
                </div>
              </div>
            </div>
            {evaluationData?.position.toString() === 'Goalkeeper' && (
              <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
                <div className="bg-blue-600 text-white px-4 py-4">
                  <h1 className="text-sm">Distribution</h1>
                </div>
                {/* Content section with consistent layout */}
                <div className="p-4 flex flex-col justify-between h-[460px]">
                  {/* Score List */}
                  <div className="flex-grow overflow-y-auto">
                    {distributionScores ? (
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {Object.entries(distributionScores).map(([key, value]) => (
                          <li key={key}>
                            <span className="font-medium">{key}</span>: {value}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm italic">No Distribution scores available.</p>
                    )}
                  </div>
                  {/* Comment Section */}
                  <div className="mt-4 border border-gray-300 bg-white rounded-md p-3">
                    <label htmlFor={`remarks-distribution`} className="text-sm font-medium block mb-2">
                      Comments:
                    </label>
                    <div className="text-sm text-gray-700">
                      {evaluationData?.distributionRemarks || "No remarks provided."}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
              <div className="bg-blue-600 text-white px-4 py-4">
                <h1 className="text-sm">Physical</h1>
              </div>
              <div className="p-4 flex flex-col justify-between h-[460px]">
                {/* Score List */}
                <div className="flex-grow overflow-y-auto">
                  {physicalScores ? (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {Object.entries(physicalScores).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium">{key}</span>: {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic">No physical scores available.</p>
                  )}
                </div>

                {/* Comment Section */}
                <div className="mt-4 border border-gray-300 bg-white rounded-md p-3">
                  <label htmlFor={`remarks-tech`} className="text-sm font-medium  font-bold block mb-2">
                    Comments:
                  </label>
                  <div className="text-sm text-gray-700">
                    {evaluationData?.physicalRemarks || "No remarks provided."}
                  </div>
                </div>
              </div>
            </div>
            {evaluationData?.position.toString() === 'Goalkeeper' && (
              <div className="text-black border border-gray-300 rounded-md flex flex-col overflow-hidden shadow-md">
                <div className="bg-blue-600 text-white px-4 py-4">
                  <h1 className="text-sm">Organization</h1>
                </div>
                <div className="p-4 flex flex-col justify-between h-[460px]">
                  {/* Score List */}
                  <div className="flex-grow overflow-y-auto">
                    {organizationScores ? (
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {Object.entries(organizationScores).map(([key, value]) => (
                          <li key={key}>
                            <span className="font-medium">{key}</span>: {value}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm italic">No Organization scores available.</p>
                    )}
                  </div>
                  {/* Comment Section */}
                  <div className="mt-4 border border-gray-300 bg-white rounded-md p-3">
                    <label htmlFor={`remarks-org`} className="text-sm font-medium block mb-2">Comments:</label>
                    <div className="text-sm text-gray-700">
                      {evaluationData?.organizationalRemarks || "No remarks provided."}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* <div className="p-6 space-y-12 bg-white">
          <div className="flex items-center gap-6 mt-5 mb-6">
            <h2 className="text-3xl font-bold text-gray-700">CHARACTERISTICS</h2>
            <div className="text-sm  flex gap-4 flex-wrap">
              <span className="text-yellow-400  px-2  rounded">EXCELLENT</span>
              <span className="text-cyan-400  px-2  rounded">POSITIVE</span>
              <span className="text-blue-300 px-2  rounded">NEUTRAL</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className='p-2 border border-gray-300 rounded-md '>
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
            <div className='p-2 border border-gray-300 rounded-md '>
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
            <div className='p-2 border border-gray-300 rounded-md '>
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

            <div className='p-2 border border-gray-300 rounded-md '>
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


     
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className='p-2 border border-gray-300 rounded-md '>
              <label className="block font-semibold text-gray-800 mb-2">Super Strengths:</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.superStrengths || 'N/A'}</p>
            </div>

            <div className='p-2 border border-gray-300 rounded-md '>
              <label className="block font-semibold text-gray-800 mb-2">Development Areas:</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.developmentAreas || 'N/A'}</p>
            </div>

            <div className='p-2 border border-gray-300 rounded-md '>
              <label className="block font-semibold text-gray-800 mb-2">IDP Goals:</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.idpGoals || 'N/A'}</p>
            </div>

            <div className='p-2 border border-gray-300 rounded-md '>
              <label className="block font-semibold text-gray-800 mb-2">Key Skills:</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.keySkills || 'N/A'}</p>
            </div>
          </div>

      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className='p-2 border border-gray-300 rounded-md '>
              <label className="block font-semibold text-gray-800 ">Attacking:</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.attacking || 'N/A'}</p>
            </div>

            <div className='p-2 border border-gray-300 rounded-md '>
              <label className="block font-semibold text-gray-800 ">Defending:</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.defending || 'N/A'}</p>
            </div>

            <div className='p-2 border border-gray-300 rounded-md '>
              <label className="block font-semibold text-gray-800 ">Transition Defending:</label>
              <p className="  whitespace-pre-line text-sm text-gray-800">{formData.transitionDefending || 'N/A'}</p>
            </div>

            <div className='p-2 border border-gray-300 rounded-md '>
              <label className="block font-semibold text-gray-800">Transition Attacking:</label>
              <p className=" whitespace-pre-line text-sm text-gray-800">{formData.transitionAttacking || 'N/A'}</p>
            </div>
          </div>
        </div> 


                    {/* Final Remarks Section */}
          <div className="mt-12  mb-4 grid grid-cols-2 gap-6">
            <div className="text-black p-6 border border-gray-300 rounded-lg shadow-lg">
              <label htmlFor="final-remarks" className="text-sm font-bold text-blue-600 ">
                Additional Comments:
              </label>
              <p className="text-gray-800 text-base leading-relaxed">{evaluationData?.finalRemarks}</p>
            </div>
            <div className="text-black p-6 border border-gray-300 rounded-lg shadow-lg">
              <label htmlFor="final-remarks" className="text-sm font-bold text-blue-600 ">
                Things to Work On:
              </label>
              <p className="text-gray-800 text-base leading-relaxed">{evaluationData?.thingsToWork}</p>
            </div>
          </div>
          {data && data.files && (
            <div className="w-full mx-auto p-4">
              <h1 className='p-4 text-xl font-bold mt-8 mb-4 text-start text-gray-800  '> Evaluation Documents</h1>
              <div className="space-y-4 w-full">
                {Object.entries(data.files).map(([key, file]) =>
                  file ? (
                    // Check if file size is below the 9MB limit
                    file.size && file.size > MAX_FILE_SIZE ? (
                      <div key={key} className="grid grid-cols-2 gap-4 border-b p-4 rounded">
                        <div className="text-sm flex flex-col items-start space-y-2">
                          <strong>Filename:</strong>
                          <p className="text-red-600">File size exceeds 9MB. Unable to display or download.</p>
                        </div>
                      </div>
                    ) : (
                      <div key={key} className="grid grid-cols-2 gap-4 border p-4 rounded">
                        {/* Left Column: File preview + download */}
                        <div className="text-sm flex flex-col items-start space-y-2">
                          <strong className="text-sm font-bold text-gray-900 ">Filename:</strong>

                          {file.filename.match(/\.(jpg|jpeg|png)$/i) ? (
                            <>
                              <img
                                src={file.filename}
                                alt="uploaded file"
                                className="w-32 h-32 object-cover border"
                              />
                              <a
                                href={file.filename}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-green-600"
                              >
                                <i className="fas fa-download mr-2"></i> Download
                              </a>
                            </>
                          ) : file.filename.endsWith('.pdf') ? (
                            <>
                              <img
                                src="https://www.iconpacks.net/icons/2/free-pdf-download-icon-2617-thumb.png"
                                alt="pdf icon"
                                className="w-28 h-28"
                              />
                              <a
                                href={file.filename}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-green-600"
                              >
                                <i className="fas fa-download mr-2"></i> Download
                              </a>
                              {/* <a
                      href={file.filename}
                      data-type="pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden"
                      aria-hidden="true"
                    >
                      {file.filename}
                    </a> */}
                            </>
                          ) : file.filename.match(/\.(mp4)$/i) ? (
                            <>
                              <video controls width="200" height="auto" className="rounded border">
                                <source src={file.filename} type="video/mp4" />
                              </video>
                              <a
                                href={file.filename}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-green-600"
                              >
                                <i className="fas fa-download mr-2"></i> Download
                              </a>
                            </>
                          ) : (
                            <a
                              href={file.filename}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {file.filename}
                            </a>
                          )}
                        </div>
                        {/* Right Column: Comments */}
                        <div className="text-sm">
                          <strong className="text-sm font-bold text-gray-900 ">Comments:</strong>
                          <p>{file.comments}</p>
                        </div>
                      </div>
                    )
                  ) : null
                )}
              </div>
            </div>
          )}
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
