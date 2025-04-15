import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import EvaluationProfile from "../EvaluationProfile";
import { Evaluation, EvaluationsByStatus } from "../../types/types";
import { format } from "date-fns";
import defaultImage from "../../public/default.jpg";
import { getSession, useSession } from "next-auth/react";
import { type PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { FaPhone } from "react-icons/fa";
import { fpScoreFactors, gcScoreFactors, positionOptionsList } from "@/lib/constants";
import { positionOptionsList2 } from "@/lib/constants";
import FileUploader from "../FileUploader";
import ReactQuill from "react-quill";
import sanitizeHtml from "sanitize-html";
import 'react-quill/dist/quill.snow.css';
import { showError } from '@/app/components/Toastr';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Star } from 'lucide-react';
type EvaluationFormProps = {
  evaluationId?: number | null; // Optional or null
  evaluationData?: Evaluation | null; // Update to accept Evaluation or null
  coachId?: number | null; // Optional or null
  playerId?: number | null; // Optional or null
  isOpen: boolean;
  onClose: () => void;
};

type Player = {
  id: number;
  first_name: string;
  last_name: string;
  image: string;
  position: string;
  grade_level: string;
  location: string;
  height: string;
  weight: string;
  jersey: string;
  birthday: string;
  graduation: string;
  birth_year: string;
  age_group: string;
  status: string;
  coachName?: string;
  coachLastName?: string;
  enterpriseName?: string;
};

// map start
const headerMetrics = ['Speed', 'Ablity', 'COD with ball', 'COD without ball', 'Counter Move Jump'];

