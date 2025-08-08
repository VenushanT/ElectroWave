import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { currentUser } from '../../store/authSlice';
import { setUser, updateUser, logout, setLoading, setError, clearError } from '../../store/authSlice';
import { Camera, Mail, Phone, MapPin, Calendar, Edit2, Save, X, LogOut, User, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

function UserProfile() {
  const { user, loading, error, isAuthenticated, token } = useSelector((state) => state.auth);
  const currentUserData = useSelector((state) => currentUser(state));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    bio: '',
    profilePicture: null,
    previewImage: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (currentUserData) {
      setEditData({
        firstName: currentUserData.firstName || '',
        lastName: currentUserData.lastName || '',
        email: currentUserData.email || '',
        phoneNumber: currentUserData.phoneNumber || '',
        dateOfBirth: currentUserData.dateOfBirth ? currentUserData.dateOfBirth.split('T')[0] : '',
        address: currentUserData.address || '',
        bio: currentUserData.bio || '',
        profilePicture: null,
        previewImage: currentUserData.profilePicture ? `http://localhost:5000${currentUserData.profilePicture}` : null,
      });
    } else {
      setEditData((prev) => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: '',
        bio: '',
        profilePicture: null,
        previewImage: null,
      }));
    }
  }, [currentUserData]);

  const fetchProfile = async () => {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.user) {
        dispatch(setUser({ user: response.data.user, token }));
      } else {
        dispatch(setError('No user data received from server'));
      }
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch profile'));
      if (error.response?.status === 401) {
        dispatch(logout());
        navigate('/login');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSave = async () => {
    dispatch(setLoading(true));
    dispatch(clearError());
    const formData = new FormData();
    formData.append('firstName', editData.firstName);
    formData.append('lastName', editData.lastName);
    formData.append('email', editData.email);
    formData.append('phoneNumber', editData.phoneNumber);
    formData.append('dateOfBirth', editData.dateOfBirth);
    formData.append('address', editData.address);
    formData.append('bio', editData.bio);
    if (editData.profilePicture) {
      formData.append('profilePicture', editData.profilePicture);
    }

    try {
      const response = await axios.put(`${API_URL}/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      dispatch(updateUser(response.data.user));
      setEditData((prev) => ({
        ...prev,
        previewImage: response.data.user.profilePicture ? `http://localhost:5000${response.data.user.profilePicture}` : null,
      }));
      await fetchProfile(); // Refresh profile to ensure consistency
      setIsEditing(false);
      window.scrollTo(0, 0); // Scroll to top after successful save
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to update profile'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: currentUserData?.firstName || '',
      lastName: currentUserData?.lastName || '',
      email: currentUserData?.email || '',
      phoneNumber: currentUserData?.phoneNumber || '',
      dateOfBirth: currentUserData?.dateOfBirth ? currentUserData.dateOfBirth.split('T')[0] : '',
      address: currentUserData?.address || '',
      bio: currentUserData?.bio || '',
      profilePicture: null,
      previewImage: currentUserData?.profilePicture ? `http://localhost:5000${currentUserData.profilePicture}` : null,
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      dispatch(setLoading(true));
      dispatch(clearError());
      try {
        await axios.delete(`${API_URL}/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(logout());
        navigate('/login');
      } catch (error) {
        dispatch(setError(error.response?.data?.message || 'Failed to delete account'));
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData({
        ...editData,
        profilePicture: file,
        previewImage: URL.createObjectURL(file),
      });
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-700 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUserData && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center text-sm">
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl font-medium text-blue-700 shadow-md">
                  {editData.previewImage ? (
                    <img
                      src={editData.previewImage}
                      alt={`${editData.firstName} ${editData.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : currentUserData?.profilePicture ? (
                    <img
                      src={`http://localhost:5000${currentUserData.profilePicture}`}
                      alt={`${currentUserData.firstName} ${currentUserData.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(currentUserData?.firstName, currentUserData?.lastName)
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer shadow-md">
                    <Camera className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {`${currentUserData?.firstName || editData.firstName} ${currentUserData?.lastName || editData.lastName}`}
                  </h1>
                  <p className="text-gray-700">{currentUserData?.email || editData.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {currentUserData?.createdAt ? new Date(currentUserData.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <p className="text-gray-600 max-w-2xl">{currentUserData?.bio || editData.bio || 'No bio provided'}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center font-medium transition-all ${
                      isEditing
                        ? 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
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
                    onClick={() => {
                      dispatch(logout());
                      navigate('/login');
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center font-medium transition-all"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center justify-center font-medium transition-all"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Update your personal information' : 'Your account details'}
            </p>
          </div>
          <div className="p-6 sm:p-8">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      placeholder="Enter your last name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      value={editData.phoneNumber}
                      onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    id="address"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    placeholder="Enter your address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center font-medium transition-all ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-600">{currentUserData?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-sm text-gray-600">{currentUserData?.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                      <p className="text-sm text-gray-600">
                        {currentUserData?.dateOfBirth ? new Date(currentUserData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-sm text-gray-600">{currentUserData?.address || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Member Since</p>
                      <p className="text-sm text-gray-600">
                        {currentUserData?.createdAt ? new Date(currentUserData.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">About</p>
                    <p className="text-sm text-gray-600">{currentUserData?.bio || 'Not provided'}</p>
                  </div>
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