import { useEffect, useState, useRef } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Item {
    id: number;
    firstName: string;
    lastName: string;
    review_title: string;
    amount: string;
    status:string;
    description: string;
    created_at: string;
}

interface PaymentDatatableProps {
    playerId: number | null; // Assuming this is already defined
    status: string | null; // Update type to include null
    limit: number;
    defaultSort: string;// Update this to string | null
}

const PaymentDatatable: React.FC<PaymentDatatableProps> = ({ limit, defaultSort, playerId, status }) => {
    const [data, setData] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<string>(defaultSort);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

    // Prevent fetchData from running unnecessarily
    const firstRender = useRef(true); // Helps avoid running the effect immediately after render

    const fetchData = async () => {
        setLoading(true);
        try {
            ///const response = await fetch(`/api/payment-history?search=${search}&sort=${sort}&page=${page}&limit=${limit}&playerId=${playerId || ''}&status=${status || ''}`);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-history?search=${search}&sort=${sort}&page=${page}&limit=${limit}&playerId=${playerId || ''}&status=${status || ''}`);

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

    useEffect(() => {
       
        fetchData();
    }, [search, sort, page, playerId]); // Add status only if needed

    const handleSort = (column: string) => {
        setSort(prev => prev.startsWith(column) && prev.endsWith('asc') ? `${column},desc` : `${column},asc`);
    };

    const totalPages = Math.ceil(total / limit); // Calculate total pages
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
                        <th onClick={() => handleSort('firstName')}>Coach Name</th>
                        <th onClick={() => handleSort('review_title')}>Review Title</th>
                        <th onClick={() => handleSort('amount')}>Amount</th>
                        <th onClick={() => handleSort('status')}>Payment Status</th>
                        <th onClick={() => handleSort('created_at')}>Paid At</th>
                         
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={7}>Loading...</td></tr>
                    ) : (
                        data.map(item => (
                            <tr key={item.id}>
                                <td>{item.firstName} {item.lastName}</td>
                                <td>{item.review_title}</td>
                                
                                <td>${item.amount}</td>
                                <td> 
                                    {item.status === 'paid' && (
                                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Paid</button>
                                    )}
                                    {item.status != 'paid' && (
                                        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Pending</button>
                                    )}
                                   
                                </td>
                                <td>{formatDate(item.created_at)}</td>
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
        </div>
    );
};

export default PaymentDatatable;
