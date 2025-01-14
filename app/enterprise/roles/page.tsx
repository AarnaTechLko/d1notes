"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/enterprise/Sidebar';
import { showError, showSuccess } from '@/app/components/Toastr';

// Define the type for the data
interface Order {
    id: number;
    role_name: string;
    permissions: string;

}
interface Permissions {
    [key: string]: string;
  }

const Home: React.FC = () => {
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [modules, setModules] = useState<[]>([]);
    const [search, setSearch] = useState<string>('');
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const limit = 10; // Set the number of items per page
    const { data: session } = useSession();
    const [modalOpen, setModalOpen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [roleTitle, setRoleTitle] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: string[] }>({});

    const handleCheckboxChange = (moduleId: string, moduleField: string) => {
        setSelectedPermissions((prevState) => {
            const modulePermissions = prevState[moduleId] || [];
            if (modulePermissions.includes(moduleField)) {
                return {
                    ...prevState,
                    [moduleId]: modulePermissions.filter((field) => field !== moduleField),
                };
            } else {
                return {
                    ...prevState,
                    [moduleId]: [...modulePermissions, moduleField],
                };
            }
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let enterprise_id;
        // Prepare data for the API
        const formattedPermissions = Object.entries(selectedPermissions).reduce((acc, [moduleId, permissions]) => {
            acc[moduleId] = permissions.join(","); // Join permissions as comma-separated string
            return acc;
        }, {} as { [key: string]: string });
        if(session)
        {
             enterprise_id=session.user.id;
        }
        const data = {
            roleTitle,
            enterprise_id,
            permissions: formattedPermissions,
        };

        try {
            const response = await fetch("/api/enterprise/roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                showSuccess("Role added successfully!");
                fetchOrders();
                setModalOpen(false); // Close modal after successful submission
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error("Failed to submit data:", error);
            showError("Failed to save role. Please try again.");
        }
    };

    const fetchOrders = async () => {
        const session = await getSession();
        const enterpriseId = session?.user?.id; // Adjust according to your session structure

        if (!enterpriseId) {
            console.error('Enterprise ID not found in session');
            return;
        }

        const response = await fetch(`/api/enterprise/roles?club_id=${enterpriseId}`, {
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
        setOrders(data.rolesList);
        setModules(data.modulesList);
        setFilteredOrders(data.rolesList); // Initially show all orders
    };
    useEffect(() => {
        

        fetchOrders();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = orders.filter((order) =>
                order.role_name.toLowerCase().includes(search.toLowerCase())  
               
            );
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders);
        }
        setCurrentPage(1); // Reset to the first page when search is updated
    }, [search, orders]);

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
                            Add Roles
                        </button>
                    </div>

                    {/* Modal */}
                    {modalOpen && (
                         <div className="fixed inset-0 flex items-center justify-center scroll-y bg-gray-800 bg-opacity-50">
                         <div className="bg-white p-6 rounded-lg w-[50%] max-h-[80vh] overflow-y-auto">
                             <h2 className="text-xl font-bold mb-4">Add Role</h2>
                             <form onSubmit={handleSubmit}>
                                 <div className="mb-4">
                                     <label htmlFor="roleTitle" className="block text-sm font-medium text-gray-700">
                                         Role Title
                                     </label>
                                     <input
                                         id="roleTitle"
                                         type="text"
                                         value={roleTitle}
                                         onChange={(e) => setRoleTitle(e.target.value)}
                                         className="w-full p-2 border border-gray-300 rounded-lg"
                                     />
                                 </div>
                                 <div className="mb-6">
                                     <label
                                         htmlFor="rolePermission"
                                         className="block text-sm font-medium text-gray-700 mb-3"
                                     >
                                         Modules & Permissions
                                     </label>
                                     {modules &&
                                         modules.map((field: any) => (
                                             <div className="mb-4" key={field.id}>
                                                 <p className="text-lg font-semibold mb-2">{field.name}</p>
                                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                     {JSON.parse(field?.module_fields).map((moduleField: string, index: number) => (
                                                         <div className="flex items-center" key={index}>
                                                             <input
                                                                 type="checkbox"
                                                                 checked={selectedPermissions[field.name]?.includes(moduleField) || false}
                                                                 onChange={() => handleCheckboxChange(field.name, moduleField)}
                                                                 className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                             />
                                                             <label className="text-sm text-gray-600 ml-2 w-full truncate">
                                                                 {moduleField}
                                                             </label>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         ))}
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
                                         Save Role
                                     </button>
                                 </div>
                             </form>
                         </div>
                     </div>
                    )}

                    <table className="w-full text-sm text-left text-gray-700">
                        <thead>
                            <tr>
                                <th>Serial Number</th>
                                <th>Role Title</th>
                                <th>Permission</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order, index) => (
                                    <tr key={order.id}>
                                        {/* Serial Number Column */}
                                        <td>{(currentPage - 1) * limit + index + 1}</td>

                                        {/* Other Columns */}
                                        <td>{order.role_name}</td>
                                        <td>
                                        <ul>
                                       

                                        {Object.entries(JSON.parse(order.permissions)).map(([key, value]) => (
                                                    <li key={key}>
                                                        <strong>{key}:</strong> {value as React.ReactNode}
                                                    </li>
                                                ))}
      </ul>
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
