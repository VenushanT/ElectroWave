import Sidebar from "../../components/Admin/Sidebar";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  RefreshCw,
  FileText,
  Clock,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X,
  Loader2,
  AlertTriangle,
  Loader
} from "lucide-react";

// Custom hooks for better state management
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/users/users";

  const fetchUsers = useCallback(async () => {
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
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch users. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  return { users, loading, error, fetchUsers, API_URL };
};

const useModal = (initialState = null) => {
  const [isOpen, setIsOpen] = useState(!!initialState);
  const [data, setData] = useState(initialState);

  const open = useCallback((newData) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, data, open, close };
};

const Users = () => {
  const { users, loading, error, fetchUsers, API_URL } = useUsers();
  const userModal = useModal();
  
  // Filters and search state
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const [viewMode, setViewMode] = useState("grid");
  const [reportLoading, setReportLoading] = useState(false);

  // Initialize data
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        if (userModal.isOpen) userModal.close();
      }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        fetchUsers();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [userModal, fetchUsers]);

  // Advanced filtering and sorting
  const processedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phoneNumber || '').toLowerCase();
      const searchLower = filters.search.toLowerCase();
      
      return fullName.includes(searchLower) || 
             email.includes(searchLower) || 
             phone.includes(searchLower);
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === "name") {
        aValue = `${a.firstName || ''} ${a.lastName || ''}`;
        bValue = `${b.firstName || ''} ${b.lastName || ''}`;
      }

      if (filters.sortBy === "createdAt" || filters.sortBy === "updatedAt") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, filters]);

  // Statistics
  const stats = useMemo(() => {
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
  }, [users]);

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
      
      doc.setFontSize(12);
      let yPos = 70;
      doc.text(`Total Users: ${stats.total}`, 20, yPos);
      yPos += 10;
      doc.text(`New Users This Month: ${stats.newThisMonth}`, 20, yPos);
      yPos += 10;
      doc.text(`New Users This Week: ${stats.newThisWeek}`, 20, yPos);
      yPos += 10;
      doc.text(`Active Users (30 days): ${stats.activeUsers}`, 20, yPos);

      // User Details Table
      doc.addPage();
      doc.setFontSize(18);
      doc.text("User Details", 20, 25);
      
      const tableData = processedUsers.map((user) => [
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
    } finally {
      setReportLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
      <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white/10 rounded-full"></div>
    </div>
  );

  // Premium Loading Component (same as ViewProducts)
  const PremiumLoadingScreen = () => (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    </div>
  );

  // Enhanced User Card
  const UserCard = ({ user }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden group transform hover:-translate-y-2 hover:scale-[1.02]">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            {user.profilePicture ? (
              <img
                src={`${API_URL.split("/api/users/users")[0]}${user.profilePicture}`}
                alt={`${user.firstName || ''} ${user.lastName || ''}`}
                className="h-16 w-16 rounded-full object-cover border-3 border-white shadow-lg ring-2 ring-blue-100"
                onError={(e) => { e.target.src = "https://via.placeholder.com/64?text=User"; }}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-blue-100">
                {`${(user.firstName || 'U').charAt(0)}${(user.lastName || 'N').charAt(0)}`}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
              </h3>
              <p className="text-gray-600">{user.email || 'No email'}</p>
            </div>
          </div>
          <button
            onClick={() => userModal.open(user)}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 hover:bg-blue-50 rounded-full transform hover:scale-110"
          >
            <Eye className="h-5 w-5 text-blue-600" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center text-gray-600 text-sm">
            <Phone className="h-4 w-4 mr-3 text-gray-400" />
            <span>{user.phoneNumber || "Not provided"}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="h-4 w-4 mr-3 text-gray-400" />
            <span>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              }) : 'Unknown'}
            </span>
          </div>
          
          {user.address && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
              <span className="break-words truncate">{user.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="font-semibold text-gray-900">
              {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              }) : 'Unknown'}
            </p>
          </div>
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced User Row
  const UserRow = ({ user, index }) => (
    <div className="bg-white border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-gray-400 font-bold text-sm min-w-[40px] bg-gray-50 rounded-lg px-3 py-1">
              #{(index + 1).toString().padStart(2, '0')}
            </div>
            
            {user.profilePicture ? (
              <img
                src={`${API_URL.split("/api/users/users")[0]}${user.profilePicture}`}
                alt={`${user.firstName || ''} ${user.lastName || ''}`}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-gray-200"
                onError={(e) => { e.target.src = "https://via.placeholder.com/48?text=User"; }}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                {`${(user.firstName || 'U').charAt(0)}${(user.lastName || 'N').charAt(0)}`}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4 mb-2">
                <p className="font-bold text-gray-900 text-lg truncate">
                  {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="truncate">{user.email || 'No email'}</span>
                </div>
                
                {user.phoneNumber && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-green-500" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
                
                {user.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="truncate">{user.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-gray-900 font-bold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Unknown'}
              </p>
              <p className="text-gray-500 text-sm">Member since</p>
            </div>
            
            <button
              onClick={() => userModal.open(user)}
              className="p-3 hover:bg-blue-100 rounded-full transition-all duration-200 transform hover:scale-110"
            >
              <Eye className="h-5 w-5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <PremiumLoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Unable to Load Users</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg transform hover:scale-105"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <div className="flex-1 p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">User Management</h1>
              <p className="text-slate-600 mt-1">Manage and monitor all registered users</p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.total}
            icon={UsersIcon}
            gradient="from-blue-500 via-blue-600 to-blue-700"
          />
          <StatCard
            title="New This Month"
            value={stats.newThisMonth}
            icon={TrendingUp}
            gradient="from-green-500 via-green-600 to-green-700"
          />
          <StatCard
            title="New This Week"
            value={stats.newThisWeek}
            icon={UserPlus}
            gradient="from-purple-500 via-purple-600 to-purple-700"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={Activity}
            gradient="from-orange-500 via-orange-600 to-orange-700"
          />
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-white/50 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone number..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 flex-wrap">
              {/* Sort */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <option value="createdAt">Join Date</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="updatedAt">Last Updated</option>
                </select>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }))}
                  className="px-3 py-3 border-l border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  {filters.sortOrder === "asc" ? 
                    <SortAsc className="h-4 w-4 text-slate-600" /> : 
                    <SortDesc className="h-4 w-4 text-slate-600" />
                  }
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === "grid" 
                      ? "bg-blue-600 text-white shadow-inner" 
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 border-l border-slate-200 transition-all duration-200 ${
                    viewMode === "list" 
                      ? "bg-blue-600 text-white shadow-inner" 
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={generateReport}
                disabled={reportLoading}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-medium text-sm"
              >
                {reportLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {reportLoading ? 'Generating...' : 'Export PDF'}
              </button>

              <button
                onClick={fetchUsers}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Display */}
        <div className="bg-white rounded-xl shadow-sm border border-white/50 overflow-hidden">
          {processedUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {users.length === 0 ? "No Users Found" : "No Matching Users"}
              </h3>
              <p className="text-slate-600">
                {users.length === 0 
                  ? "No users are currently registered in the system." 
                  : "Try adjusting your search criteria to find users."}
              </p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
                <p className="text-slate-600 font-medium">
                  Showing <span className="text-blue-600 font-bold">{processedUsers.length}</span> of <span className="text-blue-600 font-bold">{users.length}</span> users
                </p>
              </div>

              {viewMode === "grid" ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {processedUsers.map((user) => (
                      <UserCard key={user._id || user.id || Math.random()} user={user} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {processedUsers.map((user, index) => (
                    <UserRow key={user._id || user.id || Math.random()} user={user} index={index} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Optimized User Details Modal */}
        {userModal.isOpen && userModal.data && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
            onClick={(e) => e.target === e.currentTarget && userModal.close()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-scaleIn">
              {/* Modal Header */}
              <div className="relative p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <button
                  onClick={userModal.close}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
                
                <div className="flex items-center space-x-6 pr-12">
                  {userModal.data.profilePicture ? (
                    <img
                      src={`${API_URL.split("/api/users/users")[0]}${userModal.data.profilePicture}`}
                      alt={`${userModal.data.firstName || ''} ${userModal.data.lastName || ''}`}
                      className="h-20 w-20 rounded-full object-cover border-3 border-white shadow-xl ring-2 ring-blue-100"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/80?text=User"; }}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-2 ring-blue-100">
                      {`${(userModal.data.firstName || 'U').charAt(0)}${(userModal.data.lastName || 'N').charAt(0)}`}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 truncate">
                      {`${userModal.data.firstName || ''} ${userModal.data.lastName || ''}`.trim() || 'Unknown User'}
                    </h2>
                    <p className="text-slate-600 text-lg truncate">{userModal.data.email || 'No email provided'}</p>
                    <div className="flex items-center space-x-2 mt-2 text-slate-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Member since {userModal.data.createdAt ? new Date(userModal.data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center">
                      <Mail className="h-5 w-5 mr-3 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 mb-1">Email Address</p>
                          <p className="text-slate-900 font-semibold truncate">{userModal.data.email || "Not provided"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 mb-1">Phone Number</p>
                          <p className="text-slate-900 font-semibold">{userModal.data.phoneNumber || "Not provided"}</p>
                        </div>
                      </div>
                      
                      {userModal.data.address && (
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <MapPin className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-500 mb-1">Address</p>
                            <p className="text-slate-900 font-semibold break-words">{userModal.data.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Personal Information */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center">
                      <User className="h-5 w-5 mr-3 text-indigo-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Date of Birth</p>
                            <p className="text-slate-900 font-semibold">
                              {userModal.data.dateOfBirth 
                                ? new Date(userModal.data.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Member Since</p>
                            <p className="text-slate-900 font-semibold">
                              {userModal.data.createdAt ? new Date(userModal.data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Activity className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Last Updated</p>
                            <p className="text-slate-900 font-semibold">
                              {userModal.data.updatedAt ? new Date(userModal.data.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {userModal.data.bio && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-blue-600" />
                      Biography
                    </h3>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-slate-700 leading-relaxed">{userModal.data.bio}</p>
                    </div>
                  </div>
                )}

                {/* Account Statistics */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-3 text-slate-600" />
                    Account Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {userModal.data.createdAt ? Math.floor((Date.now() - new Date(userModal.data.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">Days Active</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {userModal.data.updatedAt ? Math.floor((Date.now() - new Date(userModal.data.updatedAt)) / (1000 * 60 * 60 * 24)) : 0}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">Days Since Update</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {userModal.data.email && userModal.data.phoneNumber ? '100%' : userModal.data.email || userModal.data.phoneNumber ? '50%' : '0%'}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">Profile Complete</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <button
                    onClick={userModal.close}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium CSS Animations and Styles */}
      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
          }
          to { 
            opacity: 1; 
          }
        }
        
        @keyframes scaleIn {
          from { 
            transform: scale(0.95) translateY(10px); 
            opacity: 0; 
          }
          to { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-fadeIn { 
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        
        .animate-scaleIn { 
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Glass morphism effect */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* Smooth transitions for all interactive elements */
        button, input, select, .transition-all {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Focus styles */
        button:focus,
        input:focus,
        select:focus {
          outline: none;
          ring: 2px;
          ring-color: rgb(59 130 246 / 0.5);
          ring-offset: 2px;
        }

        /* Hover effects */
        .hover-lift:hover {
          transform: translateY(-2px);
        }

        /* Loading skeleton animation */
        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }
        
        .skeleton {
          animation: shimmer 1.2s ease-in-out infinite;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 468px 100%;
        }

        /* Premium shadow effects */
        .shadow-premium {
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .shadow-premium-lg {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Gradient text effects */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Card hover effects */
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Interactive button effects */
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .animate-scaleIn {
            animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .bg-gradient-to-r {
            background: solid !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Users;