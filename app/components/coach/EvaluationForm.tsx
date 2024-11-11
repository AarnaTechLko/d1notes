import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import EvaluationProfile from '../EvaluationProfile';
import { Evaluation, EvaluationsByStatus } from '../../types/types';
import { format } from 'date-fns';

import { getSession } from 'next-auth/react';



type EvaluationFormProps = {
    evaluationId?: number | null; // Optional or null
    evaluationData?: Evaluation | null; // Update to accept Evaluation or null
    coachId?: number | null; // Optional or null
    playerId?: number | null; // Optional or null
    isOpen: boolean;
    onClose: () => void;
};


const technical = [
    { id: 1, label: 'Passing', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 2, label: 'Receiving', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 3, label: 'Dribbling', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 4, label: 'Shooting', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 5, label: 'Finishing', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 6, label: 'Heading', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 7, label: 'Tackling', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 8, label: 'Defending', options: ['0', '1', '2', '3', '4', '5'] }
];

const tactical = [
    { id: 1, label: 'Reading The Game', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 2, label: 'Decisions w/ Ball', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 3, label: 'Decisions w/o Balls', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 4, label: 'Understanding of team play', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 5, label: 'Understanding of Role & Position', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 6, label: 'Timing of Runs', options: ['0', '1', '2', '3', '4', '5'] }
];

const physical = [
    { id: 1, label: 'Strength', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 2, label: 'Speed', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 3, label: 'Mobility', options: ['0', '1', '2', '3', '4', '5'] },
    { id: 4, label: 'Fitness', options: ['0', '1', '2', '3', '4', '5'] },
];

