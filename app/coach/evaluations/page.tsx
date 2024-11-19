"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EvaluationDataTable from '../../components/coach/EvaluationDataTable';
import Sidebar from '../../components/coach/Sidebar';
import { useSession } from 'next-auth/react';

// Define the type for the data
interface DataType {
    id: number; // Replace with actual properties
    name: string; // Replace with actual properties
    status: string | null; // Replace with actual properties
}

// Component to handle evaluation data
const EvaluationDataWrapper: React.FC<{ coachId: number; limit: number; defaultSort: string; }> = ({ coachId, limit, defaultSort }) => {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');

    return (
        <Suspense fallback={<div>Loading Evaluation Data...</div>}>
            <EvaluationDataTable 
                coachId={coachId} 
                status={status || null} 
                limit={limit} 
                defaultSort={defaultSort} 
            />
        </Suspense>
    );
};

const Home: React.FC = () => {
    const [coachId, setCoachId] = useState<number | null>(null);
    const limit = 10; // Set the number of items per page
    const defaultSort = 'name,asc';
    const { data: session } = useSession();

    useEffect(() => {
        if (session && session.user) {
            const id = Number(session.user.id); // Convert to number
            setCoachId(isNaN(id) ? null : id); // Set playerId or null if conversion fails
        }
    }, [session]); // This effect runs when the session changes

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-grow bg-gray-100 p-4 overflow-auto">
                <div className="bg-white shadow-md rounded-lg p-6 h-auto">
                    {coachId !== null ? (
                        <EvaluationDataWrapper 
                        coachId={coachId} 
                            limit={limit} 
                            defaultSort={defaultSort} 
                        />
                    ) : (
                        <p>Loading..</p> // Render something else when coachId is null
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
