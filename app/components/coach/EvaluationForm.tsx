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
import { useRouter } from 'next/navigation';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Files, Star } from 'lucide-react';
import sanitizeHtml from "sanitize-html";
import 'react-quill/dist/quill.snow.css';
import { showError } from '@/app/components/Toastr';
import Swal from 'sweetalert2';

const position = "Goalkeeper"; // or any dynamic value

const headerMetrics =
  position === "Goalkeeper"
    ? 
  ['Technical Average', 'Tactical Average', 'Distribution Average', 'Physical Average', 'Organization Average']
: ['Technical Average', 'Tactical Average', 'Physical Average'];

const radarSkills =
  position === "Goalkeeper"
    ? 
  [
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




type EvaluationFormProps = {
  evaluationId?: number | null; // Optional or null
  evaluationData?: Evaluation | null; // Update to accept Evaluation or null
  coachId?: number | null; // Optional or null
  playerId?: number | null; // Optional or null
  isOpen: boolean;
  onClose: () => void;
};

enum modeTypes {
  Add,
  Edit
}

// Mode: Add/Edit
// Position: Null/Select
// showDefaultForm(Goalkeeper)
// On submit call add

// On change role
// Pop up : You can only fill up 1 of the form
// Position: position
// ShowDefaultForm(position)

// showDefaultForm: Position
// clear form
// load useState
// render form

// More: Edit
// need to preserve Mode and Id of Evaluation for edit.
// Position: position
// showDefaultForm(position)
// fill up the values
// onSubmit call update
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
    <option value="" className="font-bold">Select</option>
    <option value="EXCELLENT" className=" text-black text-xs ">EXCELLENT</option>
    <option value="POSITIVE" className=" text-black text-xs ">POSITIVE</option>
    <option value="NEUTRAL" className=" text-black text-xs ">NEUTRAL</option>
  </select>
);