const EvaluationForm: React.FC<EvaluationFormProps> = ({ evaluationId,
    evaluationData,
    coachId,
    playerId,
    isOpen,
    onClose, }) => {

    const [technicalScores, setTechnicalScores] = useState<{ [key: string]: string }>(() =>
        Object.fromEntries(technical.map((tech) => [tech.label, '0']))
    );
    const [tacticalScores, setTacticalScores] = useState<{ [key: string]: string }>(() =>
        Object.fromEntries(tactical.map((tact) => [tact.label, '0']))
    );
    const [physicalScores, setPhysicalScores] = useState<{ [key: string]: string }>(() =>
        Object.fromEntries(physical.map((phys) => [phys.label, '0']))
    );
    const [technicalRemarks, setTechnicalRemarks] = useState('');
    const [tacticalRemarks, setTacticalRemarks] = useState('');
    const [physicalRemarks, setPhysicalRemarks] = useState('');
    const [finalRemarks, setFinalRemarks] = useState('');
    const [playerID, setPlayerID] = useState<number | undefined>(undefined); // Allowing for undefined
    const [coachID, setCoachID] = useState<number | undefined>(undefined);
    const [errors, setErrors] = useState<{ technicalRemarks: boolean; tacticalRemarks: boolean; physicalRemarks: boolean; finalRemarks: boolean }>({
        technicalRemarks: false,
        tacticalRemarks: false,
        physicalRemarks: false,
        finalRemarks: false,
    });

    const formattedDate = evaluationData?.created_at ? format(new Date(evaluationData.created_at), 'MM/dd/yyyy') : '';
    const onSaveAsDraft = () => {

        if (evaluationData) {
            setPlayerID(evaluationData.playerId);
            setCoachID(evaluationData.coachId);
        } else {
            console.error("evaluationData is null or undefined");
            // Handle the case where evaluationData is not available
        }


        const evaluationDatas = {
            evaluationId,
            coachId,
            playerId,
            technicalScores,
            tacticalScores,
            physicalScores,
            technicalRemarks,
            tacticalRemarks,
            physicalRemarks,
            finalRemarks,

        };


        fetch('/api/coach/evaluations/save?status=4', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(evaluationDatas),
        })
            .then((response) => response.json())
            .then((data) => {

                onClose();
                ///window.location.href = '/coach/dashboard';
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };
    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (evaluationData) {
            setPlayerID(evaluationData.playerId);
            setCoachID(evaluationData.coachId);
        } else {
            console.error("evaluationData is null or undefined");
            // Handle the case where evaluationData is not available
        }


        const validationErrors = {
            technicalRemarks: technicalRemarks.trim() === '',
            tacticalRemarks: tacticalRemarks.trim() === '',
            physicalRemarks: physicalRemarks.trim() === '',
            finalRemarks: finalRemarks.trim() === '',
        };

        setErrors(validationErrors);
        if (Object.values(validationErrors).some((isError) => isError)) {
            return;
        }
        const evaluationDatas = {
            evaluationId,
            coachId,
            playerId,
            technicalScores,
            tacticalScores,
            physicalScores,
            technicalRemarks,
            tacticalRemarks,
            physicalRemarks,
            finalRemarks,
        };



        // Send the data to an API
        fetch('/api/coach/evaluations/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(evaluationDatas),
        })
            .then((response) => response.json())
            .then((data) => {

                onClose();
                ///window.location.href = '/coach/dashboard';
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const fetchEvaluationResultData = async () => {

        try {
            const response = await fetch(`/api/evaluationdetails?evaluationId=${evaluationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {

                throw new Error('Failed to fetch evaluation data');
            }

            const data = await response.json();
            const datas = data.result;
            console.log(datas.technicalScores);
            setTechnicalScores({
                ...Object.fromEntries(technical.map((tech) => [tech.label, datas.technicalScores?.[tech.label] || '0'])),
            });
            setTacticalScores({
                ...Object.fromEntries(tactical.map((tact) => [tact.label, datas.tacticalScores?.[tact.label] || '0'])),
            });
            setPhysicalScores({
                ...Object.fromEntries(physical.map((phys) => [phys.label, datas.physicalScores?.[phys.label] || '0'])),
            });
            setTechnicalRemarks(datas.technicalRemarks || '');
            setTacticalRemarks(datas.tacticalRemarks || '');
            setPhysicalRemarks(datas.physicalRemarks || '');
            setFinalRemarks(datas.finalRemarks || '');
            // Set the fetched evaluation data
        } catch (error) {
            console.error('Error fetching evaluation data:', error);

        }
    };

    useEffect(() => {
        fetchEvaluationResultData();


    }, [evaluationData]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-screen-xl mx-6 max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-blue-600 text-white p-4">
                            <h2 className="text-lg font-bold">Please take an action!</h2>
                        </div>
                        <div className="p-6 border border-gray-300 rounded-lg font-sans">
                            {/* Evaluation Form Header - Full Width */}
                            <div className="w-full mb-0">
                                <div className="bg-white p-6 border border-gray-300 rounded-lg">
                                    <div className="flex justify-between border-b border-gray-300 pb-3 mb-0 flex-wrap">
                                        <h2 className="text-xl font-bold">Evaluation Form</h2>
                                        <div className="flex flex-col items-end">
                                            <span className="bg-cyan-100 text-teal-800 px-3 py-1 rounded mb-2">Accepted</span>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Player Information and Key Information - Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
    {/* Player Information */}
    <div className="bg-white p-6 border border-gray-300 rounded-lg md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Review Title: <span className="font-normal">{evaluationData?.review_title}</span></h3>
        <div className="flex items-center mb-4">
            <strong className="mr-2">Player:</strong>
            {evaluationData?.image ? (
                <Image
                    src={evaluationData.image}
                    alt="Player Avatar"
                    className='w-12 h-12 mr-3 rounded-full object-cover'
                    width={30}
                    height={30}
                />
            ) : (
                <div>No Image Available</div>
            )}
            <span className="text-gray-700">{evaluationData?.first_name} {evaluationData?.last_name}</span>
            <span className="ml-2 text-gray-500">{evaluationData?.position}, {evaluationData?.team} #{evaluationData?.number}</span>
        </div>

        <div className="mb-4">
            <strong className="mr-2">Cost:</strong> <span>${evaluationData?.expectedCharge}</span>
        </div>

        <div className="mb-4">
            <strong className="mr-2">Date Requested:</strong> <span>{formattedDate}</span>
        </div>

        <div className="mb-4">
            <strong className="mr-2">Primary Link:</strong> <a href={evaluationData?.primary_video_link} className="text-blue-500" target='_blank'>Link to video</a>
        </div>
        <div className="mb-4">
            <strong className="mr-2">Video Link #2:</strong> <a href={evaluationData?.video_link_two} className="text-blue-500" target='_blank'>Link to video</a>
        </div>
        <div className="mb-4">
            <strong className="mr-2">Video Link #3:</strong> <a href={evaluationData?.video_link_three} className="text-blue-500" target='_blank'>Link to video</a>
        </div>

        <div className="mb-4">
            <strong className="mr-2">Video Description:</strong>
            <span className="text-gray-700">{evaluationData?.video_description}</span>
        </div>
    </div>

    {/* Key Information */}
    <div className="bg-white p-6 border border-gray-300 rounded-lg md:col-span-1">
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
                                    <h1 className='text-xl mb-4'>Technical</h1>
                                    <div className="space-y-4 flex-grow">
                                        {technical.map((tech) => (
                                            <div key={tech.id} className="flex items-center space-x-2">
                                                <select id={`dropdown-tech-${tech.id}`} className="border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20 "  value={technicalScores[tech.label]} onChange={(e) => setTechnicalScores((prev) => ({
                                                    ...prev,
                                                    [tech.label]: e.target.value
                                                }))}>
                                                    {tech.options.map((option, index) => (
                                                        <option key={index} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                <label htmlFor={`dropdown-tech-${tech.id}`} className="text-sm font-medium">{tech.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <label htmlFor={`remarks-tech`} className="mt-4 text-sm font-medium">Commentary:</label>
                                    <textarea
                                        id={`remarks-tech`}
                                        value={technicalRemarks}
                                        className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                                        rows={3}
                                        placeholder="Noting time stamps appropriately is extremely helpful"
                                        onChange={(e) => setTechnicalRemarks(e.target.value)}
                                    />
                                    {errors.technicalRemarks && <p className="text-red-500 text-sm">Technical remarks are required.</p>}
                                </div>

                                {/* Tactical Section */}
                                <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                                    <h2 className='text-xl mb-4'>Tactical</h2>
                                    <div className="space-y-4 flex-grow">
                                        {tactical.map((tact) => (
                                            <div key={tact.id} className="flex items-center space-x-2">
                                                <select id={`dropdown-tact-${tact.id}`} className="border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20" onChange={(e) => setTacticalScores((prev) => ({
                                                    ...prev,
                                                    [tact.label]: e.target.value
                                                }))}>
                                                    {tact.options.map((option, index) => (
                                                        <option key={index} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                <label htmlFor={`dropdown-tact-${tact.id}`} className="text-sm font-medium">{tact.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <label htmlFor={`remarks-tact`} className="mt-4 text-sm font-medium">Commentary:</label>
                                    <textarea
                                        id={`remarks-tact`}
                                        className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                                        rows={3}
                                        value={tacticalRemarks}
                                        placeholder="Noting time stamps appropriately is extremely helpful"
                                        onChange={(e) => setTacticalRemarks(e.target.value)}
                                    />
                                    {errors.tacticalRemarks && <p className="text-red-500 text-sm">Tactical remarks are required.</p>}
                                </div>

                                {/* Physical Section */}
                                <div className="text-black p-4 border border-gray-300 rounded-md flex flex-col">
                                    <h3 className='text-xl mb-4'>Physical</h3>
                                    <div className="space-y-4 flex-grow">
                                        {physical.map((phys) => (
                                            <div key={phys.id} className="flex items-center space-x-2">
                                                <select id={`dropdown-phys-${phys.id}`} className="border border-gray-300 rounded-md p-1 text-gray-700 text-sm w-20" onChange={(e) => setPhysicalScores((prev) => ({
                                                    ...prev,
                                                    [phys.label]: e.target.value
                                                }))}>
                                                    {phys.options.map((option, index) => (
                                                        <option key={index} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                <label htmlFor={`dropdown-phys-${phys.id}`} className="text-sm font-medium">{phys.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <label htmlFor={`remarks-phys`} className="mt-4 text-sm font-medium">Commentary:</label>
                                    <textarea
                                        id={`remarks-phys`}
                                        className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                                        rows={3}
                                        value={physicalRemarks}
                                        placeholder="Noting time stamps appropriately is extremely helpful"
                                        onChange={(e) => setPhysicalRemarks(e.target.value)}
                                    />
                                    {errors.physicalRemarks && <p className="text-red-500 text-sm">Physical remarks are required.</p>}
                                </div>
                            </div>

                            {/* Final Remarks Section */}
                            <div className="mt-6">
                                <label htmlFor="final-remarks" className="text-sm font-medium">Additional Comments:</label>
                                <textarea
                                    value={finalRemarks}
                                    id="final-remarks"
                                    className="border border-gray-300 rounded-md p-2 text-gray-700 text-sm w-full mt-1"
                                    rows={4}
                                    placeholder="Add overall feedback, encouragement… recommendations 
for how to improve or social media links that demonstrate your feedback are extremely helpful."
                                    onChange={(e) => setFinalRemarks(e.target.value)}
                                />
                                {errors.finalRemarks && <p className="text-red-500 text-sm">Final remarks are required.</p>}
                            </div>

                            <div className="flex justify-end space-x-2 pt-6">
                                <button
                                    type="submit"
                                    className="mt-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="mt-2 bg-red-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                                    onClick={onSaveAsDraft}
                                >
                                    Save as Draft
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
