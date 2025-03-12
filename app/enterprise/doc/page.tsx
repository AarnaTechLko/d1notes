"use client";
import Swal from 'sweetalert2';
import React, { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import Sidebar from "../../components/enterprise/Sidebar";
import { showError, showSuccess } from "@/app/components/Toastr";
import { FaEdit, FaKey, FaTrash } from "react-icons/fa";
import { countryCodesList } from '@/lib/constants';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface Order {
  id: number;
  role_name: string;
  name: string;
  email: string;
  countryCodes: string;
  phone: string;
  role_id: string;
  view_evaluation: string;
  buy_evaluation: string;
}

const Home: React.FC = () => {
  const [roleList, setRolelist] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [countryCodes, setCountryCodes] = useState<string>("+1");
  const [email, setEmail] = useState<string>("");
  const [buyLicenses, setBuyLicenses] = useState(false);
  const [acceptEvaluations, setAcceptEvaluations] = useState(false);
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Order | null>(null);
  const [selectedRole, setSelectedRole] = useState<number>(0);
const [isMiddle, setIsMiddle] = useState(false);
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
    const [IsStart, setIsStart] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
  const limit = 10; // Items per page
  const { data: session } = useSession();
  const validateForm = () => {
    let isValid = true;
    let firstError = null; // Store the first error message

    if (!name.trim()) {
      if (!firstError) firstError = "Name is required.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      if (!firstError) firstError = "Email is required.";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      if (!firstError) firstError = "Invalid email format.";
      isValid = false;
    }
    if (!countryCodes.trim()) {
      if (!firstError) firstError = "Country Code is required.";
      isValid = false;
    }
    
    if (!phone) {
      if (!firstError) firstError = "Phone number is required.";
      isValid = false;
    } else if (phone.length !== 14) {
      if (!firstError) firstError = "Phone number must be 10 digits.";
      isValid = false;
    } 
    else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(phone)) {
      if (!firstError) firstError = "Phone number must be in the format (XXX) XXX-XXXX.";
      isValid = false;
    }

    // if (!role.trim()) {
    //   if (!firstError) firstError = "Role is required.";
    //   isValid = false;
    // }

    if (firstError) {
      showError(firstError); // Show only the first error
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    let enterprise_id = session?.user?.id;

    if (!enterprise_id) {
      showError("Enterprise ID is not available.");
      return;
    }

    const data = {
      email,
      enterprise_id,
      name,
      phone,
      countryCodes,
      buyLicenses,
      acceptEvaluations,
      role_id: selectedRole,
      ...(selectedRecord ? { id: selectedRecord.id } : {})
    };

    const endpoint = selectedRecord
      ? `/api/enterprise/doc`
      : "/api/enterprise/doc";

    const method = selectedRecord ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const successMessage = selectedRecord
          ? "Sub Admin updated successfully!"
          : "Sub Admin added successfully!";
        showSuccess(successMessage);
        setModalOpen(false);
        setName("");
        setEmail("");
        setPhone("");
        setRole("");
        fetchOrders(); // Refresh the list after submission
      } else {
        const error = await response.json();
        showError(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Failed to submit data:", error);
      showError("Failed to save data. Please try again.");
    }
  };

  const fetchOrders = async () => {
    const session = await getSession();
    const enterpriseId = session?.user?.id;

    if (!enterpriseId) {
      console.error("Enterprise ID not found in session");
      return;
    }

    const response = await fetch(`/api/enterprise/doc?club_id=${enterpriseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch orders");
      return;
    }

    const data = await response.json();
    setRolelist(data.rolesList);
    console.log(data.result);
    setFilteredOrders(data.result); // Initially show all orders
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = filteredOrders.filter((order) =>
        order.role_name?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(filteredOrders);
    }
    setCurrentPage(1); // Reset to the first page when search is updated
  }, [search, filteredOrders]);

  const totalPages = filteredOrders.length === 0 ? 1 : Math.ceil(filteredOrders.length / limit);

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

  const openEditModal = (record: Order) => {
    console.log(record);
    setSelectedRecord(record);
    setName(record.name);
    setEmail(record.email);
    setPhone(record.phone);
    setRole(String(record.role_id));
    setCountryCodes(record.countryCodes);
    if(record.view_evaluation=='true')
    {
      setAcceptEvaluations(true);
    }
    else{
      setAcceptEvaluations(false);
    }

    if(record.buy_evaluation=='true')
      {
        setBuyLicenses(true);
      }
      else{
        setBuyLicenses(false);
      }
    
    
    setModalOpen(true);
  };

  const handleResetpassword = async (record: Order) => { // Add 'async' here
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to reset and send password?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset it!',
      cancelButtonText: 'No, cancel',
    }).then(async (result) => { // Mark this as async as well
      if (result.isConfirmed) {
        const data = {
          id:record.id,
          email:record.email,
        };
      
        try {
          const response = await fetch('/api/enterprise/doc/resendpassword', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
      
          if (!response.ok) {
            throw new Error('Failed to send data');
          }
      
          const result = await response.json();
          console.log(result.message);  // Data received successfully
        } catch (error) {
          console.error('Error:', error);
        }
        Swal.fire('Password Reset', 'Your password has been reset!', 'success');
      } else {
        Swal.fire('Cancelled', 'Your password reset was cancelled', 'error');
      }
    });
  };
  

  const closeModal = () => {
    setSelectedRecord(null);
    setName("");
    setEmail("");
    setPhone("");
    setRole("");
    setModalOpen(false);
  };
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;

    const phoneNumber = value.replace(/[^\d]/g, ""); // Remove all non-numeric characters

    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) return phoneNumber;

    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }

    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };
  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(event.target.value);
    setPhone(formattedNumber);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/enterprise/doc?id=${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          showSuccess("Sub Admin Deleted.");
          fetchOrders();
        } else {
          console.error(data.message); // Error message from server
          showError(data.message);
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
        <h1 className="text-2xl font-bold mb-4">Sub Administrators</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => setModalOpen(true)}
              className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Sub Administrators
            </button>
          </div>

          {modalOpen && (
            <div ref={tableContainerRef} className="overflow-x-auto">
            <button
                          onClick={scrollLeft}
                          className={`absolute left-4 top-1/2 p-3 text-white transform -translate-y-1/2 rounded-full shadow-md z-10 transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-gray-500 lg:hidden ${
                            IsStart ? "bg-gray-400 cursor-not-allowed" : isMiddle ? "bg-green-500" : "bg-blue-500"
                          }`}
                        >
                          <FaArrowLeft />
                        </button>
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg w-full sm:w-[90%] md:w-[75%] lg:w-[50%] max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                  {selectedRecord ? "Edit Sub Admin" : "Add Sub Admin"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name<span className='mandatory'>*</span>
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
      Email<span className='mandatory'>*</span>
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
    <label className="block text-sm font-medium text-gray-700">
    Mobile Number<span className='mandatory'>*</span>
    </label>
    <div className="flex items-center gap-2">
    <select
                        name="countrycode"
                        value={countryCodes}
                        className="border border-gray-300 rounded-lg py-2 px-4 w-2/5 mr-1" // Added mr-4 for margin-right
                       
                        onChange={(e)=>setCountryCodes(e.target.value)}
                      >
                        <option value="">Select</option>
                        {countryCodesList.map((item) => (
                          <option key={item.id} value={item.code}>
                            {item.code} ({item.country})
                          </option>
                        ))}
                      </select>
     
      <input
        id="phone"
        type="text"
        value={phone}
        onChange={handlePhoneNumberChange}
        className="flex-1 p-2 border border-gray-300 rounded-lg"
        placeholder="(xxx) xxx-xxxx"
      />
    </div>
  </div>
</div>

<div className="flex items-center space-x-4">
  {/* Buy Licenses Toggle */}
  <div className="flex items-center space-x-2">
    <span>Purchase Evaluations{buyLicenses}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={buyLicenses}
        onChange={() => setBuyLicenses(!buyLicenses)}
      />
      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
    </label>
  </div>

  {/* Accept Evaluations Toggle */}
  <div className="flex items-center space-x-2">
    <span>View Evaluations{acceptEvaluations}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={acceptEvaluations}
        onChange={() => setAcceptEvaluations(!acceptEvaluations)}
      />
      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
    </label>
  </div>
</div>




                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
              </div>
            </div>
          )}
<div ref={tableContainerRef} className="overflow-x-auto">
  <button
                onClick={scrollLeft}
                className={`absolute left-4 top-1/2 p-3 text-white transform -translate-y-1/2 rounded-full shadow-md z-10 transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-gray-500 lg:hidden ${
                  IsStart ? "bg-gray-400 cursor-not-allowed" : isMiddle ? "bg-green-500" : "bg-blue-500"
                }`}
              >
                <FaArrowLeft />
              </button>
          <table className="w-full text-sm text-left text-gray-700">
            <thead>
              <tr>
                
                <th>Name</th>
                <th>Email</th>
                <th>Mobile Number</th>
                <th>Additional Access</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, index) => (
                  <tr key={order.id}>
                    
                    <td>{order.name}</td>
                    <td>{order.email}</td>
                    <td>{order.countryCodes} {order.phone}</td>
                    <td>
  {order.buy_evaluation==='true' && <p>Purchase Evaluations</p>}
  {order.view_evaluation==='true' && <p>View Evaluations</p>}
</td>
                    <td>
                    {/* <button
                        onClick={() => handleResetpassword(order)}
                        className="px-2 py-1 bg-blue-500 mr-4 text-white rounded hover:bg-green-600"
                      >
                        <FaKey />
                      </button> */}
                      <button
                        onClick={() => openEditModal(order)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Edit Sub Administrator"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="px-2 ml-4 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                        title="Delete Sub Administrator"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No Sub Administrators added yet...</td>
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
          </div>
          {paginatedOrders.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
              Next
            </button>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
