import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserDetailsModal({ user, isOpen, onClose, onStatusUpdate, onDelete }) {
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isSuperAdmin } = useAuth();

  if (!isOpen || !user) return null;

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    await onStatusUpdate(user.id, newStatus);
    setUpdating(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(user.id);
    setDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Registration Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {/* Two-column layout for desktop, single column for mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.mobile}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.college}</p>
                  </div>
                  {user.preferredLanguage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          {user.preferredLanguage}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PRN Number</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.prnNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.yearOfStudy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stream</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.stream}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Workshop</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {user.workshop}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Payment Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {user.transactionId || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Date & Time</label>
                    <div className="mt-1 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Date:</span>
                        <span className="text-sm text-gray-900">
                          {user.registrationDate?.toDate?.()?.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Time:</span>
                        <span className="text-sm text-gray-900">
                          {user.registrationDate?.toDate?.()?.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                          }) || 'N/A'}
                        </span>
                      </div>
                      {user.registrationDate?.toDate && (
                        <div className="mt-2 text-xs text-gray-500">
                          {(() => {
                            const regDate = user.registrationDate.toDate();
                            const now = new Date();
                            const diffTime = Math.abs(now - regDate);
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
                            
                            if (diffDays > 0) {
                              return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                            } else if (diffHours > 0) {
                              return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                            } else {
                              return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {user.paymentProofUrl && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Proof</h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img 
                      src={user.paymentProofUrl} 
                      alt="Payment Proof" 
                      className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-md cursor-pointer"
                      onClick={() => window.open(user.paymentProofUrl, '_blank')}
                    />
                    <p className="text-center mt-2 text-sm text-gray-600">
                      Click image to view full size
                    </p>
                  </div>
                </div>
              )}

              {/* Status Management */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Status Management</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status || 'pending'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                    <div className="flex flex-wrap gap-2">
                      {/* Approve Button */}
                      <button
                        onClick={() => handleStatusUpdate('approved')}
                        disabled={updating || user.status === 'approved'}
                        className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed md:px-4"
                        title="Approve Registration"
                      >
                        <svg className="w-4 h-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="hidden md:inline">{updating ? 'Updating...' : 'Approve'}</span>
                      </button>
                      
                      {/* Reject Button */}
                      <button
                        onClick={() => handleStatusUpdate('rejected')}
                        disabled={updating || user.status === 'rejected'}
                        className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed md:px-4"
                        title="Reject Registration"
                      >
                        <svg className="w-4 h-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span className="hidden md:inline">{updating ? 'Updating...' : 'Reject'}</span>
                      </button>
                      
                      {/* Reset to Pending Button */}
                      <button
                        onClick={() => handleStatusUpdate('pending')}
                        disabled={updating || user.status === 'pending' || !user.status}
                        className="flex items-center justify-center px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed md:px-4"
                        title="Reset to Pending"
                      >
                        <svg className="w-4 h-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="hidden md:inline">{updating ? 'Updating...' : 'Reset'}</span>
                      </button>

                      {/* Delete Button - SuperAdmin Only */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={updating || deleting}
                          className="flex items-center justify-center px-3 py-2 bg-red-800 text-white text-sm font-medium rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-700 disabled:opacity-50 disabled:cursor-not-allowed md:px-4 border-2 border-red-900"
                          title="Delete Registration (SuperAdmin Only)"
                        >
                          <svg className="w-4 h-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          <span className="hidden md:inline">{deleting ? 'Deleting...' : '👑 Delete'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                👑 Delete Registration
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to permanently delete this registration?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="text-sm text-red-800">
                  <p className="font-semibold">{user.fullName}</p>
                  <p>{user.email}</p>
                  <p>{user.workshop}</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Warning:</strong> This action cannot be undone. The registration data will be permanently removed from the system.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Permanently'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
