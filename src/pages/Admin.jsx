import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, orderBy, query, doc, updateDoc, getDoc, setDoc, addDoc, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import UserDetailsModal from '../components/UserDetailsModal';
import RegistrationFilters from '../components/RegistrationFilters';
import Analytics from '../components/Analytics';
import AdminSettings from '../components/AdminSettings';

export default function Admin() {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registrations');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminSettings, setAdminSettings] = useState(null);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingHTML, setExportingHTML] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccessRequests, setShowAccessRequests] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [selectedUserForRoleChange, setSelectedUserForRoleChange] = useState(null);
  const { currentUser, logout, promoteToAdmin, isSuperAdmin, changeUserRole, getAllUsers } = useAuth();
  const { success: showSuccess, info: showInfo, error: showError } = useToast();
  
  // Refs for click-outside functionality
  const notificationRef = useRef(null);
  const accessRequestRef = useRef(null);
  const passwordModalRef = useRef(null);

  // Setup real-time listeners for notifications and access requests
  useEffect(() => {
    const unsubscribe = setupRealtimeListener();
    loadAdminSettings();
    setupNotificationListener();
    setupAccessRequestListener();
    
    return () => {
      unsubscribe();
    };
  }, []);

 // Keyboard shortcuts and click outside functionality
useEffect(() => {
  // Keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          setActiveTab('registrations');
          break;
        case '2':
          e.preventDefault();
          handleSettingsClick();
          break;
        case '3':
          e.preventDefault();
          setActiveTab('analytics');
          showInfo('Switched to Analytics tab', 2000);
          break;
        case '4':
          e.preventDefault();
          if (isSuperAdmin) {
            setActiveTab('superadmin');
            showInfo('Switched to SuperAdmin tab', 2000);
          } else {
            showError('Access denied: SuperAdmin privileges required');
          }
          break;
        case 'e':
          e.preventDefault();
          exportToCSV();
          break;
        case 'h':
          e.preventDefault();
          exportToHTML();
          break;
        default:
          break;
      }
    }
  };

  // Click outside functionality
  const handleClickOutside = (event) => {
    // Close notifications panel if clicked outside
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
    
    // Close access requests panel if clicked outside
    if (accessRequestRef.current && !accessRequestRef.current.contains(event.target)) {
      setShowAccessRequests(false);
    }
    
    // Close password modal if clicked outside
    if (passwordModalRef.current && !passwordModalRef.current.contains(event.target)) {
      setShowPasswordModal(false);
      setPasswordInput('');
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  document.addEventListener('mousedown', handleClickOutside);
  
  return () => {
    document.removeEventListener('keydown', handleKeyPress);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isSuperAdmin, showInfo, showError]);


  // Filter registrations when data changes
  useEffect(() => {
    setFilteredRegistrations(registrations);
  }, [registrations]);

  const setupRealtimeListener = () => {
    const q = query(collection(db, 'registrations'), orderBy('registrationDate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newData = [];
      const changes = querySnapshot.docChanges();
      
      querySnapshot.forEach((doc) => {
        newData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Check for new registrations to show notifications
      changes.forEach((change) => {
        if (change.type === 'added' && !loading) {
          const newReg = { id: change.doc.id, ...change.doc.data() };
          showInfo(`New registration: ${newReg.fullName} registered for ${newReg.workshop}`, 8000);
        }
      });
      
      setRegistrations(newData);
      setLoading(false);
    }, (error) => {
      console.error('Error in real-time listener:', error);
      setLoading(false);
    });

    // Return cleanup function
    return unsubscribe;
  };

  const loadAdminSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'adminSettings', 'formConfig'));
      if (settingsDoc.exists()) {
        setAdminSettings(settingsDoc.data());
      }
    } catch (error) {
      console.error('Error loading admin settings:', error);
    }
  };

  const exportToCSV = async () => {
    if (exportingCSV) return;
    
    try {
      setExportingCSV(true);
      showInfo('Preparing CSV export...', 2000);
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const headers = ['Name', 'Email', 'Mobile', 'College', 'PRN', 'Year', 'Stream', 'Workshop', 'Transaction ID', 'Status', 'Registration Date'];
      const csvContent = [
        headers.join(','),
        ...filteredRegistrations.map(reg => [
          `"${reg.fullName}"`,
          `"${reg.email}"`,
          `"${reg.mobile}"`,
          `"${reg.college}"`,
          `"${reg.prnNumber}"`,
          `"${reg.yearOfStudy}"`,
          `"${reg.stream}"`,
          `"${reg.workshop}"`,
          `"${reg.transactionId || 'N/A'}"`,
          `"${reg.status || 'pending'}"`,
          `"${reg.registrationDate?.toDate?.()?.toLocaleDateString() || 'N/A'}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `invicta-registrations-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess(`✅ CSV exported successfully! (${filteredRegistrations.length} records)`);
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to export CSV. Please try again.');
    } finally {
      setExportingCSV(false);
    }
  };

  // Password verification for settings
  const handlePasswordSubmit = () => {
    if (passwordInput === "S_Open_QR&Payment") {
      setIsSettingsUnlocked(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      showSuccess('Settings unlocked successfully!');
    } else {
      showError('Incorrect password. Access denied.');
      setPasswordInput('');
    }
  };

  // Handle settings tab click
  const handleSettingsClick = () => {
    if (!isSettingsUnlocked) {
      setShowPasswordModal(true);
    } else {
      setActiveTab('settings');
    }
  };

  // Setup real-time notification listener
  const setupNotificationListener = () => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const notificationsList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notificationsList.push({
          id: doc.id,
          ...data,
          time: data.createdAt?.toDate().toLocaleString() || 'Just now'
        });
      });
      setNotifications(notificationsList.slice(0, 10)); // Keep only latest 10
    });
  };

  // Setup real-time access request listener
  const setupAccessRequestListener = () => {
    const requestsRef = collection(db, 'adminRequests');
    const q = query(requestsRef, where('status', '==', 'pending'));
    
    return onSnapshot(q, (snapshot) => {
      const requestsList = [];
      snapshot.forEach((doc) => {
        requestsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setAccessRequests(requestsList);
    });
  };

  // Handle notification click - mark all as read and toggle panel
  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    
    // Mark all unread notifications as read when opening the panel
    if (!showNotifications) {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Update each unread notification in Firestore
      const updatePromises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), { read: true })
      );
      
      try {
        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  // Load all users (SuperAdmin only)
  const loadAllUsers = async () => {
    if (!isSuperAdmin) return;
    
    setLoadingUsers(true);
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle role change (SuperAdmin only)
  const handleRoleChange = async (email, newRole) => {
    if (!isSuperAdmin) {
      showError('Access denied: SuperAdmin privileges required');
      return;
    }

    try {
      await changeUserRole(email, newRole, currentUser.email);
      showSuccess(`User role changed to ${newRole} successfully`);
      
      // Refresh users list
      await loadAllUsers();
      
      // Close modal
      setShowRoleChangeModal(false);
      setSelectedUserForRoleChange(null);
    } catch (error) {
      console.error('Error changing user role:', error);
      showError('Failed to change user role');
    }
  };

  // Handle access request approval/rejection
  const handleAccessRequest = async (requestId, email, action) => {
    try {
      if (action === 'approve') {
        // Promote user to admin role
        await promoteToAdmin(email);
        
        // Update request status
        await updateDoc(doc(db, 'adminRequests', requestId), {
          status: 'approved',
          approvedBy: currentUser.email,
          approvedAt: serverTimestamp()
        });
        
        // Add approval notification
        await addDoc(collection(db, 'notifications'), {
          type: 'admin_approved',
          title: 'Admin Access Approved',
          message: `${email} has been granted admin access`,
          email: email,
          createdAt: serverTimestamp(),
          read: false
        });
        
        showSuccess(`Admin access approved for ${email}`);
      } else {
        // Update request status to rejected
        await updateDoc(doc(db, 'adminRequests', requestId), {
          status: 'rejected',
          rejectedBy: currentUser.email,
          rejectedAt: serverTimestamp()
        });
        
        showError(`Admin access rejected for ${email}`);
      }
    } catch (error) {
      console.error('Error handling access request:', error);
      showError('Failed to process request');
    }
  };

  const exportToHTML = () => {
    setExportingHTML(true);
    
    try {
      // Use filteredRegistrations if available, otherwise fall back to registrations
      const dataToExport = filteredRegistrations.length > 0 ? filteredRegistrations : registrations;
      
      if (dataToExport.length === 0) {
        showError('No registration data available to export');
        setExportingHTML(false);
        return;
      }

      const currentDate = new Date().toLocaleDateString();
      const totalCount = dataToExport.length;
      const approvedCount = dataToExport.filter(reg => reg.status === 'approved').length;
      const pendingCount = dataToExport.filter(reg => reg.status === 'pending').length;
      const rejectedCount = dataToExport.filter(reg => reg.status === 'rejected').length;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INVICTA 2025 - Registration Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            background: white;
            padding: 20px;
            color: #333;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .header h1 { 
            font-size: 1.8rem; 
            margin-bottom: 8px; 
            font-weight: 600; 
            color: #333;
        }
        .header p { 
            font-size: 0.9rem; 
            color: #666;
        }
        .table-container { 
            overflow-x: auto; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            background: white; 
            border: 2px solid #333;
        }
        th { 
            background: #f8f9fa; 
            color: #333; 
            padding: 12px 8px; 
            text-align: left; 
            font-weight: 600;
            font-size: 0.85rem;
            border: 1px solid #333;
        }
        td { 
            padding: 8px; 
            border: 1px solid #333; 
            font-size: 0.8rem;
            text-align: left;
            background: white;
        }
        tr:nth-child(even) td { 
            background: #f8f9fa; 
        }
        .status { 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-size: 0.75rem; 
            font-weight: 600; 
            text-transform: capitalize;
            display: inline-block;
            border: 1px solid #333;
        }
        .status.approved { background: #e8f5e8; color: #2e7d32; }
        .status.pending { background: #fff8e1; color: #f57c00; }
        .status.rejected { background: #ffebee; color: #d32f2f; }
        .name-cell { 
            font-weight: 600; 
        }
        .footer { 
            text-align: center; 
            padding: 20px 0; 
            color: #666; 
            border-top: 1px solid #333;
            font-size: 0.8rem;
            margin-top: 30px;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>INVICTA 2025 - Registration Data</h1>
            <p>Generated on ${currentDate} | Total: ${totalCount} registrations</p>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>PRN</th>
                        <th>Year</th>
                        <th>Domain</th>
                        <th>Payment ID</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${dataToExport.map(reg => `
                        <tr>
                            <td class="name-cell">${reg.fullName || 'N/A'}</td>
                            <td>${reg.email || 'N/A'}</td>
                            <td>${reg.mobile || 'N/A'}</td>
                            <td>${reg.prnNumber || 'N/A'}</td>
                            <td>${reg.yearOfStudy || 'N/A'}</td>
                            <td>${reg.workshop || 'N/A'}</td>
                            <td>${reg.transactionId || 'N/A'}</td>
                            <td><span class="status ${reg.status || 'pending'}">${reg.status || 'pending'}</span></td>
                            <td>${reg.registrationDate?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>INVICTA 2025 Event Management System</p>
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `invicta-registrations-${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess(`✅ HTML report exported successfully! (${dataToExport.length} records)`);
    } catch (error) {
      console.error('HTML export error:', error);
      showError('Failed to export HTML report. Please try again.');
    } finally {
      setExportingHTML(false);
    }
  };

  const updateRegistrationStatus = async (registrationId, newStatus) => {
    try {
      await updateDoc(doc(db, 'registrations', registrationId), {
        status: newStatus
      });

      const statusText = newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'reset to pending';
      showSuccess(`Registration ${statusText} successfully!`);
      
      // Update local state
      setRegistrations(registrations.map(reg => 
        reg.id === registrationId ? { ...reg, status: newStatus } : reg
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status. Please try again.');
    }
  };

  const deleteRegistration = async (registrationId) => {
    if (!isSuperAdmin) {
      showError('Access denied: SuperAdmin privileges required');
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'registrations', registrationId));
      
      // Update local state
      setRegistrations(registrations.filter(reg => reg.id !== registrationId));
      setFilteredRegistrations(filteredRegistrations.filter(reg => reg.id !== registrationId));
      
      showSuccess('Registration deleted successfully!');
      
      // Add deletion log to notifications
      await addDoc(collection(db, 'notifications'), {
        type: 'registration_deleted',
        title: 'Registration Deleted',
        message: `SuperAdmin ${currentUser.email} deleted a registration`,
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error('Error deleting registration:', error);
      showError('Failed to delete registration. Please try again.');
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleFilterChange = (filtered) => {
    setFilteredRegistrations(filtered);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invicta Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome, {currentUser?.displayName || currentUser?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Keyboard Shortcuts Help */}
              <div className="hidden md:block text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>⌘+1 Registrations</span>
                  <span>⌘+2 Settings</span>
                  <span>⌘+3 Analytics</span>
                  {isSuperAdmin && <span>⌘+4 SuperAdmin</span>}
                  <span>⌘+E Export CSV</span>
                  <span>⌘+H Export HTML</span>
                </div>
              </div>
              
              {/* Notifications Icon */}
              <div className="relative">
                <button
                  onClick={() => handleNotificationClick()}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM11 19H6.334c-.706 0-1.334-.895-1.334-2V9c0-3.866 3.582-7 8-7s8 3.134 8 7v8c0 1.105-.628 2-1.334 2H15M9 9l3 3 5-5" />
                  </svg>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Access Requests Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowAccessRequests(!showAccessRequests)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  {accessRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {accessRequests.length}
                    </span>
                  )}
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('registrations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'registrations'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Registrations ({filteredRegistrations.length})
              </button>
              <button
                onClick={handleSettingsClick}
                className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === 'settings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Form Settings
                {!isSettingsUnlocked && (
                  <svg className="w-3 h-3 inline-block ml-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                  </svg>
                )}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Analytics
              </button>
              
              {/* SuperAdmin Tab - Only visible to SuperAdmins */}
              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('superadmin');
                    loadAllUsers(); // Load users when switching to SuperAdmin tab
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'superadmin'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  👑 SuperAdmin
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'registrations' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Registrations</dt>
                          <dd className="text-lg font-medium text-gray-900">{filteredRegistrations.length}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {filteredRegistrations.filter(r => r.status === 'approved').length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {filteredRegistrations.filter(r => r.status === 'pending' || !r.status).length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5 space-y-3">
                    <button
                      onClick={exportToCSV}
                      disabled={exportingCSV}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-200"
                    >
                      {exportingCSV ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          Export CSV
                        </>
                      )}
                    </button>
                    <button
                      onClick={exportToHTML}
                      disabled={exportingHTML}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-200"
                    >
                      {exportingHTML ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          Export HTML
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <RegistrationFilters 
                registrations={registrations}
                onFilterChange={handleFilterChange}
                adminSettings={adminSettings}
              />

              {/* Table */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Registrations</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    All workshop registrations for Invicta
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          College
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PRN
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Workshop
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
                      {filteredRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                            No registrations found
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.map((registration) => (
                          <tr key={registration.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <button
                                onClick={() => handleUserClick(registration)}
                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                              >
                                {registration.fullName}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {registration.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {registration.mobile}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {registration.college}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {registration.prnNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                {registration.workshop}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                registration.status === 'approved' 
                                  ? 'bg-green-100 text-green-800'
                                  : registration.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {registration.status || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateRegistrationStatus(registration.id, 'approved')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approve"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => updateRegistrationStatus(registration.id, 'rejected')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject"
                                >
                                  ✗
                                </button>
                                {registration.paymentProofUrl && (
                                  <a
                                    href={registration.paymentProofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="View Payment Proof"
                                  >
                                    📄
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <AdminSettings />
          )}

          {activeTab === 'analytics' && (
            <Analytics registrations={registrations} />
          )}

          {/* SuperAdmin Section - Only visible to SuperAdmins */}
          {activeTab === 'superadmin' && isSuperAdmin && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      👑 SuperAdmin Control Panel
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage user roles and system administration
                    </p>
                  </div>
                  <button
                    onClick={loadAllUsers}
                    disabled={loadingUsers}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    {loadingUsers ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Refresh Users
                      </>
                    )}
                  </button>
                </div>

                {/* Users Management Table */}
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            <div className="flex items-center justify-center">
                              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading users...
                            </div>
                          </td>
                        </tr>
                      ) : allUsers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            No users found. Click "Refresh Users" to load data.
                          </td>
                        </tr>
                      ) : (
                        allUsers.map((user) => (
                          <tr key={user.email} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img 
                                  className="h-10 w-10 rounded-full" 
                                  src={user.photoURL || '/default-avatar.png'} 
                                  alt="" 
                                />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name || 'Unknown User'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'superadmin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role === 'superadmin' ? '👑 SuperAdmin' : 
                                 user.role === 'admin' ? '🔧 Admin' : '👤 User'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.lastLogin?.toDate?.()?.toLocaleDateString() || 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {user.email !== currentUser.email && (
                                <button
                                  onClick={() => {
                                    setSelectedUserForRoleChange(user);
                                    setShowRoleChangeModal(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                  Change Role
                                </button>
                              )}
                              {user.email === currentUser.email && (
                                <span className="text-gray-400">Current User</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal 
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={updateRegistrationStatus}
        onDelete={deleteRegistration}
      />

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div ref={passwordModalRef} className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Settings Access Required</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Please enter the password to access Form Settings
                </p>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handlePasswordSubmit}
                  className="px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  Unlock Settings
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordInput('');
                  }}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div ref={notificationRef} className="fixed top-20 right-4 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <span className="text-xs text-gray-500">
              {notifications.filter(n => !n.read).length} unread
            </span>
          </div>
          <div className="p-4">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div 
                    key={notification.id || index} 
                    className={`p-3 rounded-lg border-l-4 transition-all duration-300 ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-300 opacity-75' 
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          notification.read ? 'text-gray-700' : 'text-blue-900'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          notification.read ? 'text-gray-600' : 'text-blue-700'
                        }`}>
                          {notification.message}
                        </p>
                        <p className={`text-xs mt-2 ${
                          notification.read ? 'text-gray-500' : 'text-blue-600'
                        }`}>
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Access Requests Panel */}
      {showAccessRequests && (
        <div ref={accessRequestRef} className="fixed top-20 right-4 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Access Requests</h3>
          </div>
          <div className="p-4">
            {accessRequests.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {accessRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-center space-x-3 mb-3">
                      <img 
                        src={request.photoURL || '/default-avatar.png'} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">{request.name}</p>
                        <p className="text-xs text-yellow-700">{request.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-yellow-600 mb-3">
                      Requested: {request.requestedAt?.toDate().toLocaleString() || 'Just now'}
                    </p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAccessRequest(request.id, request.email, 'approve')}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => handleAccessRequest(request.id, request.email, 'reject')}
                        className="flex-1 px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Change Modal - SuperAdmin Only */}
      {showRoleChangeModal && selectedUserForRoleChange && isSuperAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Change User Role</h3>
              <div className="mt-2 px-7 py-3">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={selectedUserForRoleChange.photoURL || '/default-avatar.png'} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUserForRoleChange.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedUserForRoleChange.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Current: {selectedUserForRoleChange.role === 'superadmin' ? '👑 SuperAdmin' : 
                                 selectedUserForRoleChange.role === 'admin' ? '🔧 Admin' : '👤 User'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  Select the new role for this user:
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handleRoleChange(selectedUserForRoleChange.email, 'user')}
                    className="w-full px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                  >
                    👤 Change to User
                  </button>
                  <button
                    onClick={() => handleRoleChange(selectedUserForRoleChange.email, 'admin')}
                    className="w-full px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-md hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center"
                  >
                    🔧 Change to Admin
                  </button>
                  <button
                    onClick={() => handleRoleChange(selectedUserForRoleChange.email, 'superadmin')}
                    className="w-full px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                  >
                    👑 Change to SuperAdmin
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    ⚠️ <strong>Warning:</strong> Role changes are permanent and will be logged. Use with caution.
                  </p>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => {
                    setShowRoleChangeModal(false);
                    setSelectedUserForRoleChange(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
