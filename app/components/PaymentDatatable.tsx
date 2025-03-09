import { useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FaArrowLeft, FaArrowRight, FaEye } from 'react-icons/fa';
import  { useRef } from "react";
interface Item {
    id: number;
    firstName: string;
    lastName: string;
    review_title: string;
    amount: string;
    status:string;
    description: string;
    created_at: string;
    currency: string;
    slug: string;
    image: string;
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
    const [isMiddle, setIsMiddle] = useState(false);
      const [IsStart, setIsStart] = useState(false);
      const [isEnd, setIsEnd] = useState(false);
const tableContainerRef = useRef<HTMLDivElement>(null); // ✅ Correct usage of useRef

  // Scroll handlers
  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft -= 200; // Adjust as needed
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft += 200;
    }
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
        const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;

        
        setIsStart(scrollLeft === 0);
      setIsEnd(scrollLeft + clientWidth >= scrollWidth);
      setIsMiddle(scrollPercentage >= 40);

      }
    };

    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []); // Empty dependency array means it runs only once after mount
    // Prevent fetchData from running unnecessarily
    const firstRender = useRef(true); // Helps avoid running the effect immediately after render

    const fetchData = async () => {
        setLoading(true);
        try {
            ///const response = await fetch(`/api/payment-history?search=${search}&sort=${sort}&page=${page}&limit=${limit}&playerId=${playerId || ''}&status=${status || ''}`);
            const response = await fetch(`/api/payment-history?search=${search}&sort=${sort}&page=${page}&limit=${limit}&playerId=${playerId || ''}&status=${status || ''}`);

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

    const totalPages = total === 0 ? 1 : Math.ceil(total / limit); // Calculate total pages
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    };
    return (
        <div ref={tableContainerRef} className="overflow-x-auto">
            <input 
                type="text" 
                placeholder="Search..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className='searchBar'
            />
            <button
              onClick={scrollLeft}
              className={`absolute left-4 top-1/2 p-3 text-white transform -translate-y-1/2 rounded-full shadow-md z-10 transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-gray-500 lg:hidden ${
                IsStart ? "bg-gray-400 cursor-not-allowed" : isMiddle ? "bg-green-500" : "bg-blue-500"
              }`}
            >
              <FaArrowLeft />
            </button>
            <table className="w-full text-sm text-left text-gray-700 mt-4">
                <thead>
                    <tr>
                    <th onClick={() => handleSort('created_at')}>Paid Date</th>
                        <th onClick={() => handleSort('firstName')}>Coach Name</th>
                        <th onClick={() => handleSort('review_title')}>Review Title</th>
                        <th onClick={() => handleSort('amount')}>Amount</th>
                        <th onClick={() => handleSort('status')}>Payment Status</th>
                        
                         
                    </tr>
                </thead>
                <tbody>
    {loading ? (
        <tr>
            <td colSpan={7}>Loading...</td>
        </tr>
    ) : data.length > 0 ? (
        data.map(item => (
            <tr key={item.id}>
                <td>{formatDate(item.created_at)}</td>
                <td>
    <a href={`/coach/${item.slug}`} target="_blank" className="flex items-center space-x-3 text-blue-700">
        <img 
            src={item.image} 
            alt={`${item.firstName} ${item.lastName}`} 
            className="w-10 h-10 rounded-full object-cover"
        />
        <p>{item.firstName} {item.lastName}</p>
    </a>
</td>

                <td>{item.review_title}</td>
                <td>{item.currency} {item.amount}</td>
                <td>
                    {item.status === 'paid' ? 'Paid' : 'Pending'}
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan={7} className="text-center">No payment history found</td>
        </tr>
    )}
</tbody>

            </table>
            <button
              onClick={scrollRight}
              disabled={isEnd} 
              style={{
                backgroundColor: isEnd ? "grey" : isMiddle ? "#22c55e" : "#22c55e", // Tailwind green-500 and blue-500
                color: "white",
                padding: "10px",
                border: "none",
                cursor: isEnd ? "not-allowed" : "pointer",
              }}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-500 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md z-10 lg:hidden
              `}
            >
              <FaArrowRight />
            </button>
            {data.length>0 && 
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
}
        </div>
    );
};

export default PaymentDatatable;