const radarSkills = [
    'Receiving & 1st Touch',
    'Shots on Goal',
    'Finishing Touches',
    'Combination Play',
    'Workrate',
    'Pressing from the Front',
    '1v1 Domination',
    'Goal Threat',
    'Being a Good Teammate',
    'Decision Making',
    'No. of Touches in Final 3rd',
    'Off the Ball Movement',
    'Ability to find Space in the box',
    'Runs off the ball/Forward runs',
];
// map end

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  evaluationId,
  evaluationData,
  coachId,
  isOpen,
  onClose,
}) => {
  const [technicalRemarks, setTechnicalRemarks] = useState("");
  const [tacticalRemarks, setTacticalRemarks] = useState("");
  const [physicalRemarks, setPhysicalRemarks] = useState("");
  const [organizationalRemarks, setOrganizationalRemarks] = useState("");
  const [distributionRemarks, setDistributionRemarks] = useState("");
  const [position, setPosition] = useState("");
  const [sport, setSport] = useState("");

  const [document, setDocument] = useState("");
  const [finalRemarks, setFinalRemarks] = useState("");
  const [thingsToWork, setThingsToWork] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [loadSubmit, setLoadSubmit] = useState<boolean>(false);
  const [playerID, setPlayerID] = useState<number | undefined>(undefined); // Allowing for undefined
  const [coachID, setCoachID] = useState<number | undefined>(undefined);
  const { data: session } = useSession();
  const [errors, setErrors] = useState<{
    technicalRemarks: boolean;
    tacticalRemarks: boolean;
    physicalRemarks: boolean;
    distributionRemarks: boolean;
    organizationRemarks: boolean;
    finalRemarks: boolean;
    sport: boolean;
    position: boolean;
    thingsToWorkOnRemarks: boolean;
    technicalScores: boolean;
    physicalScores: boolean;
    distributionScores: boolean;
    organizationScores: boolean;
    tacticalScores: boolean;
  }>({
    technicalRemarks: false,
    tacticalRemarks: false,
    physicalRemarks: false,
    distributionRemarks: false,
    organizationRemarks: false,
    finalRemarks: false,
    sport: false,
    position: false,
    thingsToWorkOnRemarks: false,
    technicalScores: false,
    physicalScores: false,
    organizationScores: false,
    distributionScores: false,
    tacticalScores: false
  });
  const [scoreFactors, setScoreFactors] = useState<{
    technical: { id: string, label: string, options: string[] }[],
    tactical: { id: string, label: string, options: string[] }[],
    physical: { id: string, label: string, options: string[] }[],
    distribution: { id: string, label: string, options: string[] }[],
    organization: { id: string, label: string, options: string[] }[],
  }>({
    technical: [],
    tactical: [],
    physical: [],
    distribution: [],
    organization: []
  })
  const [technicalScores, setTechnicalScores] = useState<{ [key: string]: string }>({});
  const [tacticalScores, setTacticalScores] = useState<{ [key: string]: string }>({});
  const [physicalScores, setPhysicalScores] = useState<{ [key: string]: string }>({});
  const [distributionScores, setDistributionScores] = useState<{ [key: string]: string }>({});
  const [organizationScores, setOrganizationScores] = useState<{ [key: string]: string }>({});


  const formattedDate = evaluationData?.created_at
    ? format(new Date(evaluationData.created_at), "MM/dd/yyyy")
    : "";

  useEffect(() => {
    setTechnicalScores(() =>
      Object.fromEntries((position === "Goalkeeper" ? gcScoreFactors.technical : fpScoreFactors.technical).map((tech: any) => [tech.label, "N/A"]))
    );
    setTacticalScores(() =>
      Object.fromEntries((position === "Goalkeeper" ? gcScoreFactors.tactical : fpScoreFactors.tactical).map((tact: any) => [tact.label, "N/A"]))
    );
    setPhysicalScores(() =>
      Object.fromEntries((position === "Goalkeeper" ? gcScoreFactors.physical : fpScoreFactors.physical).map((phys: any) => [phys.label, "N/A"]))
    );
    setDistributionScores(() =>
      Object.fromEntries((position === "Goalkeeper" ? gcScoreFactors.distribution : fpScoreFactors.distribution).map((dis: any) => [dis.label, "N/A"]))
    );
    setOrganizationScores(() =>
      Object.fromEntries((position === "Goalkeeper" ? gcScoreFactors.organization : fpScoreFactors.organization).map((org: any) => [org.label, "N/A"]))
    );

    setTechnicalRemarks("");
    setTacticalRemarks("");
    setPhysicalRemarks("");
    setFinalRemarks("");
    setThingsToWork("")

    evaluationData?.evaluationId != null ? fetchEvaluationResultData() : "";
  }, [evaluationData]);

  useEffect(() => {
    setScoreFactors(() => ({
      technical: position === "Goalkeeper" ? [...gcScoreFactors.technical] : [...fpScoreFactors.technical],
      tactical: position === "Goalkeeper" ? [...gcScoreFactors.tactical] : [...fpScoreFactors.tactical],
      distribution: position === "Goalkeeper" ? [...gcScoreFactors.distribution] : [...fpScoreFactors.distribution],
      physical: position === "Goalkeeper" ? [...gcScoreFactors.physical] : [...fpScoreFactors.physical],
      organization: position === "Goalkeeper" ? [...gcScoreFactors.organization] : [...fpScoreFactors.organization],
    }));
  }, [position]);

  // Handle Save Draft
  const onSaveAsDraft = () => {
    if (evaluationData) {
      setPlayerID(evaluationData.playerId);
      setCoachID(evaluationData.coachId);
    } else {
      console.error("evaluationData is null or undefined");
      onClose();
      // Handle the case where evaluationData is not available
    }

    const evaluationDatas = {
      evaluationId,
      coachId,
      playerId,
      technicalScores,
      tacticalScores,
      distributionScores,
      organizationScores,
      physicalScores,
      technicalRemarks: cleanHtml(technicalRemarks),
      tacticalRemarks,
      physicalRemarks,
      organizationalRemarks,
      distributionRemarks,
      finalRemarks,
      document,
      position,
      sport,
      thingsToWork
    };

    fetch("/api/coach/evaluations/save?status=4", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evaluationDatas),
    })
      .then((response) => response.json())
      .then((data) => {
        onClose();
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadSubmit(true);

    if (evaluationData) {
      setPlayerID(evaluationData.playerId);
      setCoachID(evaluationData.coachId);
    } else {
      console.error("evaluationData is null or undefined");
      setLoadSubmit(false);
      onClose();
    }

    const errorMessages = [
      { field: "technicalRemarks", message: "Technical remarks are required." },
      { field: "tacticalRemarks", message: "Tactical remarks are required." },
      { field: "physicalRemarks", message: "Physical remarks are required." },
      { field: "finalRemarks", message: "Final remarks are required." },
      { field: "sport", message: "Please select a sport." },
      { field: "position", message: "Please select a position." },
      { field: "thingsToWorkOnRemarks", message: "Things to work on remarks are required." },
      { field: "distributionRemarks", message: "Distribution remarks are required for Goalkeepers." },
      { field: "organizationRemarks", message: "Organizational remarks are required for Goalkeepers." },
      { field: "technicalScores", message: "At least one technical score must be selected." },
      { field: "tacticalScores", message: "At least one tactical score must be selected." },
      { field: "physicalScores", message: "At least one physical score must be selected." },
      { field: "organizationScores", message: "At least one organization score must be selected for Goalkeepers." },
      { field: "distributionScores", message: "At least one distribution score must be selected for Goalkeepers." }
    ];
    const validationErrors = {
      technicalRemarks: technicalRemarks.trim() === "",
      tacticalRemarks: tacticalRemarks.trim() === "",
      physicalRemarks: physicalRemarks.trim() === "",
      finalRemarks: finalRemarks.trim() === "",
      sport: sport === "",
      position: position === "",
      thingsToWorkOnRemarks: thingsToWork === "",
      distributionRemarks: position === "Goalkeeper" && distributionRemarks === "",
      organizationRemarks: position === "Goalkeeper" && organizationalRemarks === "",
      technicalScores: Object.values(technicalScores).every((value) => value === "N/A"),
      tacticalScores: Object.values(tacticalScores).every((value) => value === "N/A"),
      physicalScores: Object.values(physicalScores).every((value) => value === "N/A"),
      organizationScores: position === "Goalkeeper" && Object.values(organizationScores).every((value) => value === "N/A"),
      distributionScores: position === "Goalkeeper" && Object.values(distributionScores).every((value) => value === "N/A")
    };

    errorMessages.forEach(({ field, message }) => {
      if ((validationErrors as Record<string, boolean>)[field]) {
        showError(message);
      }
    });

    setErrors(validationErrors);

    if (Object.values(validationErrors).some((isError) => isError)) {
      setLoadSubmit(false);
      return;
    }

    const evaluationDatas = {
      evaluationId,
      coachId,
      playerId,
      technicalScores,
      tacticalScores,
      distributionScores,
      organizationScores,
      physicalScores,
      technicalRemarks: cleanHtml(technicalRemarks),
      tacticalRemarks,
      physicalRemarks,
      organizationalRemarks,
      distributionRemarks,
      finalRemarks,
      document,
      position,
      sport,
      thingsToWork,
    };


    // Send the data to an API
    fetch("/api/coach/evaluations/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evaluationDatas),
    })
      .then((response) => response.json())
      .then((data) => {
        onClose();

        window.location.reload();
      })
      .catch((error) => {
        setLoadSubmit(false);
        console.error("Error:", error);
      });
  };

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
      setPosition(data.result?.position != null ? data.result?.position : "Goalkeeper");

      if (data.result) {
        handleUpdateEvaluationData(data);
      }

    } catch (error) {
      console.error("Error fetching evaluation data:", error);
    }
  };

  // Handle Saving data
  const handleUpdateEvaluationData = async (data: any) => {
    const datas = data.result;
    const technicalScoresJson = JSON.parse(datas.technicalScores);
    const tacticalScoresJson = JSON.parse(datas.tacticalScores);
    const physicalScoresJson = JSON.parse(datas.physicalScores);
    const distributionScoresJson = JSON.parse(datas.distributionScores);
    const organizationScoresJson = JSON.parse(datas.organizationScores);

    setDistributionScores({
      ...Object.fromEntries(
        scoreFactors.distribution.map((dis: any) => [
          dis.label,
          distributionScoresJson?.[dis.label] || "0",
        ])
      ),
    });

    setTechnicalScores({
      ...Object.fromEntries(
        scoreFactors.technical.map((tech: any) => [
          tech.label,
          technicalScoresJson?.[tech.label] || "0",
        ])
      ),
    });

    setTacticalScores({
      ...Object.fromEntries(
        scoreFactors.tactical.map((tact: any) => [
          tact.label,
          tacticalScoresJson?.[tact.label] || "0",
        ])
      ),
    });

    setPhysicalScores({
      ...Object.fromEntries(
        scoreFactors.physical.map((phys: any) => [
          phys.label,
          physicalScoresJson?.[phys.label] || "0",
        ])
      ),
    });

    setOrganizationScores({
      ...Object.fromEntries(
        scoreFactors.organization.map((orgs: any) => [
          orgs.label,
          organizationScoresJson?.[orgs.label] || "0",
        ])
      ),
    });

    setTechnicalRemarks(datas.technicalRemarks || "");
    setTacticalRemarks(datas.tacticalRemarks || "");
    setPhysicalRemarks(datas.physicalRemarks || "");
    setFinalRemarks(datas.finalRemarks || "");
    setThingsToWork(datas.thingsToWork || "")
    setSport(datas.sport);
    setDistributionRemarks(datas.distributionRemarks || "");
    setOrganizationalRemarks(datas.organizationalRemarks || "")
  }

  // Handle document update
  const handleDocumentChange = async () => {
    if (!fileInputRef.current?.files) {
      throw new Error("No file selected");
    }
    setFileUploading(true);
    const file = fileInputRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/uploads/documentupload",
      });
      setFileUploading(false);
      const imageUrl = newBlob.url;
      setDocument(imageUrl);
    } catch (error) {
      setFileUploading(false);
      console.error("Error uploading file:", error);
    }
  };

 if (!isOpen) return null;
  const handlePositionChange = (event: any) => {
    setPosition(event.target.value);
  };
  const cleanHtml = (html: string) => {
    return sanitizeHtml(html, {
      allowedTags: [
        "b", "i", "u", "s", "p", "h1", "h2", "h3", "h4", "h5", "h6",
        "blockquote", "code", "pre", "ul", "ol", "li", "a", "img", "span", "strong", "br", "em"
      ],
      allowedAttributes: {
        "a": ["href", "target", "rel"],
        "img": ["src", "alt"],
        "span": ["style"],
        "*": ["class", "className"]
      },
      allowedStyles: {
        "*": {
          // Allow color and background-color
          "color": [/^#(0-9a-fA-F){3,6}$/],
          "background-color": [/^#(0-9a-fA-F){3,6}$/]
        }
      }
    });
  };



// player start


const [playerId, setPlayerId] = useState('');
const [data, setData] = useState<null | { player: Player }>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const handleSearch = async () => {
  setError(null);
  setLoading(true);
  setData(null);
  try {
    const res = await fetch(`/api/player/${playerId}`);
    if (!res.ok) throw new Error(`Player not found (ID: ${playerId})`);
    const result = await res.json();
    setData(result);
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
};
// end player

// map start
const [headerRatings, setHeaderRatings] = useState<number[]>(Array(headerMetrics.length).fill(7));
const [skillRatings, setSkillRatings] = useState<number[]>([
    7, 8, 8, 8, 7, 6, 7, 9, 9, 8, 8, 8, 8, 8,
]);

const handleHeaderRatingChange = (index: number, value: number) => {
    const newRatings = [...headerRatings];
    newRatings[index] = value;
    setHeaderRatings(newRatings);
};

const handleSkillRatingChange = (index: number, value: number) => {
    const newRatings = [...skillRatings];
    newRatings[index] = value;
    setSkillRatings(newRatings);
};

const chartData = radarSkills.map((label, i) => ({
    subject: label,
    A: skillRatings[i],
}));
// map end


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full  max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">Please take an action!</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-6 border border-gray-300 rounded-lg font-sans">
              {/* Evaluation Form Header - Full Width */}
              <div className="w-full mb-0">
                <div className="bg-white p-6 border border-gray-300 rounded-lg">
                  <div className="flex justify-between border-b border-gray-300 pb-3 mb-0 flex-wrap">
                    <h2 className="text-xl font-bold">Evaluation Form</h2>
                    <div className="flex flex-col items-end">
                      <span className="bg-cyan-100 text-teal-800 px-3 py-1 rounded mb-2">
                        Accepted
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Player Information */}
                <div className="bg-white p-6 border border-gray-300 rounded-lg md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">
                    Review Title:{" "}
                    <span className="font-normal">
                      {evaluationData?.review_title}
                    </span>
                  </h3>
                  <div className="flex items-center mb-4">
                    <strong className="mr-2">Player:</strong>
                    {evaluationData?.image &&
                      evaluationData?.image !== "null" && (
                        <Image
                          src={evaluationData?.image}
                          alt="Player Avatar"
                          className="w-12 h-12 mr-3 rounded-full object-cover"
                          width={30}
                          height={30}
                        />
                      )}
                    {(!evaluationData?.image ||
                      evaluationData?.image === "null") && (
                        <Image
                          src={defaultImage}
                          alt="Player Avatar"
                          className="w-12 h-12 mr-3 rounded-full object-cover"
                          width={30}
                          height={30}
                        />
                      )}
                    {/* {evaluationData?.image ? (
                <Image
                    src={evaluationData.image}
                    alt="Player Avatar"
                    className='w-12 h-12 mr-3 rounded-full object-cover'
                    width={30}
                    height={30}
                />
            ) : (
                <div>No Image Available</div>
            )} */}
                    <span className="text-gray-700">
                      <a
                        href={`/players/${evaluationData?.playerSlug}`}
                        className=" text-blue-700"
                        target="_blank"
                      >
                        {evaluationData?.first_name} {evaluationData?.last_name}
                      </a>
                    </span>
                  </div>
                  {!session?.user.club_id && (
                    <div className="mb-4">
                      <strong className="mr-2">Evaluation Rate:</strong>{" "}
                      <span>${evaluationData?.expectedCharge}</span>
                    </div>
                  )}

                  <div className="mb-4">
                    <strong className="mr-2">Date Requested:</strong>{" "}
                    <span>{formattedDate}</span>
                  </div>

                  <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
                    <legend className="text-lg font-semibold text-gray-700">
                      Video 1
                    </legend>
                    <div className="mb-4">
                      <strong className="mr-2">Link:</strong>{" "}
                      <a
                        href={evaluationData?.primary_video_link}
                        className="text-blue-500"
                        target="_blank"
                      >
                        Link to video
                      </a>{" "}
                      <span className="mx-2">|</span>
                      <strong>Length:</strong> {evaluationData?.videoOneTiming}{" "}
                      min.
                      <span className="mx-2">|</span>
                      <strong>Jersey Color:</strong>{" "}
                      {evaluationData?.jerseyColorOne}
                      <span className="mx-2">|</span>
                      <strong>Jersey Number:</strong>{" "}
                      {evaluationData?.jerseyNumber}{" "}
                      <span className="mx-2">|</span>
                      <strong>Position(s):</strong>{" "}
                      {evaluationData?.positionOne}
                    </div>
                    <div className="mb-4">
                      <strong>Description: </strong>
                      {evaluationData?.video_description}
                    </div>
                  </fieldset>

                  {evaluationData?.video_link_two && (
                    <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
                      <legend className="text-lg font-semibold text-gray-700">
                        Video 2
                      </legend>

                      <div className="mb-4">
                        <strong className="mr-2">Link:</strong>{" "}
                        <a
                          href={evaluationData?.video_link_two}
                          className="text-blue-500"
                          target="_blank"
                        >
                          Link to video
                        </a>{" "}
                        <span className="mx-2">|</span>
                        <strong>Length:</strong>{" "}
                        {evaluationData?.videoTwoTiming} min.
                        <span className="mx-2">|</span>
                        <strong>Jersey Color:</strong>{" "}
                        {evaluationData?.jerseyColorTwo}
                        <span className="mx-2">|</span>
                        <strong>Jersey Number:</strong>{" "}
                        {evaluationData?.jerseyNumberTwo}{" "}
                        <span className="mx-2">|</span>
                        <strong>Position:</strong> {evaluationData?.positionTwo}
                      </div>

                      <div className="mb-4">
                        <strong>Description: </strong>
                        {evaluationData?.video_descriptionTwo}
                      </div>
                    </fieldset>
                  )}
                  {evaluationData?.video_link_three && (
                    <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
                      <legend className="text-lg font-semibold text-gray-700">
                        Video 3
                      </legend>

                      <div className="mb-4">
                        <strong className="mr-2">Link:</strong>{" "}
                        <a
                          href={evaluationData?.video_link_three}
                          className="text-blue-500"
                          target="_blank"
                        >
                          Link to video
                        </a>{" "}
                        <span className="mx-2">|</span>
                        <strong>Length:</strong>{" "}
                        {evaluationData?.videoThreeTiming} min.
                        <span className="mx-2">|</span>
                        <strong>Jersey Color:</strong>{" "}
                        {evaluationData?.jerseyColorThree}
                        <span className="mx-2">|</span>
                        <strong>Jersey Number:</strong>{" "}
                        {evaluationData?.jerseyNumberThree}{" "}
                        <span className="mx-2">|</span>
                        <strong>Position(s):</strong>{" "}
                        {evaluationData?.positionThree}
                      </div>
                      <div className="mb-4">
                        <strong>Description: </strong>
                        {evaluationData?.video_descriptionThree}
                      </div>
                    </fieldset>
                  )}
                  {/* <div className="mb-4">
            <strong className="mr-2">Position:</strong>{evaluationData?.evaluationposition}  <strong className="mr-2">Game Light:</strong>{evaluationData?.lighttype}  <strong className="mr-2">Part of Game:</strong>{evaluationData?.percentage} %
        </div> */}
                </div>

                {/* Key Information */}
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
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                {/* First select with increased width */}
                <div className="flex flex-col w-1/2 md:w-1/4">
                  <label className="text-sm font-medium mb-1">
                    Select Sport
                    <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                  </label>
                  <select
                    className="border p-2 rounded w-full"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Soccer">Soccer</option>
                  </select>
                  <p className="text-red-500 text-sm h-5">{errors.sport ? "Required." : ""}</p>
                </div>

                {/* Second select */}
                <div className="flex flex-col w-full md:w-1/4">
                  <label className="text-sm font-medium mb-1">
                    Select Position
                    <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                  </label>
                  <select
                    className="border p-2 rounded w-full"
                    value={position}
                    onChange={handlePositionChange}
                  >
                    <option value="">Select</option>
                    {positionOptionsList2.map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-red-500 text-sm h-5">{errors.position ? "Required." : ""}</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              {position !== "Goalkeeper" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {/* Technical Section */}
                  <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <h1 className="text-xl mb-4">
                      Technical
                      <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                    </h1>
                    <p className="text-red-500 text-sm h-5">{errors.technicalScores ? "Required." : "Required..."}</p>

                    <div className="space-y-4 flex-grow">
                      {scoreFactors.technical.map((tech: any) => (
                        <div
                          key={tech.id}
                          className="flex items-center space-x-2"
                        >
                          <select
                            id={`dropdown-tech-${tech.id}`}
                            className="border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20"
                            value={technicalScores[tech.label]}
                            onChange={(e) =>
                              setTechnicalScores((prev) => ({
                                ...prev,
                                [tech.label]: e.target.value,
                              }))
                            }
                          >
                            {tech.options.map((option: any, index: any) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <label
                            htmlFor={`dropdown-tech-${tech.id}`}
                            className="text-sm font-medium"
                          >
                            {tech.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <label
                      htmlFor={`remarks-tech`}
                      className="mt-4 text-sm font-medium"
                    >
                      Commentary:
                      <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                    </label>
                    <textarea
                      id={`remarks-tech`}
                      value={technicalRemarks}
                      className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                      rows={3}
                      placeholder="Noting time stamps appropriately is extremely helpful"
                      onChange={(e) => {
                        const words = e.target.value
                          .split(/\s+/)
                          .filter((word) => word.length > 0); // Count non-empty words
                        if (words.length <= 500) {
                          setTechnicalRemarks(e.target.value); // Update the value if within limit
                        }
                      }}
                    />
                    {/* {<ReactQuill 
                      theme="snow" 
                      value={technicalRemarks} 
                      onChange={(e) => {
                        console.log(e)
                        setTechnicalRemarks(e)
                      }}
                    />} */}
                    {/* {errors.technicalRemarks && (
                      <p className="text-red-500 text-sm">Required.</p>
                    )} */}
                    <p className="text-red-500 text-sm h-5">{errors.technicalRemarks ? "Required." : ""}</p>
                  </div>

                  {/* Tactical Section */}
                  <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <div className="mb-4">
                      <h1 className="text-xl">
                        Tactical
                        <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                      </h1>
                      <p className="text-red-500 text-sm h-5">{errors.tacticalScores ? "Required." : ""}</p>
                    </div>
                    <div className="space-y-4 flex-grow">
                      {scoreFactors.tactical.map((tact: any) => (
                        <div
                          key={tact.id}
                          className="flex items-center space-x-2"
                        >
                          <select
                            id={`dropdown-tact-${tact.id}`}
                            className="border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20"
                            value={tacticalScores[tact.label]}
                            onChange={(e) =>
                              setTacticalScores((prev) => ({
                                ...prev,
                                [tact.label]: e.target.value,
                              }))
                            }
                          >
                            {tact.options.map((option: any, index: any) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <label
                            htmlFor={`dropdown-tact-${tact.id}`}
                            className="text-sm font-medium"
                          >
                            {tact.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <label
                      htmlFor={`remarks-tact`}
                      className="mt-4 text-sm font-medium"
                    >
                      Commentary:
                      <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                    </label>
                    <textarea
                      id={`remarks-tact`}
                      className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                      rows={3}
                      value={tacticalRemarks}
                      placeholder="Noting time stamps appropriately is extremely helpful"
                      onChange={(e) => {
                        const words = e.target.value
                          .split(/\s+/)
                          .filter((word) => word.length > 0); // Count non-empty words
                        if (words.length <= 500) {
                          setTacticalRemarks(e.target.value); // Update the value if within limit
                        }
                      }}
                    />
                    {/* {errors.tacticalRemarks && (
                      <p className="text-red-500 text-sm">Required.</p>
                    )} */}
                    <p className="text-red-500 text-sm h-5">{errors.tacticalRemarks ? "Required." : ""}</p>

                  </div>

                  {/* Physical Section */}
                  <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <div className="mb-4">
                      <h1 className="text-xl">
                        Physical
                        <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                      </h1>
                      <p className="text-red-500 text-sm h-5">{errors.physicalScores ? "Required." : ""}</p>
                    </div>
                    <div className="space-y-4 flex-grow">
                      {scoreFactors.physical.map((phys: any) => (
                        <div
                          key={phys.id}
                          className="flex items-center space-x-2"
                        >
                          <select
                            id={`dropdown-phys-${phys.id}`}
                            className="border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20"
                            value={physicalScores[phys.label]}
                            onChange={(e) =>
                              setPhysicalScores((prev) => ({
                                ...prev,
                                [phys.label]: e.target.value,
                              }))
                            }
                          >
                            {phys.options.map((option: any, index: any) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <label
                            htmlFor={`dropdown-phys-${phys.id}`}
                            className="text-sm font-medium"
                          >
                            {phys.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <label
                      htmlFor={`remarks-phys`}
                      className="mt-4 text-sm font-medium"
                    >
                      Commentary:
                      <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                    </label>
                    <textarea
                      id={`remarks-phys`}
                      className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                      rows={3}
                      value={physicalRemarks}
                      placeholder="Noting time stamps appropriately is extremely helpful"
                      onChange={(e) => {
                        const words = e.target.value
                          .split(/\s+/)
                          .filter((word) => word.length > 0); // Count non-empty words
                        if (words.length <= 500) {
                          setPhysicalRemarks(e.target.value); // Update the value if within limit
                        }
                      }}
                    />
                    {/* {errors.physicalRemarks && (
                      <p className="text-red-500 text-sm">Required.</p>
                    )} */}
                    <p className="text-red-500 text-sm h-5">{errors.physicalRemarks ? "Required." : ""}</p>
                  </div>
                </div>
              )}

<div className="grid grid-cols-12 gap-4 md:gap-6">
<div className="col-span-12 space-y-6 xl:col-span-7 w-[1000px]">
{/* player individuals */}
<div className="p-8 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🔍 Search Player By ID</h1>

      <div className="flex gap-4 items-center mb-6">
        <input
          type="number"
          placeholder="Enter Player ID"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg w-64 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-blue-600 font-medium">Loading...</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {data?.player && (
        <div className="bg-white shadow-xl rounded-2xl p-6">
          <div className="flex items-center gap-6 mb-4">
            <img
              src={data.player.image || '/default-avatar.png'}
              alt="Player"
              className="w-32 h-32 object-cover rounded-xl border"
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {data.player.first_name} {data.player.last_name}
              </h2>
              <p className="text-gray-600">{data.player.position} · Grade {data.player.grade_level}</p>
              <p className="text-sm text-gray-500">Status: {data.player.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p><strong>Location:</strong> {data.player.location}</p>
            <p><strong>Height:</strong> {data.player.height} cm</p>
            <p><strong>Weight:</strong> {data.player.weight} kg</p>
            <p><strong>Jersey:</strong> #{data.player.jersey}</p>
            <p><strong>Birthday:</strong> {data.player.birthday}</p>
            <p><strong>Graduation:</strong> {data.player.graduation}</p>
            <p><strong>Age Group:</strong> {data.player.age_group}</p>
            <p><strong>Birth Year:</strong> {data.player.birth_year}</p>
            <p><strong>Coach:</strong> {data.player.coachName} {data.player.coachLastName}</p>
            <p><strong>Enterprise:</strong> {data.player.enterpriseName}</p>
          </div>

          {/* Collapsible Sections
          {['evaluations', 'earnings', 'payments', 'evaluationResults'].map((section) => (
            <div key={section} className="mt-6">
              <button
                onClick={() => toggleSection(section)}
                className="flex justify-between items-center w-full text-left text-lg font-medium text-blue-600 hover:text-blue-800 transition"
              >
                {section === 'evaluationResults'
                  ? 'Evaluation Results'
                  : section.charAt(0).toUpperCase() + section.slice(1)}
                {expandedSection === section ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSection === section && (
                <pre className="mt-2 p-4 bg-gray-100 rounded-xl overflow-auto text-sm max-h-64">
                  {JSON.stringify((data as any)[section], null, 2)}
                </pre>
              )}
            </div>
          ))} */}
        </div>
      )}
    </div>
{/* end */}


{/* map start */}


<div className="p-4 bg-white rounded-xl shadow-lg ">
            {/* Top Section: Header metrics */}
            <div className="w-fit bg-white p-4 rounded-xl shadow">
                <table className="table-auto border-collapse  border-gray-300">
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
                            {headerMetrics.map((_, index) => (
                                <td key={index} className="px-4 py-2 border border-gray-300 bg-white">
                                    <div
                                        className="flex justify-center gap-1"
                                        onDoubleClick={() => handleHeaderRatingChange(index, 0)}
                                    >
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={`cursor-pointer transition ${headerRatings[index] > i
                                                        ? 'fill-yellow-400 stroke-yellow-400'
                                                        : 'stroke-gray-300'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // prevent double-click event
                                                    handleHeaderRatingChange(index, i + 1);
                                                }}
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
                {/* Sidebar with skill values */}
                <div className="flex flex-col gap-2 w-[250px]">
                    {radarSkills.map((label, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                            <label className="text-sm text-gray-700 w-[180px]">{label}</label>
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
                            <PolarRadiusAxis angle={80} domain={[0, 2, 3, 4, 5, 6, 7, 8, 9, 10]} tickCount={10}

                            />
                            <Radar
                                name="Player"
                                dataKey="A"
                                stroke="#1e40af"
                                fill="#3b82f6"
                                fillOpacity={0.5}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
{/* map end */}



  </div>
  </div>

             







            
              
              <div className="flex justify-end space-x-2 pt-6">
                <button
                  type="submit"
                  className="mt-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  {loadSubmit ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
                <button
                  type="button"
                  className="mt-2 bg-red-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                  onClick={onSaveAsDraft}
                >
                  Save Draft
                </button>

                <button
                  onClick={onClose}
                  className="mt-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded hover:bg-gray-700 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EvaluationForm;
