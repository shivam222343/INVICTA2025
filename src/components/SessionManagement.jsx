import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useToast } from '../contexts/ToastContext';

const SessionManagement = ({ registrations }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredAttendanceData, setFilteredAttendanceData] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { showToast } = useToast();

  // Form states for creating new session
  const [newSession, setNewSession] = useState({
    name: '',
    date: '',
    workshop: '',
    description: ''
  });

  // Get unique workshops from registrations
  const workshops = [...new Set(registrations.map(reg => reg.workshop))].filter(Boolean);

  // Filter attendance data based on search and status
  useEffect(() => {
    let filtered = [...attendanceData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(attendance =>
        attendance.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.participantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.participantCollege.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(attendance => attendance.status === statusFilter);
    }

    setFilteredAttendanceData(filtered);
  }, [attendanceData, searchTerm, statusFilter]);

  // Load sessions from Firebase
  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Create new session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    if (!newSession.name || !newSession.date || !newSession.workshop) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      // Get approved participants for the workshop
      const approvedParticipants = registrations.filter(
        reg => reg.workshop === newSession.workshop && reg.status === 'approved'
      );

      const sessionData = {
        ...newSession,
        createdAt: new Date(),
        participantCount: approvedParticipants.length
      };

      const sessionRef = await addDoc(collection(db, 'sessions'), sessionData);

      // Create attendance records for all approved participants
      const attendancePromises = approvedParticipants.map(participant => 
        addDoc(collection(db, 'attendance'), {
          sessionId: sessionRef.id,
          participantId: participant.id,
          participantName: participant.name,
          participantEmail: participant.email,
          workshop: newSession.workshop,
          status: 'pending', // Default status
          markedAt: null,
          markedBy: null
        })
      );

      await Promise.all(attendancePromises);

      showToast('Session created successfully!', 'success');
      setShowCreateModal(false);
      setNewSession({ name: '', date: '', workshop: '', description: '' });
    } catch (error) {
      console.error('Error creating session:', error);
      showToast('Failed to create session', 'error');
    }
  };

  // Load attendance for a session
  const loadAttendance = async (sessionId, workshopName) => {
    setLoadingAttendance(true);
    try {
      const q = query(
        collection(db, 'attendance'),
        where('sessionId', '==', sessionId)
      );
      const snapshot = await getDocs(q);
      let attendance = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If no attendance records exist, create them for approved participants
      if (attendance.length === 0 && workshopName) {
        const approvedParticipants = registrations.filter(
          reg => reg.workshop === workshopName && reg.status === 'approved'
        );

        if (approvedParticipants.length > 0) {
          showToast('Creating attendance records for approved participants...', 'info');
          
          const attendancePromises = approvedParticipants.map(participant => 
            addDoc(collection(db, 'attendance'), {
              sessionId: sessionId,
              participantId: participant.id,
              participantName: participant.name,
              participantEmail: participant.email,
              participantCollege: participant.college,
              participantYear: participant.yearOfStudy,
              participantStream: participant.stream,
              workshop: workshopName,
              status: 'pending',
              markedAt: null,
              markedBy: null
            })
          );

          await Promise.all(attendancePromises);
          
          // Reload attendance after creation
          const newSnapshot = await getDocs(q);
          attendance = newSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }
      }

      // Sort by participant name for better organization
      attendance.sort((a, b) => a.participantName.localeCompare(b.participantName));
      setAttendanceData(attendance);
      setFilteredAttendanceData(attendance);
    } catch (error) {
      console.error('Error loading attendance:', error);
      showToast('Failed to load attendance data', 'error');
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Update attendance status
  const updateAttendanceStatus = async (attendanceId, status) => {
    try {
      await updateDoc(doc(db, 'attendance', attendanceId), {
        status,
        markedAt: new Date(),
        markedBy: 'admin' // You can replace this with actual admin user info
      });
      
      // Update local state
      const updatedData = attendanceData.map(item => 
        item.id === attendanceId 
          ? { ...item, status, markedAt: new Date() }
          : item
      );
      setAttendanceData(updatedData);
      
      showToast(`Attendance marked as ${status}`, 'success');
    } catch (error) {
      console.error('Error updating attendance:', error);
      showToast('Failed to update attendance', 'error');
    }
  };

  // Mark all attendance with the same status
  const markAllAttendance = async (status) => {
    if (attendanceData.length === 0) return;
    
    try {
      // Update all attendance records in Firebase
      const updatePromises = attendanceData.map(attendance => 
        updateDoc(doc(db, 'attendance', attendance.id), {
          status,
          markedAt: new Date(),
          markedBy: 'admin'
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      const updatedData = attendanceData.map(item => ({
        ...item,
        status,
        markedAt: new Date()
      }));
      setAttendanceData(updatedData);
      
      showToast(`All participants marked as ${status}`, 'success');
    } catch (error) {
      console.error('Error updating all attendance:', error);
      showToast('Failed to update all attendance', 'error');
    }
  };

  // Handle session selection for attendance
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setSearchTerm(''); // Reset search
    setStatusFilter('all'); // Reset filter
    loadAttendance(session.id, session.workshop);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Session Management</h2>
          <p className="text-gray-600">Create sessions and manage attendance for workshop participants</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span className='hidden md:block'>Create Session</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Panel */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Sessions ({sessions.length})</h3>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sessions created yet</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedSession?.id === session.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{session.name}</h4>
                      <p className="text-sm text-gray-600">{session.workshop}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString()} • {session.participantCount} participants
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Session
                      </span>
                    </div>
                  </div>
                  {session.description && (
                    <p className="text-sm text-gray-600 mt-2">{session.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attendance Panel */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedSession ? `Attendance - ${selectedSession.name}` : 'Select a Session'}
              </h3>
              {selectedSession && (
                <div className="text-sm text-gray-600">
                  Workshop: <span className="font-medium">{selectedSession.workshop}</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {!selectedSession ? (
              <p className="text-gray-500 text-center py-8">Select a session to view attendance</p>
            ) : loadingAttendance ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search and Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Participants</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, email, or college..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{attendanceData.length}</div>
                    <div className="text-sm text-blue-800">Total</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceData.filter(a => a.status === 'present').length}
                    </div>
                    <div className="text-sm text-green-800">Present</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {attendanceData.filter(a => a.status === 'absent').length}
                    </div>
                    <div className="text-sm text-red-800">Absent</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {attendanceData.filter(a => a.status === 'pending').length}
                    </div>
                    <div className="text-sm text-yellow-800">Pending</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => markAllAttendance('present')}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => markAllAttendance('absent')}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                  >
                    Mark All Absent
                  </button>
                  <button
                    onClick={() => markAllAttendance('pending')}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                  >
                    Reset All
                  </button>
                </div>

                {/* Attendance List */}
                <div className="mb-2 text-sm text-gray-600">
                  Showing {filteredAttendanceData.length} of {attendanceData.length} participants
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAttendanceData.map((attendance, index) => (
                    <div key={attendance.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-gray-900">{attendance.participantName}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              attendance.status === 'present'
                                ? 'bg-green-100 text-green-800'
                                : attendance.status === 'absent'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {attendance.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{attendance.participantEmail}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>📚 {attendance.participantCollege}</span>
                            <span>🎓 {attendance.participantYear} - {attendance.participantStream}</span>
                          </div>
                          {attendance.markedAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              Marked: {new Date(attendance.markedAt.seconds * 1000).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Quick Action Buttons */}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateAttendanceStatus(attendance.id, 'present')}
                            className={`p-1 rounded ${
                              attendance.status === 'present'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                            } transition-colors`}
                            title="Mark Present"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => updateAttendanceStatus(attendance.id, 'absent')}
                            className={`p-1 rounded ${
                              attendance.status === 'absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                            } transition-colors`}
                            title="Mark Absent"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {attendanceData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No participants found for this session</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Make sure there are approved participants for the "{selectedSession?.workshop}" workshop
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Session</h3>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Name *
                </label>
                <input
                  type="text"
                  value={newSession.name}
                  onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Morning Session"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workshop *
                </label>
                <select
                  value={newSession.workshop}
                  onChange={(e) => setNewSession(prev => ({ ...prev, workshop: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Workshop</option>
                  {workshops.map((workshop) => (
                    <option key={workshop} value={workshop}>{workshop}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Optional session description"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;
