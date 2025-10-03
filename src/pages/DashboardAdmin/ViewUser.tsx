import { redirect, useLoaderData, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
// import type { Transaction } from '../Receipts/Receipts';
// import { useQuery } from '@tanstack/react-query';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../../store';
import type { Trader } from './TradersAdmin';


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

  try {
    const userDetails = await queryClient.ensureQueryData(userDetailsQuery);
    return { userDetails };
  } catch (error: any) {
    console.error('Failed to load user:', error);
    toast.error('Failed to load user details');
    return redirect('/admin');
  }
};

const ViewUser = () => {
  const { userDetails } = useLoaderData() as { userDetails: Trader };
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <h1 className="text-3xl font-bold text-white mb-2">Trader Details</h1>
          <p className="text-gray-400">
            Viewing complete information for {userDetails.first_name}{' '}
            {userDetails.last_name}
          </p>
        </div>

        {/* Status and Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Account Status</h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(userDetails.user_status)}
            </div>
          </div>

          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">User Role</h3>
            <div className="flex items-center gap-2">
              {getRoleBadge(userDetails.user_role)}
            </div>
          </div>

          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Wallet Balance</h3>
            <p className="text-2xl font-bold text-green-400">
              ${userDetails.wallet ? parseFloat(userDetails.wallet.balance).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-400 text-xs font-extralight">User ID</label>
              <p className="text-white text-sm mt-1">{userDetails.id}</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">Email Address</label>
              <p className="text-white text-sm mt-1">{userDetails.email}</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">First Name</label>
              <p className="text-white text-sm mt-1">{userDetails.first_name}</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">Middle Name</label>
              <p className="text-white text-sm mt-1">
                {userDetails.middle_name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">Last Name</label>
              <p className="text-white text-sm mt-1">{userDetails.last_name}</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">Date of Birth</label>
              <p className="text-white text-sm mt-1">
                {formatDate(userDetails.date_of_birth)}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">Mobile Number</label>
              <p className="text-white text-sm mt-1">{userDetails.mobile_no}</p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-400 text-xs font-extralight">Address Line 1</label>
              <p className="text-white text-sm mt-1">
                {userDetails.address_line_01 || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">Address Line 2</label>
              <p className="text-white text-sm mt-1">
                {userDetails.address_line_02 || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">City</label>
              <p className="text-white text-sm mt-1">{userDetails.city || 'N/A'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">ZIP Code</label>
              <p className="text-white text-sm mt-1">{userDetails.zip_code}</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">Country</label>
              <p className="text-white text-sm mt-1">
                {userDetails.country.name} ({userDetails.country.code})
              </p>
            </div>
          </div>
        </div>

        {/* Account Activity */}
        <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
            Account Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-gray-400 text-xs font-extralight">Account Created</label>
              <p className="text-white text-sm mt-1">
                {formatDateTime(userDetails.created_at)}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">Last Updated</label>
              <p className="text-white text-sm mt-1">
                {formatDateTime(userDetails.updated_at)}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-extralight">Email Confirmed</label>
              <p className="text-white text-sm mt-1">
                {userDetails.confirmed_at ? formatDateTime(userDetails.confirmed_at) : 'Not confirmed'}
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Information */}
        {userDetails.wallet && (
          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
              Wallet Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-400 text-xs font-extralight">Wallet ID</label>
                <p className="text-white text-sm mt-1">{userDetails.wallet.id}</p>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-extralight">Current Balance</label>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  ${parseFloat(userDetails.wallet.balance).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ViewUser;
