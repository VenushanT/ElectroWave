import Sidebar from "../../components/Admin/Sidebar";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Users as UsersIcon,
  Search,
  Filter,
  Download,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Activity,
  TrendingUp,
  Eye,
  MoreVertical,
  RefreshCw,
  FileText,
  Clock,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X,
  Loader2,
  AlertTriangle
} from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
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
      const userData = response.data.users || response.data || [];
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch users. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [API_URL, token]);

  useEffect(() => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((user) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const phone = (user.phoneNumber || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower);
      });
    }

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "name") {
        aValue = `${a.firstName || ''} ${a.lastName || ''}`;
        bValue = `${b.firstName || ''} ${b.lastName || ''}`;
      }

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortBy, sortOrder]);

  const getUserStats = () => {
    const total = users.length;
    
    // Users joined this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newThisMonth = users.filter(u => new Date(u.createdAt) >= thisMonth).length;

    // Users joined this week
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const newThisWeek = users.filter(u => new Date(u.createdAt) >= thisWeek).length;

    // Active users (updated in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter(u => new Date(u.updatedAt) >= thirtyDaysAgo).length;

    return { total, newThisMonth, newThisWeek, activeUsers };
  };

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(59, 130, 246);
      doc.text("User Management Report", pageWidth / 2, 25, { align: 'center' });
      
      // Date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, 35, { align: 'center' });

      // Statistics Section
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("User Statistics", 20, 55);
      
      const stats = getUserStats();
      doc.setFontSize(12);
      let yPos = 70;
      doc.text(`Total Users: ${stats.total}`, 20, yPos);
      yPos += 10;
      doc.text(`New Users This Month: ${stats.newThisMonth}`, 20, yPos);
      yPos += 10;
      doc.text(`New Users This Week: ${stats.newThisWeek}`, 20, yPos);
      yPos += 10;
      doc.text(`Active Users (30 days): ${stats.activeUsers}`, 20, yPos);

      // Monthly Registration Chart Data
      const counts = new Array(12).fill(0);
      users.forEach((user) => {
        if (user.createdAt) {
          const month = new Date(user.createdAt).getMonth();
          counts[month]++;
        }
      });

      doc.setFontSize(16);
      doc.text("Monthly Registration Data", 20, yPos + 30);
      doc.setFontSize(10);
      
      yPos += 45;
      counts.forEach((count, index) => {
        const monthName = new Date(0, index).toLocaleString("en-US", { month: "long" });
        doc.text(`${monthName}: ${count} users`, 20, yPos);
        yPos += 8;
      });

      // User Details Table
      doc.addPage();
      doc.setFontSize(18);
      doc.text("User Details", 20, 25);
      
      const tableData = filteredUsers.map((user) => [
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        user.email || 'N/A',
        user.phoneNumber || 'N/A',
        user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Name", "Email", "Phone", "Date of Birth", "Joined"]],
        body: tableData,
        styles: { 
          fontSize: 9,
          cellPadding: 4,
          overflow: 'linebreak',
        },
        headStyles: { 
          fillColor: [59, 130, 246], 
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 50 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 },
        },
        margin: { top: 35 },
      });

      doc.save(`User_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 overflow-hidden group transform hover:-translate-y-1">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            {user.profilePicture ? (
              <img
                src={`${API_URL.split("/api/users/users")[0]}${user.profilePicture}`}
                alt={`${user.firstName || ''} ${user.lastName || ''}`}
                className="h-14 w-14 rounded-full object-cover border-3 border-white shadow-lg ring-2 ring-blue-100"
                onError={(e) => { e.target.src = "https://via.placeholder.com/56?text=User"; }}
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-blue-100">
                {`${(user.firstName || 'U').charAt(0)}${(user.lastName || 'N').charAt(0)}`}
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">
                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
              </h3>
              <p className="text-slate-600 text-sm mt-1">{user.email || 'No email'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowUserDetails(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-slate-100 rounded-full transform hover:scale-110"
          >
            <Eye className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center text-slate-600 group/item hover:text-blue-600 transition-colors">
            <Phone className="h-4 w-4 mr-3 text-slate-400 group-hover/item:text-blue-500" />
            <span className="text-sm">{user.phoneNumber || "Not provided"}</span>
          </div>
          <div className="flex items-center text-slate-600 group/item hover:text-blue-600 transition-colors">
            <Calendar className="h-4 w-4 mr-3 text-slate-400 group-hover/item:text-blue-500" />
            <span className="text-sm">
              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
          {user.address && (
            <div className="flex items-center text-slate-600 group/item hover:text-blue-600 transition-colors">
              <MapPin className="h-4 w-4 mr-3 text-slate-400 group-hover/item:text-blue-500" />
              <span className="truncate text-sm">{user.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium">Last updated</span>
          <span className="text-slate-700 font-semibold">
            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );

  const UserRow = ({ user, index }) => (
    <div className="bg-white border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20 transition-all duration-200">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-slate-400 font-semibold text-sm min-w-[40px] bg-slate-50 rounded-lg px-3 py-1">
              #{(index + 1).toString().padStart(2, '0')}
            </div>
            {user.profilePicture ? (
              <img
                src={`${API_URL.split("/api/users/users")[0]}${user.profilePicture}`}
                alt={`${user.firstName || ''} ${user.lastName || ''}`}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                onError={(e) => { e.target.src = "https://via.placeholder.com/48?text=User"; }}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {`${(user.firstName || 'U').charAt(0)}${(user.lastName || 'N').charAt(0)}`}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4 mb-2">
                <p className="font-bold text-slate-900 text-lg truncate">
                  {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
                </p>
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-600">
                <span className="flex items-center hover:text-blue-600 transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email || 'No email'}
                </span>
                {user.phoneNumber && (
                  <span className="flex items-center hover:text-blue-600 transition-colors">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-slate-900 font-semibold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
              <p className="text-slate-500 text-sm">Member since</p>
            </div>
            <button
              onClick={() => {
                setSelectedUser(user);
                setShowUserDetails(true);
              }}
              className="p-3 hover:bg-blue-100 rounded-full transition-all duration-200 transform hover:scale-110"
            >
              <Eye className="h-5 w-5 text-slate-400 hover:text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Loading Component
  const LoadingScreen = () => (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          {/* Animated Loading Spinner */}
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-200 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <div className="w-16 h-16 border-4 border-indigo-400 border-b-transparent rounded-full animate-spin absolute top-4 left-4" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
          </div>
          
          {/* Loading Text with Animation */}
          <h3 className="text-3xl font-bold text-slate-900 mb-4 animate-pulse">Loading Users...</h3>
          <p className="text-slate-600 text-lg mb-6">Fetching user data from database</p>
          
          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center bg-white rounded-3xl shadow-2xl p-10 max-w-md mx-4 border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Unable to Load Users</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg transform hover:scale-105"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getUserStats();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <div className="flex-1 p-8">
        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <UsersIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-slate-900 leading-tight">User Management</h1>
              <p className="text-slate-600 text-lg mt-1">Manage and monitor all registered users</p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">New This Month</p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">{stats.newThisMonth}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">New This Week</p>
                <p className="text-3xl font-bold text-purple-700 mt-2">{stats.newThisWeek}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <UserPlus className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider">Active Users</p>
                <p className="text-3xl font-bold text-orange-700 mt-2">{stats.activeUsers}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-white/50 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 flex-wrap">
              {/* Sort */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <option value="createdAt">Join Date</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="updatedAt">Last Updated</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-4 py-4 border-l border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  {sortOrder === "asc" ? 
                    <SortAsc className="h-5 w-5 text-slate-600" /> : 
                    <SortDesc className="h-5 w-5 text-slate-600" />
                  }
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-4 transition-all duration-200 ${
                    viewMode === "grid" 
                      ? "bg-blue-600 text-white shadow-inner" 
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-4 border-l border-slate-200 transition-all duration-200 ${
                    viewMode === "list" 
                      ? "bg-blue-600 text-white shadow-inner" 
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={generateReport}
                disabled={reportLoading}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-semibold"
              >
                {reportLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                {reportLoading ? 'Generating...' : 'Export PDF'}
              </button>

              <button
                onClick={fetchUsers}
                className="p-4 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-white/50 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UsersIcon className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3">
                {users.length === 0 ? "No Users Found" : "No Matching Users"}
              </h3>
              <p className="text-slate-600 text-lg">
                {users.length === 0 
                  ? "No users are currently registered in the system." 
                  : "Try adjusting your search criteria to find users."}
              </p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
                <p className="text-slate-600 font-semibold">
                  Showing <span className="text-blue-600 font-bold">{filteredUsers.length}</span> of <span className="text-blue-600 font-bold">{users.length}</span> users
                </p>
              </div>

              {viewMode === "grid" ? (
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredUsers.map((user) => (
                      <UserCard key={user._id || user.id || Math.random()} user={user} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredUsers.map((user, index) => (
                    <UserRow key={user._id || user.id || Math.random()} user={user} index={index} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Enhanced User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-scale-in">
              {/* Modal Header */}
              <div className="relative p-8 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/80 rounded-full transition-all duration-200 transform hover:scale-110"
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
                
                <div className="flex items-center space-x-6">
                  {selectedUser.profilePicture ? (
                    <img
                      src={`${API_URL.split("/api/users/users")[0]}${selectedUser.profilePicture}`}
                      alt={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/96?text=User"; }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-blue-100">
                      {`${(selectedUser.firstName || 'U').charAt(0)}${(selectedUser.lastName || 'N').charAt(0)}`}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-slate-900 mb-2">
                      {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || 'Unknown User'}
                    </h2>
                    <p className="text-slate-600 text-xl mb-3">{selectedUser.email || 'No email provided'}</p>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      <span>Member since {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Contact Information */}
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-900 text-xl mb-6 flex items-center">
                      <Mail className="h-6 w-6 mr-3 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 bg-white rounded-xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Email Address</p>
                          <p className="text-slate-900 font-semibold">{selectedUser.email || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-white rounded-xl">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Phone Number</p>
                          <p className="text-slate-900 font-semibold">{selectedUser.phoneNumber || "Not provided"}</p>
                        </div>
                      </div>
                      {selectedUser.address && (
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-xl">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Address</p>
                            <p className="text-slate-900 font-semibold">{selectedUser.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Personal Information */}
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-900 text-xl mb-6 flex items-center">
                      <User className="h-6 w-6 mr-3 text-indigo-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Date of Birth</p>
                            <p className="text-slate-900 font-semibold">
                              {selectedUser.dateOfBirth 
                                ? new Date(selectedUser.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Member Since</p>
                            <p className="text-slate-900 font-semibold">
                              {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Activity className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Last Updated</p>
                            <p className="text-slate-900 font-semibold">
                              {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {selectedUser.bio && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-900 text-xl mb-4 flex items-center">
                      <FileText className="h-6 w-6 mr-3 text-blue-600" />
                      Biography
                    </h3>
                    <div className="bg-white rounded-xl p-6">
                      <p className="text-slate-700 leading-relaxed text-lg">{selectedUser.bio}</p>
                    </div>
                  </div>
                )}

                {/* Account Statistics */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6">
                  <h3 className="font-bold text-slate-900 text-xl mb-6 flex items-center">
                    <Activity className="h-6 w-6 mr-3 text-slate-600" />
                    Account Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedUser.createdAt ? Math.floor((Date.now() - new Date(selectedUser.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">Days Active</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedUser.updatedAt ? Math.floor((Date.now() - new Date(selectedUser.updatedAt)) / (1000 * 60 * 60 * 24)) : 0}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">Days Since Update</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedUser.email && selectedUser.phoneNumber ? '100%' : selectedUser.email || selectedUser.phoneNumber ? '50%' : '0%'}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">Profile Complete</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="px-8 py-3 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;