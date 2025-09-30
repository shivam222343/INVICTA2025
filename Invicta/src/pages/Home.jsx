import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { currentUser, userRole, isSuperAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
            <div className="text-sm text-gray-600">
                Welcome, <br />{currentUser?.displayName || currentUser?.email}
              </div>
            </div>
            <img className="h-12" src="./Invicta.png" alt="INVICTA 2025" />
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to INVICTA 2025!
          </h2>
          <p className="text-xl text-gray-600">
            Your gateway to technical excellence and innovation
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Registration Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Registration</h3>
              <p className="text-gray-600 mb-4">
                Register for workshops and technical events
              </p>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Register Now
              </Link>
            </div>
          </div>

          {/* Admin Panel Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isSuperAdmin ? '👑 SuperAdmin Dashboard' : 'Admin Dashboard'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isSuperAdmin 
                  ? 'Full system control with user role management' 
                  : userRole === 'admin' 
                  ? 'Manage registrations and settings' 
                  : 'Request admin access to manage events'}
              </p>
              <Link
                to="/admin"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                  isSuperAdmin 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isSuperAdmin 
                  ? '👑 Open SuperAdmin' 
                  : userRole === 'admin' 
                  ? 'Open Dashboard' 
                  : 'Request Access'}
              </Link>
            </div>
          </div>

          {/* About INVICTA Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About INVICTA</h3>
              <p className="text-gray-600 mb-4">
                Learn more about our technical event and workshops
              </p>
              <button
                onClick={() => window.open('https://invicta2025.com', '_blank')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h3>
          <div className="flex items-center space-x-4">
            <img 
              src={currentUser?.photoURL || '/default-avatar.png'} 
              alt="Profile" 
              className="w-16 h-16 rounded-full"
            />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {currentUser?.displayName || 'Unknown User'}
              </p>
              <p className="text-sm text-gray-600">{currentUser?.email}</p>
              <p className="text-sm text-gray-500">
                Role: <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                  userRole === 'superadmin' 
                    ? 'bg-red-100 text-red-800' 
                    : userRole === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {userRole === 'superadmin' ? '👑 SuperAdmin' : 
                   userRole === 'admin' ? '🔧 Admin' : '👤 User'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
