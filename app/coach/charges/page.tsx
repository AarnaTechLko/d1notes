"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/coach/Sidebar";
import { showSuccess, showError } from "@/app/components/Toastr";
import { useSession } from "next-auth/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getCurrencyInUSD } from "@/lib/clientHelpers";
import Swal from "sweetalert2";
import { currencies, turnAroundTime } from "@/lib/constants";
import { ClassNames } from "@emotion/react";

const Home: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [turnaroundtime, setTurnaroundtime] = useState("");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("");
    const [charges, setCharges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editChargeId, setEditChargeId] = useState<number | null>(null);
    const { data: session } = useSession();

    const fetchCharges = async () => {
        try {
            const coachId = session?.user.id;
            
            const response = await fetch(`/api/coach/evaluationcharges?coachId=${coachId}`);
            if (response.ok) {
                const data = await response.json();
                setCharges(data.evaluation_chargesData);
            } else {
                // showError("Failed to fetch charges.");
            }
        } catch (error) {
            //showError("An error occurred while fetching charges.");
        }
    };

    useEffect(() => {
        fetchCharges();
        if(session)
        {
            setCurrency(session?.user.coachCurrency || '');
        }
       
    }, [session]);

    const handleSubmit = async () => {
        if (!turnaroundtime || !amount || !currency) {
            showError("Please fill in all fields.");
            return;
        }

        let coach_id = session?.user.id;

        setLoading(true);

        try {
            type RequestBody = {
                turnaroundtime: string;
                amount: string;
                currency: string;
                coach_id: string | undefined;
                id?: number; // Optional id field
            };

            const body: RequestBody = {
                turnaroundtime,
                amount,
                currency,
                coach_id,
            };

            if (isEditMode) {
                body.id = editChargeId || 0; // Add the `id` field only in edit mode
            }



            const response = await fetch("/api/coach/evaluationcharges", {
                method: isEditMode ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                showSuccess(
                    isEditMode
                        ? "Evaluation charge updated successfully!"
                        : "Evaluation charge added successfully!"
                );
                setIsModalOpen(false);
                setTurnaroundtime("");
                setAmount("");
                
                setIsEditMode(false);
                setEditChargeId(null);
                fetchCharges(); // Refresh the charges list
            } else {
                const errorData = await response.json();
                showError(errorData.message);
            }
        } catch (error) {
            showError("An error occurred while saving the evaluation charge.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (charge: any) => {
        setIsEditMode(true);
        setIsModalOpen(true);
        setTurnaroundtime(charge.turnaroundtime);
        setCurrency(charge.currency);
        setAmount(charge.amount);
        setEditChargeId(charge.id);
    };

    const handleDelete = async (id: number) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'This action cannot be undone!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
            });

            if (result.isConfirmed) {
                const response = await fetch(`/api/coach/evaluationcharges/${id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    showSuccess("Evaluation charge deleted successfully!");
                    fetchCharges(); // Refresh the charges list
                } else {
                    const errorData = await response.json();
                    showError(errorData.message || "Failed to delete evaluation charge.");
                }
            } else {
                console.log('Canceled');
            }
        } catch (error) {
            showError("An error occurred while deleting the evaluation charge.");
        }
    };


    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-grow bg-gray-100 p-4 overflow-auto">
                <div className="bg-white shadow-md rounded-lg p-6 h-auto">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <button
                                className="text-sm bg-blue-500 rounded p-2 text-white"
                                onClick={() => {
                                    setIsEditMode(false);
                                    setIsModalOpen(true);
                                    setTurnaroundtime("");
                                    setAmount("");
                                }}
                            >
                                Add Time and Rate
                            </button>
                        </div>
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead>
                                <tr>
                                   
                                    <th>Turnaround Time</th>
                                    <th>Evaluation Rate</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {charges.length > 0 ? (
                                    charges.map((charge: any, index) => (
                                        <tr key={charge.id}>
                                             
                                            <td>{charge.turnaroundtime} Hours</td>
                                            <td>{charge.currency}{charge.amount}</td>
                                            <td className="">
                                                <button
                                                    className="bg-blue-500 text-white p-2 rounded"
                                                    onClick={() => handleEdit(charge)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                {charge.turnaroundtime!=120 &&(
 <button
 className="bg-red-500 text-white p-2 rounded ml-3"
 onClick={() => handleDelete(charge.id)}
>
 <FaTrash />
</button>
                                                )}
                                               
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            No Rate(s) found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
                        {/* <h2 className="text-lg font-semibold mb-4">
                            {isEditMode ? "Edit Evaluation Rate" : "Add Evaluation Rate"}
                        </h2> */}
                        {Number(turnaroundtime)==120 &&(
                            <div className="mb-5">Base Tournaround Time of 120 Hours</div>
                        )}
                        {Number(turnaroundtime)!=120 &&(
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Turnaround Time</label>

                            <select
                                name="turnaroundtime"
                                value={turnaroundtime}
                                onChange={(e) => setTurnaroundtime(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">Select</option>
                                {turnAroundTime.map((tat) => (
                                    <option value={tat.value} key={tat.id}>{tat.label}</option>
                                ))}

                            </select>
                        </div>
                         )}
                        <div className="mb-4 flex space-x-4">
                            
                            

                            {/* Amount Input */}
                            <div className="w-1/2">
                            {Number(turnaroundtime)==120 &&(
                                <label className="block text-sm font-medium mb-1">Base Evaluation Rate $

                                    {/* {session?.user.coachCurrency}*/}</label> 
                            )}
                            {Number(turnaroundtime)!=120 &&(
                                <label className="block text-sm font-medium mb-1">Evaluation Rate $

                                    {/* {session?.user.coachCurrency}*/}</label> 
                            )}
                               <input
    type="number"
    className="w-full border rounded px-3 py-2"
    value={amount}
    onChange={(e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // Allow only whole numbers
            setAmount(value);
        }
    }}
    placeholder="Ex. 100"
    step="1" // Prevent decimal input
/>

                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-300 rounded px-4 py-2 mr-2"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            
                            <button
                                className="bg-blue-500 text-white rounded px-4 py-2"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
