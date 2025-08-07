import React, { useState } from "react";
import { 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2, 
  Save, 
  X, 
  LogOut, 
  User 
} from "lucide-react";

function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Oak Street, San Francisco, CA 94102",
    bio: "Passionate about technology and design. Love exploring new products and sharing experiences with the community.",
    dateOfBirth: "1990-05-15",
    avatar: "/user-avatar.png",
    joinDate: "January 2023"
  });
  const [editData, setEditData] = useState(userData);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUserData(editData);
    setIsEditing(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="mx-auto py-8 px-4 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white shadow-lg rounded-xl mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl font-medium text-blue-700 shadow-lg">
                  {userData.avatar ? (
                    <img src={userData.avatar || "/placeholder.svg"} alt={userData.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(userData.name)
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-lg transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{userData.name}</h1>
                    <p className="text-slate-600">{userData.email}</p>
                    <p className="text-sm text-slate-500">Member since {userData.joinDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-4 py-2 rounded-lg flex items-center transition-all font-semibold ${
                        isEditing 
                          ? 'border border-slate-300 text-slate-700 hover:bg-slate-50' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Profile
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center shadow-lg hover:shadow-xl transition-all font-semibold"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 max-w-2xl">{userData.bio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {isEditing ? "Update your personal information" : "Your account details"}
            </p>
          </div>
          <div className="p-6 space-y-6">
            {isEditing ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dateOfBirth" className="text-sm font-semibold text-slate-700">Date of Birth</label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-semibold text-slate-700">Address</label>
                  <input
                    id="address"
                    value={editData.address}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    placeholder="Enter your address"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-semibold text-slate-700">Bio</label>
                  <textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    rows={4}
                    placeholder="Tell us about yourself"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Email</p>
                        <p className="text-sm text-slate-600">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Phone</p>
                        <p className="text-sm text-slate-600">{userData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Date of Birth</p>
                        <p className="text-sm text-slate-600">
                          {new Date(userData.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Address</p>
                        <p className="text-sm text-slate-600">{userData.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Member Since</p>
                        <p className="text-sm text-slate-600">{userData.joinDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="border-slate-200" />
                <div className="p-4 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg">
                  <p className="text-sm font-semibold text-slate-700 mb-2">About</p>
                  <p className="text-sm text-slate-600">{userData.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
