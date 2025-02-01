"use client"; // Ensure this is a client component
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { showSuccess, showError } from '../components/Toastr';
import jwt from 'jsonwebtoken';
interface JoinRequestModalProps {
    isOpen: boolean;
    requestToID: string;
    type:string;
    onClose: () => void;
    onRequest:()=>void;
}

const JoinRequestModal: React.FC<JoinRequestModalProps> = ({ onClose, requestToID,type,onRequest}) => {
    const [message, setMessage] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);

    const { data: session } = useSession();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        let club_id;
        let playerId;
        let team_id;
        if (session) {
           playerId=requestToID;
            team_id = session.user.id;
        }
        const payload = { message, team_id,playerId};
        try {
            const response = await fetch('/api/teams/joinrequest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Join request failed');
            }

            const responseData = await response.json();
            showSuccess(responseData.message);
            onClose();
            onRequest();
        } catch (err: any) {
            showError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    ✖
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">Invite to Join</h2>



                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea name='message' onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>

                    </div>


                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Sending Request...' : 'Send Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinRequestModal;
