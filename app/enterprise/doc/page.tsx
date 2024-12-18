"use client";
import Swal from 'sweetalert2';
import React, { useEffect, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import Sidebar from "../../components/enterprise/Sidebar";
import { showError, showSuccess } from "@/app/components/Toastr";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Order {
  id: number;
  role_name: string;
  name: string;
  email: string;
  phone: string;
  role_id: string;
}

const Home: React.FC = () => {
  const [roleList, setRolelist] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Order | null>(null);

  const limit = 10; // Items per page
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      role_id: role,
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
        order.role_name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(filteredOrders);
    }
    setCurrentPage(1); // Reset to the first page when search is updated
  }, [search, filteredOrders]);

  const totalPages = Math.ceil(filteredOrders.length / limit);

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
    setSelectedRecord(record);
    setName(record.name);
    setEmail(record.email);
    setPhone(record.phone);
    setRole(String(record.role_id));
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setName("");
    setEmail("");
    setPhone("");
    setRole("");
    setModalOpen(false);
  };

  const handleDelete=async (id: number) => {
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
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by name or Email"
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Sub Admin
            </button>
          </div>

          {modalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg w-[50%] max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                  {selectedRecord ? "Edit Sub Admin" : "Add Sub Admin"}
                </h2>
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
                    <select
  name="role"
  className="w-full p-2 border border-gray-300 rounded-lg"
  value={role}
  onChange={(e) => setRole(e.target.value)}
>
  <option value="">Select</option>
  {roleList.map((roleItem, index) => (
    <option key={index} value={roleItem.id}>
      {roleItem.role_name}
    </option>
  ))}
</select>
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
                    <td>{(currentPage - 1) * limit + index + 1}</td>
                    <td>{order.name}</td>
                    <td>{order.email}</td>
                    <td>{order.phone}</td>
                    <td>{order.role_name}</td>
                    <td>
                      <button
                        onClick={() => openEditModal(order)}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <FaEdit/>
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="px-2 ml-4 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                      >
                        <FaTrash/>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No Role(s) found</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
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
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
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
