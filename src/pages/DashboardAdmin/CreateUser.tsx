import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface Country {
  id: number;
  name: string;
  code: string;
}

const CreateUser = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.userState.user);
  const [countries, setCountries] = useState<Country[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    mobile_no: '',
    address_line_01: '',
    address_line_02: '',
    city: '',
    zip_code: '',
    country_id: '',
    user_status: 'approved' as 'pending' | 'approved' | 'rejected',
    user_role: 'trader' as 'trader' | 'admin',
    password: '',
    password_confirmation: '',
  });

  // Load countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await customFetch.get('/countries');
        setCountries(response.data);
      } catch (error) {
        console.error('Failed to load countries:', error);
        toast.error('Failed to load countries');
      }
    };
    fetchCountries();
  }, []);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await customFetch.post(
        '/users',
        userData,
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
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['users', user?.id] });
      // Reset form
      setFormData({
        email: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        mobile_no: '',
        address_line_01: '',
        address_line_02: '',
        city: '',
        zip_code: '',
        country_id: '',
        user_status: 'approved',
        user_role: 'trader',
        password: '',
        password_confirmation: '',
      });
    },
    onError: (error: any) => {
      console.error('Create failed:', error);
      const errorMessage =
        error.response?.data?.message || 
        error.response?.data?.error?.message ||
        'Failed to create user';
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
    
    // Validation
    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Create the payload matching the API format
    const payload = {
      user: {
        email: formData.email,
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        mobile_no: formData.mobile_no,
        address_line_01: formData.address_line_01 || null,
        address_line_02: formData.address_line_02 || null,
        city: formData.city || null,
        zip_code: formData.zip_code,
        country_id: parseInt(formData.country_id),
        user_role: formData.user_role,
        user_status: formData.user_status,
      },
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    };
    
    createUserMutation.mutate(payload);
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
    <div className="min-h-screen bg-[#161420] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Trader</h1>
          <p className="text-gray-400">
            Add a new trader to the system with complete account information
          </p>
        </div>

        {/* Current Selection Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Status</h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(formData.user_status)}
            </div>
          </div>

          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Role</h3>
            <div className="flex items-center gap-2">
              {getRoleBadge(formData.user_role)}
            </div>
          </div>
        </div>

        {/* Create Form */}
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
                  placeholder="user@example.com"
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
                  placeholder="+1234567890"
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
                  placeholder="John"
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
                  placeholder="Michael"
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
                  placeholder="Doe"
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
                  placeholder="123 Main Street"
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
                  placeholder="Apt 4B"
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
                  placeholder="New York"
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
                  placeholder="10001"
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
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
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

          {/* Password Section */}
          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
              Password Setup
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Password * (minimum 6 characters)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                  minLength={6}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                  minLength={6}
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  email: '',
                  first_name: '',
                  middle_name: '',
                  last_name: '',
                  date_of_birth: '',
                  mobile_no: '',
                  address_line_01: '',
                  address_line_02: '',
                  city: '',
                  zip_code: '',
                  country_id: '',
                  user_status: 'approved',
                  user_role: 'trader',
                  password: '',
                  password_confirmation: '',
                });
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {createUserMutation.isPending ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;