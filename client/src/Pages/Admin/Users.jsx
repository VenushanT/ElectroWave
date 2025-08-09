import Sidebar from "../../components/Admin/Sidebar";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useSelector((state) => state.auth);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/users/users";

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching users from ${API_URL}...`);
      const response = await axios.get(API_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("Users response:", response.data);
      setUsers(response.data.users || response.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [API_URL]);

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate PDF report
  const generateReport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("User Management Report", 10, 10);

    // User Count by Month
    const counts = new Array(12).fill(0);
    users.forEach((user) => {
      const month = new Date(user.createdAt).getMonth(); // 0-11
      counts[month]++;
    });
    doc.setFontSize(12);
    doc.text("User Registration Count by Month:", 10, 20);
    counts.forEach((count, index) => {
      doc.text(
        `${new Date(0, index).toLocaleString("en-US", { month: "long" })}: ${count} users`,
        10,
        30 + index * 5
      );
    });

    // User Details Table
    doc.setFontSize(14);
    doc.text("User Details", 10, 50);
    const tableData = users.map((user) => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.role,
      user.phoneNumber || "N/A",
      user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A",
      user.address || "N/A",
      user.bio || "N/A",
      new Date(user.createdAt).toLocaleDateString(),
      new Date(user.updatedAt).toLocaleDateString(),
    ]);
    autoTable(doc, {
      startY: 60,
      head: [["Name", "Email", "Role", "Phone", "DOB", "Address", "Bio", "Joined", "Last Updated"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
    });

    // Save the PDF
    doc.save("User_Report.pdf");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          <span className="ml-4 text-gray-600 font-medium">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-md text-center max-w-md">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">User Management</h1>

        {/* Search Bar and Generate Report Button */}
        <div className="mb-6 flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
          />
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Generate Report
          </button>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="text-center text-gray-500 bg-white p-6 rounded-lg shadow-md">No users found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  {user.profilePicture ? (
                    <img
                      src={`${API_URL.split("/api/users/users")[0]}${user.profilePicture}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-16 w-16 rounded-full object-cover mr-4 border-2 border-blue-200"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/64"; }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mr-4">
                      {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                      Role: {user.role}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong className="text-gray-900">Phone:</strong> {user.phoneNumber || "N/A"}</p>
                  <p><strong className="text-gray-900">DOB:</strong> {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                  <p><strong className="text-gray-900">Address:</strong> {user.address || "N/A"}</p>
                  <p><strong className="text-gray-900">Bio:</strong> {user.bio || "N/A"}</p>
                  <p><strong className="text-gray-900">Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  <p><strong className="text-gray-900">Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;