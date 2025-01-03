import { useEffect, useState, useRef } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FaEye } from 'react-icons/fa';

interface Item {
    id: number;
    firstName: string;
    lastName: string;
    review_title: string;
    primary_video_link: string;
    video_link_two: string;
    video_link_three: string;
    video_description: string;
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
          <button onClick={onClose} className="mt-4 text-blue-500 hover:underline">
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
    const handleReadMore = (description: string) => {
        setCurrentDescription(description);
       
        setModalOpen(true); // Open modal with full description
         
      };
    // Prevent fetchData from running unnecessarily
    const firstRender = useRef(true); // Helps avoid running the effect immediately after render

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

    useEffect(() => {
      
        fetchData();
    }, [search, sort, page, coachId]); // Add status only if needed

    const handleSort = (column: string) => {
        setSort(prev => prev.startsWith(column) && prev.endsWith('asc') ? `${column},desc` : `${column},asc`);
    };

    const totalPages = Math.ceil(total / limit); // Calculate total pages
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if necessary
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed, so add 1) and pad
        const year = date.getFullYear();
        return `${day}-${month}-${year}`; // Format as d-m-Y
    };
    return (
        <div>
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
                        <th onClick={() => handleSort('firstName')}>Player Name</th>
                        <th onClick={() => handleSort('review_title')}>Review Title</th>
                        <th onClick={() => handleSort('primary_video_link')}>Video Link</th>
                        
                        <th onClick={() => handleSort('video_description')}>Video Description</th>
                        <th onClick={() => handleSort('evaluation_status')}>Status</th>
                        <th onClick={() => handleSort('evaluation_status')}>View Evaluation</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={7}>Loading...</td></tr>
                    ) : (
                        data.map(item => (
                            <tr key={item.id}>
                                
                                <td>{formatDate(item.created_at)}</td>
                                <td>{item.firstName} {item.lastName}</td>
                                <td>{item.review_title}</td>
                                <td>
                                    <a href={item.primary_video_link} target='_blank' className="px-1 py-0.5 text-[10px] font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors">Primary</a>
                                    <a href={item.video_link_two} target='_blank' className="px-1 py-0.5 text-[10px] font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors ml-2">Link#2</a>
                                    <a href={item.video_link_three} target='_blank' className="px-1 py-0.5 text-[10px] font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors ml-2">Link#3</a>
                                    </td>
                              
                                <td>{item.video_description.substring(0, 30)}
                                <button onClick={() => handleReadMore(item.video_description)} className="text-blue-500 hover:underline ml-2">
                  Read More
                </button>
                                </td>
                                <td> 
                                    {item.status === 0 && (
                                        <button  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Requested</button>
                                    )}
                                    {item.status === 1 && (
                                        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Accepted</button>
                                    )}
                                    {item.status === 2 && (
                                        <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Completed</button>
                                    )}
                                    {item.status === 3 && (
                                        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Rejected</button>
                                    )}
                                    {item.status === 4 && (
                                        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-red-600">Open Draft</button>
                                    )}
                                </td>
                                <td>
                                    {item.status === 2 && (
                                        <a href={`/evaluationdetails?evaluationId=${item.id}`} target="_blank">
                                            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                                               <FaEye/>
                                            </button>
                                        </a>
                                    )}
                                     {item.status != 2 && (
                                       "N/A"
                                    )}
                                </td>
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
