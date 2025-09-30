import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useToast } from '../contexts/ToastContext';
import UserDetailsModal from './UserDetailsModal';

const WorkshopManagement = ({ registrations }) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [workshopParticipants, setWorkshopParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const { showToast } = useToast();

  // Get workshop statistics
  const getWorkshopStats = () => {
    const workshopStats = {};
    
    registrations.forEach(reg => {
      if (!workshopStats[reg.workshop]) {
        workshopStats[reg.workshop] = {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        };
      }
      
      workshopStats[reg.workshop].total++;
      if (reg.status === 'approved') workshopStats[reg.workshop].approved++;
      else if (reg.status === 'pending' || !reg.status) workshopStats[reg.workshop].pending++;
      else if (reg.status === 'rejected') workshopStats[reg.workshop].rejected++;
    });
    
    return Object.entries(workshopStats).map(([name, stats]) => ({
      name,
      ...stats
    }));
  };

  const workshopStats = getWorkshopStats();

  // Handle workshop selection
  const handleWorkshopSelect = (workshopName) => {
    setSelectedWorkshop(workshopName);
    const participants = registrations.filter(reg => reg.workshop === workshopName);
    setWorkshopParticipants(participants);
    setFilteredParticipants(participants);
    setStatusFilter('all');
    setSearchTerm('');
  };

  // Filter and sort participants
  useEffect(() => {
    let filtered = [...workshopParticipants];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(participant => {
        if (statusFilter === 'pending') {
          return participant.status === 'pending' || !participant.status;
        }
        return participant.status === statusFilter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(participant =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.college.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredParticipants(filtered);
  }, [workshopParticipants, statusFilter, searchTerm, sortBy, sortOrder]);

  // Update registration status
  const updateStatus = async (registrationId, newStatus) => {
    try {
      await updateDoc(doc(db, 'registrations', registrationId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setWorkshopParticipants(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { ...reg, status: newStatus } : reg
        )
      );
      
      showToast(`Registration ${newStatus} successfully`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get workshop color based on index
  const getWorkshopColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Workshop Management</h2>
        <p className="text-gray-600">View workshop statistics and manage participants</p>
      </div>

      {!selectedWorkshop ? (
        /* Workshop Cards Grid */
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Workshops ({workshopStats.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshopStats.map((workshop, index) => (
              <div
                key={workshop.name}
                onClick={() => handleWorkshopSelect(workshop.name)}
                className={`bg-gradient-to-r ${getWorkshopColor(index)} rounded-lg p-6 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold truncate">{workshop.name}</h4>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">Total Registrations</span>
                    <span className="text-xl font-bold">{workshop.total}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white bg-opacity-20 rounded px-2 py-1 text-center">
                      <div className="font-semibold">{workshop.approved}</div>
                      <div className="opacity-90">Approved</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded px-2 py-1 text-center">
                      <div className="font-semibold">{workshop.pending}</div>
                      <div className="opacity-90">Pending</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded px-2 py-1 text-center">
                      <div className="font-semibold">{workshop.rejected}</div>
                      <div className="opacity-90">Rejected</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Workshop Participants List */
        <div>
          {/* Back Button and Workshop Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedWorkshop(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Workshops</span>
              </button>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedWorkshop}</h3>
                <p className="text-gray-600">{filteredParticipants.length} participants</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or college..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="college">College</option>
                  <option value="registrationDate">Registration Date</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Participants Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      College
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year/Stream
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-500">{participant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.college}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {participant.yearOfStudy} - {participant.stream}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(participant.status)}`}>
                          {participant.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(participant);
                            setIsModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          View
                        </button>
                        
                        {participant.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(participant.id, 'approved')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        
                        {participant.status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(participant.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredParticipants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No participants found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onStatusUpdate={(id, status) => updateStatus(id, status)}
        />
      )}
    </div>
  );
};

export default WorkshopManagement;
