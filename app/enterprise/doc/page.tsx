"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/enterprise/Sidebar';
import { showError, showSuccess } from '@/app/components/Toastr';

// Define the type for the data
interface Order {
    id: number;
    role_name: string;
    name: string;
    email: string;
    phone: string;

}
interface Permissions {
    [key: string]: string;
  }

const Home: React.FC = () => {
    
    const [roleList, setRolelist] = useState<Order[]>([]);
    const [modules, setModules] = useState<[]>([]);
    const [search, setSearch] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const limit = 10; // Set the number of items per page
    const { data: session } = useSession();
    const [modalOpen, setModalOpen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [roleTitle, setRoleTitle] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: string[] }>({});

    

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
         let enterprise_id;
        if(session)
        {
             enterprise_id=session.user.id;
        }
        const data = {
            email,
            enterprise_id,
            name: name,
            phone:phone,
            role_id:role
        };

        try {
            const response = await fetch("/api/enterprise/doc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                showSuccess("DOC added successfully!");
                setModalOpen(false); // Close modal after successful submission
            } else {
                const error = await response.json();
                showError(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error("Failed to submit data:", error);
            alert("Failed to save role. Please try again.");
        }
    };


    useEffect(() => {
        const fetchOrders = async () => {
            const session = await getSession();
            const enterpriseId = session?.user?.id; // Adjust according to your session structure

            if (!enterpriseId) {
                console.error('Enterprise ID not found in session');
                return;
            }

            const response = await fetch(`/api/enterprise/doc?club_id=${enterpriseId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch orders');
                return;
            }

            const data = await response.json();
            setRolelist(data);
    
            setFilteredOrders(data); // Initially show all orders
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = roleList.filter((order) =>
                order.role_name.toLowerCase().includes(search.toLowerCase())  
               
            );
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(roleList);
        }
        setCurrentPage(1); // Reset to the first page when search is updated
    }, [search, roleList]);

    const totalPages = Math.ceil(filteredOrders.length / limit);

    // Get the paginated orders
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * limit,
        currentPage * limit
    );

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-grow bg-gray-100 p-4 overflow-auto">
                <div className="bg-white shadow-md rounded-lg p-6 h-auto">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search by customer name or status"
                            className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {/* Add Roles Button */}
                        <button
                            onClick={() => setModalOpen(true)} // Open modal on click
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Add DOC
                        </button>
                    </div>

                    {/* Modal */}
                    {modalOpen && (
                         <div className="fixed inset-0 flex items-center justify-center scroll-y bg-gray-800 bg-opacity-50">
                         <div className="bg-white p-6 rounded-lg w-[50%] max-h-[80vh] overflow-y-auto">
                             <h2 className="text-xl font-bold mb-4">Add DOC</h2>
                             <form onSubmit={handleSubmit}>
                                 <div className="mb-4">
                                     <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                         Name
                                     </label>
                                     <input
                                         id="name"
                                         type="text"
                                         value={name}
                                         onChange={(e) => setName(e.target.value)}
                                         className="w-full p-2 border border-gray-300 rounded-lg"
                                     />
                                 </div>
                     
                                 <div className="mb-4 flex gap-4">
                                     <div className="flex-1">
                                         <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                             Email
                                         </label>
                                         <input
                                             id="email"
                                             type="email"
                                             value={email}
                                             onChange={(e) => setEmail(e.target.value)}
                                             className="w-full p-2 border border-gray-300 rounded-lg"
                                         />
                                     </div>
                     
                                     <div className="flex-1">
                                         <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                             Phone Number
                                         </label>
                                         <input
                                             id="phone"
                                             type="text"
                                             value={phone}
                                             onChange={(e) => setPhone(e.target.value)}
                                             className="w-full p-2 border border-gray-300 rounded-lg"
                                         />
                                     </div>
                                 </div>
                     
                                 <div className="mb-4">
                                     <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                         Role
                                     </label>
                                     <select name='role' className='w-full p-2 border border-gray-300 rounded-lg' onChange={(e) => setRole(e.target.value)}>
                                        <option value="">Select</option>
                                        {roleList.map((role, index) => (
        <option key={index} value={role.id}>{role.role_name}</option>
    ))}
                                     </select>
                                    
                                 </div>
                     
                                 <div className="flex justify-end gap-4">
                                     <button
                                         type="button"
                                         onClick={() => setModalOpen(false)}
                                         className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                     >
                                         Cancel
                                     </button>
                                     <button
                                         type="submit"
                                         className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                     >
                                         Save DOC
                                     </button>
                                 </div>
                             </form>
                         </div>
                     </div>
                     
                    )}

                    <table className="w-full text-sm text-left text-gray-700">
                        <thead>
                            <tr>
                                <th>Sr. No.</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Role</th>
                                <th>Action</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order, index) => (
                                    <tr key={order.id}>
                                        {/* Serial Number Column */}
                                        <td>{(currentPage - 1) * limit + index + 1}</td>

                                        {/* Other Columns */}
                                        <td>{order.name}</td>
                                        <td>{order.email}</td>
                                        <td>{order.phone}</td>
                                        <td>{order.role_name}</td>
                                        <td>
                                       
                                        </td>

                                         
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5}>No Role(s) found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4">
                        {/* Previous Button */}
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${currentPage === 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            Previous
                        </button>

                        {/* Page Indicator */}
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>

                        {/* Next Button */}
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${currentPage === totalPages
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Home;
