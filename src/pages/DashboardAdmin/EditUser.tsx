import { redirect, useLoaderData, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import type { Trader } from './TradersAdmin';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface Country {
  id: number;
  name: string;
  code: string;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const user = storeState.userState?.user;

  if (!user || user.user_role !== 'admin') {
    toast.warn('There must be an error in this page');
    return redirect('/dashboard');
  }

  const id = params.id;

  if (!id) {
    toast.error('User ID is required');
    return redirect('/admin');
  }

  const userDetailsQuery = {
    queryKey: ['userDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/users/${id}`, {
        headers: {
          Authorization: user.token,
        },
      });
      return response.data;
    },
  };

  const countriesQuery = {
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await customFetch.get('/countries');
      return response.data;
    },
  };

  try {
    const [userDetails, countries] = await Promise.all([
      queryClient.ensureQueryData(userDetailsQuery),
      queryClient.ensureQueryData(countriesQuery),
    ]);
    return { userDetails, countries };
  } catch (error: any) {
    console.error('Failed to load user:', error);
    toast.error('Failed to load user details');
    return redirect('/admin');
  }
};

const EditUser = () => {
  const { userDetails, countries } = useLoaderData() as { 
    userDetails: Trader; 
    countries: Country[];
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.userState.user);

  // Form state
  const [formData, setFormData] = useState({
    email: userDetails.email,
    first_name: userDetails.first_name,
    middle_name: userDetails.middle_name || '',
    last_name: userDetails.last_name,
    date_of_birth: userDetails.date_of_birth,
    mobile_no: userDetails.mobile_no,
    address_line_01: userDetails.address_line_01 || '',
    address_line_02: userDetails.address_line_02 || '',
    city: userDetails.city || '',
    zip_code: userDetails.zip_code,
    country_id: userDetails.country_id,
    user_status: userDetails.user_status,
    user_role: userDetails.user_role,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await customFetch.patch(
        `/users/${userDetails.id}`,
        {
          user: userData,
        },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userDetails', userDetails.id.toString()] });
      navigate('/admin');
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the payload matching the API format
    const payload = {
      ...formData,
      country: countries.find(c => c.id === parseInt(formData.country_id.toString())),
    };
    
    updateUserMutation.mutate(payload);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-4 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="px-4 py-1 rounded-full text-sm font-medium bg-yellow-500 text-black">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-4 py-1 rounded-full text-sm font-medium bg-red-500 text-white">
            Rejected
          </span>
        );
      default:
        return <span className="text-gray-400">{status}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <span className="px-4 py-1 rounded-full text-sm font-medium bg-pink-500 text-white">
        Admin
      </span>
    ) : (
      <span className="px-4 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
        Trader
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#161420] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Traders List
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Edit Trader</h1>
          <p className="text-gray-400">
            Editing information for {userDetails.first_name}{' '}
            {userDetails.last_name}
          </p>
        </div>

        {/* Current Status Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Current Status</h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(formData.user_status)}
            </div>
          </div>

          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Current Role</h3>
            <div className="flex items-center gap-2">
              {getRoleBadge(formData.user_role)}
            </div>
          </div>

          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">User ID</h3>
            <p className="text-2xl font-bold text-blue-400">#{userDetails.id}</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address_line_01"
                  value={formData.address_line_01}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address_line_02"
                  value={formData.address_line_02}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Country *
                </label>
                <select
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Country...</option>
                  {countries
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
              Account Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  User Status *
                </label>
                <select
                  name="user_status"
                  value={formData.user_status}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  User Role *
                </label>
                <select
                  name="user_role"
                  value={formData.user_role}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="trader">Trader</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateUserMutation.isPending}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;