const EvaluationForm: React.FC<EvaluationFormProps> = ({
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
  // Remarks
  const [technicalRemarks, setTechnicalRemarks] = useState("");
  const [tacticalRemarks, setTacticalRemarks] = useState("");
  const [physicalRemarks, setPhysicalRemarks] = useState("");
  const [organizationalRemarks, setOrganizationalRemarks] = useState("");
  const [distributionRemarks, setDistributionRemarks] = useState("");
  const [finalRemarks, setFinalRemarks] = useState("");
  const [thingsToWork, setThingsToWork] = useState("");
  const [filename, setFilename] = useState('');
  const router = useRouter();

  const [position, setPosition] = useState("Goalkeeper");
  const [sport, setSport] = useState("");

  const [document, setDocument] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileUploading, setFileUploading] = useState<{ [key: number]: boolean }>({});
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
  const [mode, setMode] = useState<modeTypes>(modeTypes.Add);
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [comments, setComments] = useState<string[]>([]);
  const [fields, setFields] = useState([0]); 

  const [documents, setDocuments] = useState<string[]>([]);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  //   const [fileInputRefs, setFileInputRefs] = useState<React.RefObject<HTMLInputElement>[]>([
  //     useRef<HTMLInputElement>(null),
  //  ]);
  const validationErrors = {
    technicalRemarks: technicalRemarks.trim() === "",
    tacticalRemarks: tacticalRemarks.trim() === "",
    physicalRemarks: physicalRemarks.trim() === "",
    finalRemarks: finalRemarks.trim() === "",
    sport: sport === "",
    position: position === "",
    thingsToWorkOnRemarks: thingsToWork.trim() === "",
    distributionRemarks: position === "Goalkeeper" && distributionRemarks.trim() === "",
    organizationRemarks: position === "Goalkeeper" && organizationalRemarks.trim() === "",
    technicalScores: Object.values(technicalScores).every(value => value === "N/A"),
    tacticalScores: Object.values(tacticalScores).every(value => value === "N/A"),
    physicalScores: Object.values(physicalScores).every(value => value === "N/A"),
    organizationScores: position === "Goalkeeper" && Object.values(organizationScores).every(value => value === "N/A"),
    distributionScores: position === "Goalkeeper" && Object.values(distributionScores).every(value => value === "N/A"),
  };

  const formattedDate = evaluationData?.created_at
    ? format(new Date(evaluationData.created_at), "MM/dd/yyyy")
    : "";

  useEffect(() => {
    const isGoalkeeper = position === "Goalkeeper";
    const techFactors = isGoalkeeper ? gcScoreFactors.technical : fpScoreFactors.technical;
    const tactFactors = isGoalkeeper ? gcScoreFactors.tactical : fpScoreFactors.tactical;
    const physFactors = isGoalkeeper ? gcScoreFactors.physical : fpScoreFactors.physical;
    const distFactors = isGoalkeeper ? gcScoreFactors.distribution : fpScoreFactors.distribution;
    const orgFactors = isGoalkeeper ? gcScoreFactors.organization : fpScoreFactors.organization;

    const emptyScores = (factors: any[]) =>
      Object.fromEntries(factors.map((item: any) => [item.label, "N/A"]));

    setTechnicalScores(emptyScores(techFactors));
    setTacticalScores(emptyScores(tactFactors));
    setPhysicalScores(emptyScores(physFactors));
    setDistributionScores(emptyScores(distFactors));
    setOrganizationScores(emptyScores(orgFactors));

    setTechnicalRemarks("");
    setTacticalRemarks("");
    setPhysicalRemarks("");
    setFinalRemarks("");
    setThingsToWork("");

    const saved = localStorage.getItem('submittedEvaluations');
    if (saved) {
      setSubmittedEvaluations(JSON.parse(saved));
    }

    if (evaluationData?.evaluationId) {
      fetchEvaluationResultData();
    }
  }, [evaluationData]);

  useEffect(() => {
    const isGoalkeeper = position === "Goalkeeper";

    setScoreFactors({
      technical: isGoalkeeper ? [...gcScoreFactors.technical] : [...fpScoreFactors.technical],
      tactical: isGoalkeeper ? [...gcScoreFactors.tactical] : [...fpScoreFactors.tactical],
      distribution: isGoalkeeper ? [...gcScoreFactors.distribution] : [...fpScoreFactors.distribution],
      physical: isGoalkeeper ? [...gcScoreFactors.physical] : [...fpScoreFactors.physical],
      organization: isGoalkeeper ? [...gcScoreFactors.organization] : [...fpScoreFactors.organization],
    });

    if (evaluationData?.evaluationId) {
      setMode(modeTypes.Edit);
      fetchEvaluationResultData();
    } else {
      setMode(modeTypes.Add);
      showDefaultForm(null);
    }
  }, [evaluationData]);

  const showDefaultForm = async (position: "Goalkeeper" | "Field Player" | null) => {
    const isFP = position === "Field Player";

    const getScores = (factor: any[]) =>
      Object.fromEntries(factor.map((item: any) => [item.label, "N/A"]));

    setScoreFactors({
      technical: isFP ? [...fpScoreFactors.technical] : [...gcScoreFactors.technical],
      tactical: isFP ? [...fpScoreFactors.tactical] : [...gcScoreFactors.tactical],
      distribution: isFP ? [...fpScoreFactors.distribution] : [...gcScoreFactors.distribution],
      physical: isFP ? [...fpScoreFactors.physical] : [...gcScoreFactors.physical],
      organization: isFP ? [...fpScoreFactors.organization] : [...gcScoreFactors.organization],
    });

    setTechnicalScores(getScores(isFP ? fpScoreFactors.technical : gcScoreFactors.technical));
    setTacticalScores(getScores(isFP ? fpScoreFactors.tactical : gcScoreFactors.tactical));
    setPhysicalScores(getScores(isFP ? fpScoreFactors.physical : gcScoreFactors.physical));
    setDistributionScores(getScores(isFP ? fpScoreFactors.distribution : gcScoreFactors.distribution));
    setOrganizationScores(getScores(isFP ? fpScoreFactors.organization : gcScoreFactors.organization));

    setTechnicalRemarks("");
    setTacticalRemarks("");
    setPhysicalRemarks("");
    setOrganizationalRemarks("");
    setDistributionRemarks("");
    setFinalRemarks("");
    setThingsToWork("");
  };

  const fetchEvaluationResultData = async () => {
    try {
      const response = await fetch(`/api/evaluationdetails?evaluationId=${evaluationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch evaluation data");

      const data = await response.json();

      if (data.result) {
        setPosition(data.result.position);
        await showDefaultForm(data.result.position);
        handleUpdateEvaluationData(data.result);
      }
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
    }
  };

  const handleUpdateEvaluationData = async (datas: any) => {
    const technicalScoresJson = JSON.parse(datas.technicalScores);
    const tacticalScoresJson = JSON.parse(datas.tacticalScores);
    const physicalScoresJson = JSON.parse(datas.physicalScores);
    const distributionScoresJson = JSON.parse(datas.distributionScores);
    const organizationScoresJson = JSON.parse(datas.organizationScores);

    const getUpdatedScores = (labels: any[], source: any) =>
      Object.fromEntries(labels.map((item: any) => [item.label, source?.[item.label] || "0"]));

    setTechnicalScores(getUpdatedScores(scoreFactors.technical, technicalScoresJson));
    setTacticalScores(getUpdatedScores(scoreFactors.tactical, tacticalScoresJson));
    setPhysicalScores(getUpdatedScores(scoreFactors.physical, physicalScoresJson));
    setDistributionScores(getUpdatedScores(scoreFactors.distribution, distributionScoresJson));
    setOrganizationScores(getUpdatedScores(scoreFactors.organization, organizationScoresJson));

    setTechnicalRemarks(datas.technicalRemarks || "");
    setTacticalRemarks(datas.tacticalRemarks || "");
    setPhysicalRemarks(datas.physicalRemarks || "");
    setFinalRemarks(datas.finalRemarks || "");
    setThingsToWork(datas.thingsToWork || "");
    setSport(datas.sport || "");
    setDistributionRemarks(datas.distributionRemarks || "");
    setOrganizationalRemarks(datas.organizationalRemarks || "");
  };

  const handlePositionChange = (event: any) => {
    const selectedValue = event.target.value;
    if (Object.values(validationErrors).every((isError) => isError)) {
      setPosition(selectedValue);
      showDefaultForm(selectedValue);
    } else {
      Swal.fire({
        title: "Warning!",
        text: "You can only submit evaluation for one position. Proceeding will clear your selected fields.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancel"
      }).then((res) => {
        if (res.isConfirmed) {
          setPosition(selectedValue);
          showDefaultForm(selectedValue);
        }
      });
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoadSubmit(true);

    try {
      const res = await fetch('/api/ability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evaluationId: evaluationData?.evaluationId,
          filename: documents,
          comments: comments,
        }),
      });
      console.log('Submitting form...');
      console.log('evaluationId:', evaluationData?.evaluationId);
      console.log('filename:', documents);
      console.log('comments:', comments);

      if (!res.ok) throw new Error('Failed to save ability');

      // alert('Ability saved successfully!');
      setDocuments([]); // ✅ reset properly

      setFilename('');
      // setComments('');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving ability');
    }

    try {
      // Set IDs from evaluationData
      if (evaluationData) {
        setPlayerID(evaluationData.playerId);
        setCoachID(evaluationData.coachId);
      } else {
        throw new Error("evaluationData is null or undefined");
      }

      // ✅ Validation
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
        distributionScores: position === "Goalkeeper" && Object.values(distributionScores).every((value) => value === "N/A"),
      };

      errorMessages.forEach(({ field, message }) => {
        if ((validationErrors as Record<string, boolean>)[field]) {
          showError(message);
        }
      });

      setErrors(validationErrors);

      if (Object.values(validationErrors).some((isError) => isError)) {
        throw new Error("Validation failed.");
      }
      const { ratings, ...rest } = formData;

      // ✅ Construct Player Evaluation Payload
      const playerEvaluationPayload = {
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
        ...rest,
        ...ratings,
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

      // ✅ Construct Radar Evaluation Payload
      // const { ratings, ...rest } = formData;
      // const radarEvaluationPayload = {
      //   ...rest,
      //   ...ratings,
      //   playerId,
      //   coachId,
      //   evaluationId,
      //   speed: headerRatings[0],
      //   ability: headerRatings[1],
      //   codWithBall: headerRatings[2],
      //   codWithoutBall: headerRatings[3],
      //   counterMoveJump: headerRatings[4],
      //   ...radarSkills.reduce((acc, skill, i) => {
      //     acc[skill.key] = skillRatings[i];
      //     return acc;
      //   }, {} as any),
      // };




      // ✅ Submit Player Evaluation
      await fetch("/api/coach/evaluations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playerEvaluationPayload),
      });

      // ✅ Submit Radar Evaluation
      // await fetch("/api/radarEvaluation", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   // body: JSON.stringify(radarEvaluationPayload),
      // });

      // ✅ Success actions
      Swal.fire("Success", "Evaluation submitted successfully!", "success");

      if (typeof evaluationId === 'number') {
        const updated = [...submittedEvaluations, evaluationId];
        setSubmittedEvaluations(updated);
        localStorage.setItem("submittedEvaluations", JSON.stringify(updated));
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error during submission:", error);
      Swal.fire("Error", "Something went wrong. Please check console.", "error");
      onClose();
    } finally {
      setSubmitting(false);
      setLoadSubmit(false);
    }
  };
  const handleShowMore = () => {
    if (fields.length < 3) {
      setFields([...fields, fields.length]); // Add one more field
      setComments([...comments, ""]); // Add an empty comment for the new field
    }
  };

  // Handles "Show Less" button click
  const handleShowLess = () => {
    if (fields.length > 1) {
      const newFields = fields.slice(0, fields.length - 1); // Remove one field
      const newComments = comments.slice(0, fields.length - 1); // Remove the corresponding comment
      setFields(newFields);
      setComments(newComments);
    }
  };;
  const handleCommentChange = (index: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComments = [...comments];
    newComments[index] = e.target.value;
    setComments(newComments);
  };

  // handle document change for specific index
  const handleDocumentChange = async (index: number) => {
    const fileInputRef = fileInputRefs[index];
    if (!fileInputRef.current?.files) {
      throw new Error("No file selected");
    }
    setFileUploading(prev => ({ ...prev, [index]: true }));
    const file = fileInputRef.current.files[0];
    console.log("file existing:", file);

    try {
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/uploads/documentupload",
      });
      setFileUploading(prev => ({ ...prev, [index]: false }));
      const imageUrl = newBlob.url;
      console.log("file upload:", imageUrl);

      const newDocuments = [...documents];
      newDocuments[index] = file.name;
      setDocuments(newDocuments);

    } catch (error) {
      setFileUploading(prev => ({ ...prev, [index]: false }));
      console.error("Error uploading file:", error);
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   setSubmitting(true);

  //   const { ratings, ...rest } = formData;
  //   const payload = {
  //     ...rest,
  //     ...ratings,
  //     playerId,
  //     coachId,
  //     evaluationId,
  //     speed: headerRatings[0],
  //     ability: headerRatings[1],
  //     codWithBall: headerRatings[2],
  //     codWithoutBall: headerRatings[3],
  //     counterMoveJump: headerRatings[4],
  //     ...radarSkills.reduce((acc, skill, i) => {
  //       acc[skill.key] = skillRatings[i];
  //       return acc;
  //     }, {} as any),
  //   };

  //   try {
  //     const res = await fetch('/api/radarEvaluation', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       throw new Error(errorData.error || 'Unknown error');
  //     }

  //     const responseData = await res.json();
  //     console.log('New Evaluation submitted:', responseData);

  //     Swal.fire("Success", "New Evaluation submitted successfully!", "success");

  //     // ✅ Add to submittedEvaluations state and localStorage
  //     if (typeof evaluationId === 'number') {
  //       const updated = [...submittedEvaluations, evaluationId];
  //       setSubmittedEvaluations(updated);
  //       localStorage.setItem('submittedEvaluations', JSON.stringify(updated));
  //     }

  //     onClose(); // close modal

  //     // ✅ Reload page to reflect button change (New Evaluate → View)
  //     window.location.reload();
  //   } catch (error) {
  //     console.error('Error submitting radar evaluation:', error);
  //     Swal.fire("Error", "Something went wrong. Please check console.", "error");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  //   // Handle form submission
  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setLoadSubmit(true);

  //     if (evaluationData) {
  //       setPlayerID(evaluationData.playerId);
  //       setCoachID(evaluationData.coachId);
  //     } else {
  //       console.error("evaluationData is null or undefined");
  //       setLoadSubmit(false);
  //       onClose();
  //     }

  //     const errorMessages = [
  //       { field: "technicalRemarks", message: "Technical remarks are required." },
  //       { field: "tacticalRemarks", message: "Tactical remarks are required." },
  //       { field: "physicalRemarks", message: "Physical remarks are required." },
  //       { field: "finalRemarks", message: "Final remarks are required." },
  //       { field: "sport", message: "Please select a sport." },
  //       { field: "position", message: "Please select a position." },
  //       { field: "thingsToWorkOnRemarks", message: "Things to work on remarks are required." },
  //       { field: "distributionRemarks", message: "Distribution remarks are required for Goalkeepers." },
  //       { field: "organizationRemarks", message: "Organizational remarks are required for Goalkeepers." },
  //       { field: "technicalScores", message: "At least one technical score must be selected." },
  //       { field: "tacticalScores", message: "At least one tactical score must be selected." },
  //       { field: "physicalScores", message: "At least one physical score must be selected." },
  //       { field: "organizationScores", message: "At least one organization score must be selected for Goalkeepers." },
  //       { field: "distributionScores", message: "At least one distribution score must be selected for Goalkeepers." }
  //     ];
  //     const validationErrors = {
  //       technicalRemarks: technicalRemarks.trim() === "",
  //       tacticalRemarks: tacticalRemarks.trim() === "",
  //       physicalRemarks: physicalRemarks.trim() === "",
  //       finalRemarks: finalRemarks.trim() === "",
  //       sport: sport === "",
  //       position: position === "",
  //       thingsToWorkOnRemarks: thingsToWork === "",
  //       distributionRemarks: position === "Goalkeeper" && distributionRemarks === "",
  //       organizationRemarks: position === "Goalkeeper" && organizationalRemarks === "",
  //       technicalScores: Object.values(technicalScores).every((value) => value === "N/A"),
  //       tacticalScores: Object.values(tacticalScores).every((value) => value === "N/A"),
  //       physicalScores: Object.values(physicalScores).every((value) => value === "N/A"),
  //       organizationScores: position === "Goalkeeper" && Object.values(organizationScores).every((value) => value === "N/A"),
  //       distributionScores: position === "Goalkeeper" && Object.values(distributionScores).every((value) => value === "N/A")
  //     };


  //     errorMessages.forEach(({ field, message }) => {
  //       if ((validationErrors as Record<string, boolean>)[field]) {
  //         showError(message);
  //       }
  //     });

  //     setErrors(validationErrors);

  //     if (Object.values(validationErrors).some((isError) => isError)) {
  //       setLoadSubmit(false);
  //       return;
  //     }

  //     const evaluationDatas = {
  //       evaluationId,
  //       coachId,
  //       playerId,
  //       technicalScores,
  //       tacticalScores,
  //       distributionScores,
  //       organizationScores,
  //       physicalScores,
  //       technicalRemarks: cleanHtml(technicalRemarks),
  //       tacticalRemarks,
  //       physicalRemarks,
  //       organizationalRemarks,
  //       distributionRemarks,
  //       finalRemarks,
  //       document,
  //       position,
  //       sport,
  //       thingsToWork,
  //     };


  //     // Send the data to an API
  //     fetch("/api/coach/evaluations/save", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(evaluationDatas),
  //     })
  //       .then((response) => response.json())
  //       .then((data) => {
  //         onClose();

  //         window.location.reload();
  //       })
  //       .catch((error) => {
  //         setLoadSubmit(false);
  //         console.error("Error:", error);
  //       });
  //   };

  // Handle document update


  if (!isOpen) return null;
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

  const calculateAverage = (scores: Record<string, string | number>) => {
    const values = Object.values(scores)
      .map(Number)
      .filter((v) => !isNaN(v));
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg * 10) / 10; // Round to 1 decimal
  };


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
  // const chartData = radarSkills
  //   .map((skill) => {
  //     let averageValue = 0;

  //     // Get the average value for each skill
  //     switch (skill.key) {
  //       case "technicalAverage":
  //         averageValue = calculateAverage(technicalScores); // Use the average for technical scores
  //         break;
  //       case "tacticalAverage":
  //         averageValue = calculateAverage(tacticalScores); // Use the average for tactical scores
  //         break;
  //       case "distributionAverage":
  //         averageValue = calculateAverage(distributionScores); // Use the average for distribution scores
  //         break;
  //       case "physicalAverage":
  //         averageValue = calculateAverage(physicalScores); // Use the average for physical scores
  //         break;
  //       case "organizationAverage":
  //         averageValue = calculateAverage(organizationScores); // Use the average for organization scores
  //         break;
  //       default:
  //         averageValue = 0; // Default to 0 if no match
  //     }

  //     return {
  //       subject: skill.label,
  //       A: averageValue, // Use the calculated average value
  //     };
  //   });


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

            <div className="p-4 bg-white rounded-xl shadow-lg">
              {/* Top Section: Header metrics */}
              <div className="w-full bg-white p-4 rounded-xl shadow mb-6">
                <table>
                  <thead> <tr>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                      Overall Average
                    </th>
                  </tr></thead>
                  <tbody> <tr>
                    <td className="px-4 py-2 border border-gray-300 bg-white text-center font-semibold">
                      {calculateOverallAverage()}
                    </td>
                  </tr></tbody>
                </table>
                <table className="table-auto border-collapse border-gray-300">

                  <thead>


                    <tr>
                      {position === "Goalkeeper" ? (
                      <>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                          Technical Average
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                          Tactical Average
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                          Distribution Average
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                          Physical Average
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                          Organization Average
                        </th>

                      </>
                                ) : (
                        <>
                           <th className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                            Technical Average
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                             Tactical Average
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                             Physical Average
                          </th>
                   
                      </> 
                     )} 
                     </tr> 
                  </thead>
                  <tbody>

                    <tr>
                      <td className="px-4 py-2 border border-gray-300 bg-white text-center font-semibold">
                        {calculateAverage(technicalScores)}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 bg-white text-center font-semibold">
                        {calculateAverage(tacticalScores)}
                      </td>
                      {position === "Goalkeeper" && (
                      <>
                        <td className="px-4 py-2 border border-gray-300 bg-white text-center font-semibold">
                          {calculateAverage(distributionScores)}
                        </td>
                      </>
                      )} 
                      <td className="px-4 py-2 border border-gray-300 bg-white text-center font-semibold">
                        {calculateAverage(physicalScores)}
                      </td>
                      {position === "Goalkeeper" && (
                      <>
                        <td className="px-4 py-2 border border-gray-300 bg-white text-center font-semibold">
                          {calculateAverage(organizationScores)}
                        </td>
                      </>
                      )} 
                  
                    </tr>
                  </tbody>
                </table>

              </div>

              {/* Body: Skills sidebar + Radar */}
              <div className="p-5 flex flex-row gap-8">
                <div className="flex flex-col gap-2">
                  {radarSkills.map((skill, i) => (
                    <div key={i} className="flex items-center justify-center gap-2">
                      {/* Conditionally render skills based on position */}
                       {(position === "Goalkeeper" || (position !== "Goalkeeper" && skill.key !== "distributionAverage" && skill.key !== "organizationAverage")) && ( 
                      <div>

                      </div>
                       )} 
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


            <div className="p-4">
              {position !== "Goalkeeper" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {/* Technical Section */}
                  <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <h1 className="text-xl mb-4">
                      Technical
                      <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                    </h1>
                    <p className="text-red-500 text-sm h-5">{errors.technicalScores ? "Required." : ""}</p>

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



              {position == "Goalkeeper" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-1 mt-6">
                  {/* Technical Section */}
                  <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <div className="mb-4">
                      <h1 className="text-xl">
                        Technical
                        <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                      </h1>
                      <p className="text-red-500 text-sm h-5">{errors.technicalScores ? "Required." : ""}</p>
                    </div>
                    <div className="space-y-4 flex-grow">
                      {scoreFactors.technical.map((tech: any) => (
                        <div
                          key={tech.id}
                          className="flex items-center space-x-2"
                        >
                          <select
                            id={`dropdown-tech-${tech.id}`}
                            className="border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20 "
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
                            className="w-[75px] border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20"
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

                  {/* Distribution Section */}
                  <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <div className="mb-4">
                      <h1 className="text-xl">
                        Distribution
                        <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                      </h1>
                      <p className="text-red-500 text-sm h-5">{errors.distributionScores ? "Required." : ""}</p>
                    </div>
                    <div className="space-y-4 flex-grow">
                      {scoreFactors.distribution.map((dis: any) => (
                        <div
                          key={dis.id}
                          className="flex items-center space-x-2"
                        >
                          <select
                            id={`dropdown-dis-${dis.id}`}
                            className="border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20"
                            value={distributionScores[dis.label]}
                            onChange={(e) =>
                              setDistributionScores((prev) => ({
                                ...prev,
                                [dis.label]: e.target.value,
                              }))
                            }
                          >
                            {dis.options.map((option: any, index: any) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <label
                            htmlFor={`dropdown-dis-${dis.id}`}
                            className="text-sm font-medium"
                          >
                            {dis.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <label
                      htmlFor={`remarks-dis`}
                      className="mt-4 text-sm font-medium"
                    >
                      Commentary:
                      <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                    </label>
                    <textarea
                      id={`remarks-dis`}
                      className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                      rows={3}
                      value={distributionRemarks}
                      placeholder="Noting time stamps appropriately is extremely helpful"
                      onChange={(e) => {
                        const words = e.target.value
                          .split(/\s+/)
                          .filter((word) => word.length > 0); // Count non-empty words
                        if (words.length <= 500) {
                          setDistributionRemarks(e.target.value); // Update the value if within limit
                        }
                      }}
                    />
                    <p className="text-red-500 text-sm h-5">{errors.distributionRemarks ? "Required." : ""}</p>

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
                  {/* Organisation Section */}
                  <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                    <div className="mb-4">
                      <h1 className="text-xl">
                        Organisation
                        <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                      </h1>
                      <p className="text-red-500 text-sm h-5">{errors.organizationScores ? "Required." : ""}</p>
                    </div>
                    <div className="space-y-4 flex-grow">
                      {scoreFactors.organization.map((org: any) => (
                        <div
                          key={org.id}
                          className="flex items-center space-x-2"
                        >
                          <select
                            id={`dropdown-org-${org.id}`}
                            className="border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20"
                            value={organizationScores[org.label]}
                            onChange={(e) =>
                              setOrganizationScores((prev) => ({
                                ...prev,
                                [org.label]: e.target.value,
                              }))
                            }
                          >
                            {org.options.map((option: any, index: any) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <label
                            htmlFor={`dropdown-org-${org.id}`}
                            className="text-sm font-medium"
                          >
                            {org.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <label
                      htmlFor={`remarks-org`}
                      className="mt-4 text-sm font-medium"
                    >
                      Commentary:
                      <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                    </label>
                    <textarea
                      id={`remarks-org`}
                      className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                      rows={3}
                      value={organizationalRemarks}
                      placeholder="Noting time stamps appropriately is extremely helpful"
                      onChange={(e) => {
                        const words = e.target.value
                          .split(/\s+/)
                          .filter((word) => word.length > 0); // Count non-empty words
                        if (words.length <= 500) {
                          setOrganizationalRemarks(e.target.value); // Update the value if within limit
                        }
                      }}
                    />
                    <p className="text-red-500 text-sm h-5">{errors.organizationRemarks ? "Required." : ""}</p>

                  </div>
                </div>
              )}

              {/* <div className="flex items-center gap-6 mb-6 mt-10">
                <h2 className="text-3xl font-bold text-gray-700">CHARACTERISTICS</h2>
                <div className="text-sm mt-2 flex gap-4 flex-wrap">
                  <span className="bg-yellow-400 text-white px-2 py-0.5 rounded">EXCELLENT</span>
                  <span className="bg-cyan-400 text-white px-2 py-0.5 rounded">POSITIVE</span>
                  <span className="bg-blue-300 text-white px-2 py-0.5 rounded">NEUTRAL</span>
                </div>
              </div> */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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




              </div> */}

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div> */}

              {/* Final Remarks Section */}
              <div className="mt-6">
                <label htmlFor="final-remarks" className="text-sm font-medium">
                  Additional Comments:
                  <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                </label>
                <textarea
                  value={finalRemarks}
                  id="final-remarks"
                  className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                  rows={4}
                  onChange={(e) => {
                    const words = e.target.value
                      .split(/\s+/)
                      .filter((word) => word.length > 0); // Count non-empty words
                    if (words.length <= 1000) {
                      setFinalRemarks(e.target.value); // Update the value if within limit
                    }
                  }}
                />
                {/* {errors.finalRemarks && (
                  <p className="text-red-500 text-sm">Required.</p>
                )} */}
                <p className="text-red-500 text-sm h-5">{errors.finalRemarks ? "Required." : ""}</p>

              </div>
              <div className="mt-6">
                <label htmlFor="thingtoworkon-remarks" className="text-sm font-medium">
                  Things to Work On:
                  <span className="text-red-500 after:content-['*'] after:ml-1 after:text-red-500"></span>
                </label>
                <textarea
                  value={thingsToWork}
                  id="thingstoworkon-remarks"
                  className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                  rows={4}
                  onChange={(e) => {
                    const words = e.target.value
                      .split(/\s+/)
                      .filter((word) => word.length > 0); // Count non-empty words
                    if (words.length <= 1000) {
                      setThingsToWork(e.target.value); // Update the value if within limit
                    }
                  }}
                />
                {/* {errors.finalRemarks && (
                  <p className="text-red-500 text-sm">Required.</p>
                )} */}
                <p className="text-red-500 text-sm h-5">{errors.thingsToWorkOnRemarks ? "Required." : ""}</p>

              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mx-auto p-4">
                {fields.map((index) => (
                  <div className="grid grid-cols-2 gap-4" key={index}>
                    <div>
                      <label className="block font-medium">Filename</label>
                      <input
                        type="file"
                        name="documents"
                        className="border p-4 rounded w-full"
                        onChange={() => handleDocumentChange(index)}
                        ref={fileInputRefs[index]}

                      />
                    </div>
                    {fileUploading[index] ? (
                      <FileUploader /> // Add your file uploader component here
                    ) : (
                      <></>
                    )}
                    <div>
                      <label className="block font-medium">Comments</label>
                      <textarea
                        value={comments[index]}
                        onChange={(e) => handleCommentChange(index, e)}
                        className="border p-2 rounded w-full"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-end text-xs  space-x-2 pt-2">

                  {fields.length < 3 && (
                    <button
                      type="button"
                      onClick={handleShowMore}
                      className="mt-4 p-2 bg-blue-500 text-white rounded"
                    >
                      Add More
                    </button>
                  )}

                  {fields.length > 1 && fields.length <= 3 && (
                    <button
                      type="button"
                      onClick={handleShowLess}
                      className="mt-4 p-2 bg-red-500 text-white rounded"
                    >
                      Less One
                    </button>
                  )}
                </div>

              </form>
              {/* <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mx-auto p-4">
                {false && (
                  <div>
                    <label className="block font-medium">EvaluationId</label>

                    <span className="font-normal">
                      {evaluationData?.evaluationId}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium">Filename</label>
                    <input
                      type="file"
                      name="document"
                      className="border p-4 rounded w-full"
                      onChange={handleDocumentChange}
                      ref={fileInputRef}
                    />
                  </div>
                  {fileUploading ? (
                    <>
                      <FileUploader />
                    </>
                  ) : (
                    <></>
                  )}

                  <div>
                    <label className="block font-medium">Comments</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium">Filename</label>
                    <input
                      type="file"
                      name="document"
                      className="border p-4 rounded w-full"
                      onChange={handleDocumentChange}
                      ref={fileInputRef}
                    />
                  </div>
                  {fileUploading ? (
                    <>
                      <FileUploader />
                    </>
                  ) : (
                    <></>
                  )}

                  <div>
                    <label className="block font-medium">Comments</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium">Filename</label>
                    <input
                      type="file"
                      name="document"
                      className="border p-4 rounded w-full"
                      onChange={handleDocumentChange}
                      ref={fileInputRef}
                    />
                  </div>
                  {fileUploading ? (
                    <>
                      <FileUploader />
                    </>
                  ) : (
                    <> </>
                  )}

                  <div>
                    <label className="block font-medium">Comments</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </div>
              </form> *}


              {/* {session?.user.club_id && ( */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="mt-6">
                  <label
                    htmlFor="final-remarks"
                    className="text-sm font-medium"
                  >
                    Upload Document:
                  </label>
                  <input
                    type="file"
                    name="document"
                    className=""
                    onChange={handleDocumentChange}
                    ref={fileInputRef}
                  />
                </div>
              </div> */}
              {/* {fileUploading ? (
                <>
                  <FileUploader />
                </>
              ) : (
                <></>
              )} */}

              {/* )} */}
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
