import { useEffect, useState, useRef } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FaEye } from 'react-icons/fa';
import { Evaluation, EvaluationsByStatus } from '../../types/types';
import EvaluationForm from './EvaluationForm';
import AcceptanceModal from './AcceptanceModal';
import { getRemainingTime } from '@/lib/clientHelpers';
interface Item {
    id: number;
    firstName: string;
    player_id: string;
    lastName: string;
    review_title: string;
    primary_video_link: string;
    video_link_two: string;
    video_link_three: string;
    video_description: string;
    turnaroundTime: string;
    status: number;
    created_at: string;
}

interface EvaluationDataTableProps {
    coachId: number | null; // Assuming this is already defined
    status: string | null; // Update type to include null
    limit: number;
    defaultSort: string;// Update this to string | null
}
const DetailsModal: React.FC<{ isOpen: boolean, onClose: () => void, description: string }> = ({ isOpen, onClose, description }) => {
    console.log("Modal isOpen: ", isOpen); // Log the open state for debugging
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h3 className="text-lg font-bold mb-4">Full Description</h3>
                <p>{description}</p>
                <button onClick={onClose} className="mt-4 text-blue-500">
                    Close
                </button>
            </div>
        </div>
    );
};
const EvaluationDataTable: React.FC<EvaluationDataTableProps> = ({ limit, defaultSort, coachId, status }) => {
    const [data, setData] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<string>(defaultSort);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [currentDescription, setCurrentDescription] = useState<string>("");
    const [evaluationId, setEvaluationId] = useState<number | undefined>(undefined);
    const [evaluationData, setEvaluationData] = useState<Evaluation | undefined>(undefined);
    const [playerId, setPlayerId] = useState<number | undefined>(undefined);
    const [isEvFormOpen, setIsEvFormOpen] = useState(false);
    const [isAcceptOpen, setIsAcceptOpen] = useState(false);
    const handleReadMore = (description: string) => {
        setCurrentDescription(description);

        setModalOpen(true); // Open modal with full description

    };

    const firstRender = useRef(true);


    const handleRequestedAction = (evaluation: any, playerId: any) => {
        console.log(evaluation);
        setEvaluationId(evaluation);

        setPlayerId(playerId);
        setIsAcceptOpen(true);
    };

    const closeEvform = () => {
        setIsEvFormOpen(false);
    };
    const handleAcceptedAction = async (evaluation: any, playerId:any) => {


        try {
            const response = await fetch(`/api/coach/evaluations/details?evaluationId=${evaluation}`);

            if (response.ok) {
                const data = await response.json();
                setEvaluationData(data);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);

        setEvaluationId(evaluation);

        setPlayerId(playerId);

        setIsEvFormOpen(true);
        fetchData();
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/coach/evaluations?search=${search}&sort=${sort}&page=${page}&limit=${limit}&coachId=${coachId || ''}&status=${status || ''}`);

            if (response.ok) {
                const data = await response.json();
                setData(data.data);
                setTotal(data.total);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };
    const handleCloseModal = () => {
        setModalOpen(false); // Close modal
    };
    const closeAcceptanceModal = () => {
        setIsAcceptOpen(false);
    };
    useEffect(() => {

        fetchData();
    }, [search, sort, page, coachId]); // Add status only if needed

    const handleSort = (column: string) => {
        setSort(prev => prev.startsWith(column) && prev.endsWith('asc') ? `${column},desc` : `${column},asc`);
    };

    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);// Calculate total pages
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if necessary
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed, so add 1) and pad
        const year = date.getFullYear();
        return `${day}-${month}-${year}`; // Format as d-m-Y
    };
    return (
        <div>
            <AcceptanceModal
                evaluationId={evaluationId}
                isOpen={isAcceptOpen}
                onClose={closeAcceptanceModal}
            />

            <EvaluationForm
                evaluationId={evaluationId ?? null}
                evaluationData={evaluationData ?? null}
                coachId={coachId ?? null}
                playerId={playerId ?? null}
                isOpen={isEvFormOpen}
                onClose={closeEvform}
            />

            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='searchBar'
            />
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('created_at')}>Date</th>
                        <th>Time Remaining</th>
                        <th onClick={() => handleSort('firstName')}>Player Name</th>
                        <th onClick={() => handleSort('review_title')}>Review Title</th>
                        <th onClick={() => handleSort('primary_video_link')}>Video Links</th>

                        <th onClick={() => handleSort('video_description')}>Video Description</th>
                        <th onClick={() => handleSort('evaluation_status')}>Status</th>
                        {(Number(status) === 2 || Number(status) === 4) && (
                        <th onClick={() => handleSort('evaluation_status')}>View Evaluation</th>
                    )}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={7}>Loading...</td></tr>
                    ) : (
                        data.map(item => (
                            <tr key={item.id}>

                                <td>{formatDate(item.created_at)}</td>
                                <td>
  {item.turnaroundTime && !isNaN(Number(item.turnaroundTime)) ? (
    (() => {
      const remainingTime = getRemainingTime(item.created_at, Number(item.turnaroundTime));
      return (
        <button
          style={{
            backgroundColor: Number.isFinite(remainingTime) && remainingTime >= 0 ? 'green' : 'red',
            color: 'white',
            padding: '5px 3px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {Number.isFinite(remainingTime) ? remainingTime.toFixed(2) : 'Invalid'} Hours
        </button>
      );
    })()
  ) : (
    <>Not Applicable</>
  )}
</td>

                                <td>{item.firstName} {item.lastName}</td>
                                <td>{item.review_title}</td>
                                <td>
                                <a
  href={item.primary_video_link}
  className="px-1 py-0.5 text-[10px] font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
  target="_blank"
  rel="noopener noreferrer"
>
  Link#1
</a>

{item.video_link_two ? (
  <a
    href={item.video_link_two}
    className="px-1 py-0.5 text-[10px] font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors ml-2"
    target="_blank"
    rel="noopener noreferrer"
  >
    Link#2
  </a>
) : (
  <button
    disabled
    className="px-1 py-0.5 text-[10px] font-light text-gray-400 bg-gray-300 rounded ml-2 cursor-not-allowed"
  >
    Link#2
  </button>
)}

{item.video_link_three ? (
  <a
    href={item.video_link_three}
    className="px-1 py-0.5 text-[10px] font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors ml-2"
    target="_blank"
    rel="noopener noreferrer"
  >
    Link#3
  </a>
) : (
  <button
    disabled
    className="px-1 py-0.5 text-[10px] font-light text-gray-400 bg-gray-300 rounded ml-2 cursor-not-allowed"
  >
    Link#3
  </button>
)}

                                </td>

                                <td>{item.video_description.substring(0, 30)}
                                    <button onClick={() => handleReadMore(item.video_description)} className="text-blue-500  ml-2">
                                        Read More
                                    </button>
                                </td>
                                <td>
                                    {item.status === 0 && (
                                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={() => handleRequestedAction(item.id, item.player_id)}>Requested</button>
                                    )}
                                    {item.status === 1 && (
                                        <button onClick={() => handleAcceptedAction(item.id, item.player_id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Accepted</button>
                                    )}
                                    {item.status === 2 && (
                                        <button className=" text-green-600">Completed</button>
                                    )}
                                    {item.status === 3 && (
                                        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Declined</button>
                                    )}
                                    {item.status === 4 && (
                                        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-red-600">Open Draft</button>
                                    )}
                                </td>
                                {(Number(status) === 2 || Number(status) === 4) && (
                                <td>
                                    {item.status === 2 && (
                                        <a href={`/evaluationdetails?evaluationId=${item.id}`} target="_blank">
                                            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                                                <FaEye />
                                            </button>
                                        </a>
                                    )}
                                    {item.status != 2 && (
                                        "N/A"
                                    )}
                                </td>
                                 )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="pagination">
                <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span> Page {page} of {totalPages} </span>
                <button
                    onClick={() => setPage(prev => (prev < totalPages ? prev + 1 : prev))}
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div>
            <DetailsModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                description={currentDescription}
            />
        </div>
    );
};

export default EvaluationDataTable;
