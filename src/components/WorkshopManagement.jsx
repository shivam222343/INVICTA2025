import { useState, useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '../contexts/ToastContext';
import UserDetailsModal from './UserDetailsModal';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { uploadToCloudinary, cloudinaryConfig } from '../utils/cloudinary';

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
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', year: '' });
  const [generateParticipantId, setGenerateParticipantId] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [generatingCSV, setGeneratingCSV] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [generatingQRs, setGeneratingQRs] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatedQRs, setGeneratedQRs] = useState([]);
  const [generatingIndividualQR, setGeneratingIndividualQR] = useState(null);
  const [exportFields, setExportFields] = useState({
    name: true,
    email: false,
    college: false,
    yearOfStudy: false,
    mobile: false,
    participantId: false,
    qrCodeURL: true,
    certificateURL: false,
    localFilePath: false,
    exactQRFilePath: true
  });
  const [customPathPrefix, setCustomPathPrefix] = useState('./QR_Codes');
  const [exportFormat, setExportFormat] = useState('csv'); // 'csv' or 'txt'
  
  const { success: showSuccess, error: showError, info: showInfo } = useToast();

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
        (participant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (participant.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (participant.college || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      
      showSuccess(`Registration ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status');
    }
  };

  // Update attendance status
  const updateAttendance = async (registrationId, attendanceStatus) => {
    try {
      console.log('Updating attendance for:', registrationId, 'to:', attendanceStatus);
      
      await updateDoc(doc(db, 'registrations', registrationId), {
        attendance: attendanceStatus,
        attendanceUpdatedAt: new Date()
      });
      
      // Update local state
      setWorkshopParticipants(prev => {
        const updated = prev.map(reg =>
          reg.id === registrationId ? { ...reg, attendance: attendanceStatus } : reg
        );
        console.log('Updated local state. Present count:', updated.filter(p => p.attendance === 'present').length);
        return updated;
      });
      
      showSuccess(`Attendance marked as ${attendanceStatus}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
      showError('Failed to update attendance');
    }
  };

  // Upload certificate for participant with progress
  const uploadCertificate = async (registrationId, file) => {
    try {
      setUploadingCertificate(registrationId);
      setShowUploadModal(true);
      setUploadProgress(0);
      setUploadedImageUrl(null);
      
      // Find the current participant to check existing IDs
      const currentParticipant = workshopParticipants.find(p => p.id === registrationId);
      
      // Step 1: Upload certificate to Cloudinary (50%)
      setUploadProgress(10);
      const certificateURL = await uploadToCloudinary(file, `certificates/${selectedWorkshop}`);
      setUploadProgress(50);
      setUploadedImageUrl(certificateURL);
      
      // Prepare update data - only update certificate, preserve existing IDs
      const updateData = {
        certificateURL,
        certificateUploadedAt: new Date()
      };
      
      let participantId = currentParticipant?.participantId;
      let qrCloudinaryURL = currentParticipant?.qrCodeURL;
      
      // Only generate new participant ID and QR if they don't exist
      if (!participantId) {
        // Step 2: Generate unique participant ID (70%)
        participantId = `INVICTA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        updateData.participantId = participantId;
        setUploadProgress(70);
        
        // Step 3: Generate QR code (90%)
        const qrCodeData = `${window.location.origin}/certificate-validation/${participantId}`;
        const qrCodeURL = await QRCode.toDataURL(qrCodeData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Step 4: Upload QR code to Cloudinary
        const qrBlob = await fetch(qrCodeURL).then(r => r.blob());
        const qrFile = new File([qrBlob], `${participantId}_qr.png`, { type: 'image/png' });
        qrCloudinaryURL = await uploadToCloudinary(qrFile, `qr-codes/${selectedWorkshop}`);
        updateData.qrCodeURL = qrCloudinaryURL;
        setUploadProgress(90);
      }
      
      // Step 5: Update Firebase (100%)
      await updateDoc(doc(db, 'registrations', registrationId), updateData);
      setUploadProgress(100);
      
      // Update local state
      setWorkshopParticipants(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { 
            ...reg, 
            certificateURL,
            ...(updateData.participantId && { participantId: updateData.participantId }),
            ...(updateData.qrCodeURL && { qrCodeURL: updateData.qrCodeURL })
          } : reg
        )
      );
      
      showSuccess('Certificate uploaded successfully');
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setShowUploadModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading certificate:', error);
      showError('Failed to upload certificate');
      setShowUploadModal(false);
    } finally {
      setUploadingCertificate(null);
    }
  };

  // Add new member to workshop
  const addNewMember = async () => {
    try {
      // Check if email already exists
      const emailQuery = query(
        collection(db, 'registrations'),
        where('email', '==', newMember.email)
      );
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        showError('Email already registered');
        return;
      }
      
      // Generate participant ID if checkbox is selected
      let participantId = null;
      if (generateParticipantId) {
        participantId = `INVICTA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Create new registration
      const newRegistration = {
        name: newMember.name,
        email: newMember.email,
        yearOfStudy: newMember.year,
        workshop: selectedWorkshop,
        status: 'approved',
        attendance: 'absent',
        college: 'Manually Added',
        stream: 'N/A',
        mobile: 'N/A',
        registrationDate: new Date(),
        isManuallyAdded: true,
        ...(participantId && { participantId })
      };
      
      const docRef = await addDoc(collection(db, 'registrations'), newRegistration);
      
      // Update local state
      const newParticipant = { ...newRegistration, id: docRef.id };
      setWorkshopParticipants(prev => [...prev, newParticipant]);
      
      // Reset form and close modal
      setNewMember({ name: '', email: '', year: '' });
      setGenerateParticipantId(false);
      setShowAddMemberModal(false);
      
      showSuccess(`Member added successfully${participantId ? ' with Participant ID: ' + participantId : ''}`);
    } catch (error) {
      console.error('Error adding member:', error);
      showError('Failed to add member');
    }
  };

  // Edit member information
  const editMember = async () => {
    try {
      // Check if email already exists for other participants (excluding current one)
      const emailQuery = query(
        collection(db, 'registrations'),
        where('email', '==', editingMember.email)
      );
      const emailSnapshot = await getDocs(emailQuery);
      
      const existingWithSameEmail = emailSnapshot.docs.find(doc => doc.id !== editingMember.id);
      if (existingWithSameEmail) {
        showError('Email already registered for another participant');
        return;
      }
      
      // Update registration in Firebase
      await updateDoc(doc(db, 'registrations', editingMember.id), {
        name: editingMember.name,
        email: editingMember.email,
        yearOfStudy: editingMember.year,
        updatedAt: new Date()
      });
      
      // Update local state
      setWorkshopParticipants(prev =>
        prev.map(participant =>
          participant.id === editingMember.id
            ? { ...participant, name: editingMember.name, email: editingMember.email, yearOfStudy: editingMember.year }
            : participant
        )
      );
      
      // Close modal and reset
      setShowEditMemberModal(false);
      setEditingMember(null);
      
      showSuccess('Member information updated successfully');
    } catch (error) {
      console.error('Error updating member:', error);
      showError('Failed to update member information');
    }
  };

  // Download ZIP file with all QR codes (both individual and bulk generated)
  const downloadQRZip = async () => {
    try {
      setGeneratingQRs(true);
      
      // Get all participants with QR codes (regardless of attendance for broader export)
      const participantsWithQR = workshopParticipants.filter(
        participant => participant.qrCodeURL
      );
      
      if (participantsWithQR.length === 0) {
        showError('No QR codes found for any participants');
        return;
      }
      
      showInfo('Creating ZIP file with QR codes...');
      
      const zip = new JSZip();
      const qrFolder = zip.folder(`${selectedWorkshop}_QR_Codes`);
      
      // Download and add each QR code to the ZIP
      for (let i = 0; i < participantsWithQR.length; i++) {
        const participant = participantsWithQR[i];
        const participantName = (participant.name || participant.fullName || `Participant_${i+1}`)
          .replace(/[^a-zA-Z0-9]/g, '_');
        
        try {
          // Fetch the QR code image from Cloudinary
          const response = await fetch(participant.qrCodeURL);
          const blob = await response.blob();
          
          // Add the image to the ZIP folder with attendance status in filename
          const attendanceStatus = participant.attendance || 'unknown';
          const filename = `${participantName}_${attendanceStatus}_QR.png`;
          qrFolder.file(filename, blob);
          
        } catch (error) {
          console.error(`Failed to fetch QR for ${participantName}:`, error);
        }
      }
      
      // Generate and download the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedWorkshop}_All_QR_Codes_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showSuccess(`Downloaded ZIP file with ${participantsWithQR.length} QR codes`);
    } catch (error) {
      console.error('Error downloading QR codes:', error);
      showError('Failed to download QR codes');
    } finally {
      setGeneratingQRs(false);
    }
  };

  // Generate CSV/TXT for present participants with configurable fields
  const generateExport = async () => {
    try {
      setGeneratingCSV(true);
      
      const presentParticipants = workshopParticipants.filter(
        participant => participant.attendance === 'present'
      );
      
      if (presentParticipants.length === 0) {
        showError('No present participants found');
        return;
      }
      
      // Get selected field names and headers
      const selectedFields = Object.entries(exportFields)
        .filter(([field, selected]) => selected)
        .map(([field]) => field);
      
      if (selectedFields.length === 0) {
        showError('Please select at least one field to export');
        return;
      }
      
      // Create field headers mapping
      const fieldHeaders = {
        name: 'Name',
        email: 'Email',
        college: 'College',
        yearOfStudy: 'Year of Study',
        mobile: 'Mobile Number',
        participantId: 'Participant ID',
        qrCodeURL: 'QR Code Link',
        certificateURL: 'Certificate Link',
        localFilePath: 'Local File Path',
        exactQRFilePath: 'Exact QR File Path'
      };
      
      // Create CSV headers
      const headers = selectedFields.map(field => fieldHeaders[field]);
      
      // Create CSV rows
      const rows = presentParticipants.map(participant => 
        selectedFields.map(field => {
          let value;
          // Handle name field specifically to check both name and fullName
          if (field === 'name') {
            value = participant.name || participant.fullName || 'N/A';
          } else if (field === 'localFilePath') {
            // Generate local file path ending with participant name.png
            const participantName = (participant.name || participant.fullName || 'Participant')
              .replace(/[^a-zA-Z0-9]/g, '_');
            value = `${customPathPrefix}/${participantName}.png`;
          } else if (field === 'exactQRFilePath') {
            // Generate exact QR file path matching the ZIP generation pattern
            const participantName = (participant.name || participant.fullName || 'Participant')
              .replace(/[^a-zA-Z0-9]/g, '_');
            const attendanceStatus = participant.attendance || 'unknown';
            value = `${customPathPrefix}/${participantName}_${attendanceStatus}_QR.png`;
          } else {
            value = participant[field] || 'N/A';
          }
          // Escape commas and quotes in CSV values
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        })
      );
      
      // Generate content based on format
      let content, mimeType, fileExtension;
      
      if (exportFormat === 'csv') {
        // CSV format
        content = [headers, ...rows]
          .map(row => row.join(','))
          .join('\n');
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
      } else {
        // Text format - tab separated
        content = [headers, ...rows]
          .map(row => row.join('\t'))
          .join('\n');
        mimeType = 'text/plain;charset=utf-8;';
        fileExtension = 'txt';
      }
      
      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedWorkshop}_present_participants_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showSuccess(`${exportFormat.toUpperCase()} exported successfully with ${presentParticipants.length} participants`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Error generating CSV:', error);
      showError('Failed to generate CSV');
    } finally {
      setGeneratingCSV(false);
    }
  };

  // Toggle export field selection
  const toggleExportField = (field) => {
    setExportFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Select all export fields
  const selectAllFields = () => {
    const allSelected = Object.fromEntries(
      Object.keys(exportFields).map(field => [field, true])
    );
    setExportFields(allSelected);
  };

  // Deselect all export fields
  const deselectAllFields = () => {
    const allDeselected = Object.fromEntries(
      Object.keys(exportFields).map(field => [field, false])
    );
    setExportFields(allDeselected);
  };

  // Generate QR codes for all present participants
  const generateBulkQRs = async () => {
    try {
      setGeneratingQRs(true);
      setShowQRModal(true);
      setGeneratedQRs([]);
      
      // Debug: Log all participants and their attendance status
      console.log('All participants:', workshopParticipants.map(p => ({ 
        name: p.name, 
        attendance: p.attendance, 
        id: p.id 
      })));
      
      const presentParticipants = workshopParticipants.filter(
        participant => participant.attendance === 'present'
      );
      
      console.log('Present participants found:', presentParticipants.length);
      
      if (presentParticipants.length === 0) {
        showError(`No present participants found. Total participants: ${workshopParticipants.length}`);
        setGeneratingQRs(false);
        setShowQRModal(false);
        return;
      }
      
      const qrResults = [];
      
      for (let i = 0; i < presentParticipants.length; i++) {
        const participant = presentParticipants[i];
        
        // Generate participant ID if not exists
        let participantId = participant.participantId;
        if (!participantId) {
          participantId = `INVICTA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Generate QR code
        const qrCodeData = `${window.location.origin}/certificate-validation/${participantId}`;
        const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        });
        
        // Upload QR to Cloudinary
        // Convert data URL to blob for upload
        const qrBlob = await fetch(qrCodeDataURL).then(r => r.blob());
        const qrFile = new File([qrBlob], `${participantId}_qr.png`, { type: 'image/png' });
        const qrCloudinaryURL = await uploadToCloudinary(qrFile, `qr-codes/${selectedWorkshop}`);
        
        // Update Firebase if participant ID was generated
        if (!participant.participantId) {
          await updateDoc(doc(db, 'registrations', participant.id), {
            participantId,
            qrCodeURL: qrCloudinaryURL,
            qrGeneratedAt: new Date()
          });
        } else if (!participant.qrCodeURL) {
          await updateDoc(doc(db, 'registrations', participant.id), {
            qrCodeURL: qrCloudinaryURL,
            qrGeneratedAt: new Date()
          });
        }
        
        qrResults.push({
          ...participant,
          participantId,
          qrCodeURL: qrCloudinaryURL,
          qrCodeDataURL
        });
        
        // Update progress
        setGeneratedQRs([...qrResults]);
      }
      
      // Update local state
      setWorkshopParticipants(prev =>
        prev.map(reg => {
          const qrResult = qrResults.find(qr => qr.id === reg.id);
          return qrResult ? { ...reg, ...qrResult } : reg;
        })
      );
      
      showSuccess(`Generated ${qrResults.length} QR codes successfully`);
      
    } catch (error) {
      console.error('Error generating QR codes:', error);
      showError('Failed to generate QR codes');
    } finally {
      setGeneratingQRs(false);
    }
  };

  // Generate QR code for individual participant
  const generateIndividualQR = async (participant) => {
    try {
      setGeneratingIndividualQR(participant.id);
      
      // Generate participant ID if not exists
      let participantId = participant.participantId;
      if (!participantId) {
        participantId = `INVICTA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Generate QR code
      const qrCodeData = `${window.location.origin}/certificate-validation/${participantId}`;
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      
      // Upload QR to Cloudinary
      const qrBlob = await fetch(qrCodeDataURL).then(r => r.blob());
      const qrFile = new File([qrBlob], `${participantId}_qr.png`, { type: 'image/png' });
      const qrCloudinaryURL = await uploadToCloudinary(qrFile, `qr-codes/${selectedWorkshop}`);
      
      // Update Firebase
      const updateData = {
        qrCodeURL: qrCloudinaryURL,
        qrGeneratedAt: new Date()
      };
      
      if (!participant.participantId) {
        updateData.participantId = participantId;
      }
      
      await updateDoc(doc(db, 'registrations', participant.id), updateData);
      
      // Update local state
      setWorkshopParticipants(prev =>
        prev.map(reg =>
          reg.id === participant.id 
            ? { ...reg, participantId, qrCodeURL: qrCloudinaryURL }
            : reg
        )
      );
      
      showSuccess(`QR code generated successfully for ${participant.name}`);
      
    } catch (error) {
      console.error('Error generating individual QR code:', error);
      showError('Failed to generate QR code');
    } finally {
      setGeneratingIndividualQR(null);
    }
  };

  // Download QR code
  const downloadQR = (qrDataURL, participantName, participantId) => {
    const link = document.createElement('a');
    link.href = qrDataURL;
    link.download = `${participantName}_${participantId}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Get attendance badge color
  const getAttendanceBadge = (attendance) => {
    switch (attendance) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedWorkshop(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Workshops</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{selectedWorkshop}</h3>
                <p className="text-sm sm:text-base text-gray-600">{filteredParticipants.length} participants</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center sm:space-x-2"
                  title="Add Member"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline ml-2">Add Member</span>
                </button>
                <button
                  onClick={generateBulkQRs}
                  disabled={generatingQRs}
                  className="bg-purple-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center sm:space-x-2 disabled:opacity-50"
                  title={generatingQRs ? 'Generating...' : 'Generate QRs'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span className="hidden sm:inline ml-2">{generatingQRs ? 'Generating...' : 'Generate QRs'}</span>
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="bg-green-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center sm:space-x-2"
                  title="Export Data"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline ml-2">Export Data</span>
                </button>
                <button
                  onClick={downloadQRZip}
                  disabled={generatingQRs}
                  className="bg-orange-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center sm:space-x-2 disabled:opacity-50"
                  title="Download QR ZIP"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M7 13l3 3 7-7" />
                  </svg>
                  <span className="hidden sm:inline ml-2">Download QR ZIP</span>
                </button>
              </div>
              
              {/* Debug Info */}
              <div className="space-y-1 hidden sm:block">
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                  Present: {workshopParticipants.filter(p => p.attendance === 'present').length} | 
                  Absent: {workshopParticipants.filter(p => p.attendance === 'absent').length} | 
                  Undefined: {workshopParticipants.filter(p => !p.attendance || p.attendance === undefined).length} | 
                  Total: {workshopParticipants.length}
                </div>
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                  QR Codes Generated: {workshopParticipants.filter(p => p.qrCodeURL).length} | 
                  Participant IDs: {workshopParticipants.filter(p => p.participantId).length}
                </div>
              </div>
              
              {/* Mobile Debug Info - Compact */}
              <div className="sm:hidden">
                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded text-center">
                  P: {workshopParticipants.filter(p => p.attendance === 'present').length} | 
                  A: {workshopParticipants.filter(p => p.attendance === 'absent').length} | 
                  Total: {workshopParticipants.length}
                </div>
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
                      Participant ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate
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
                          <div className="text-sm font-medium text-gray-900">
                            {participant.name || participant.fullName || 'Name not available'}
                          </div>
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
                        <div className="text-sm text-gray-900">
                          {participant.participantId ? (
                            <div className="flex flex-col">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {participant.participantId}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(participant.participantId);
                                  showSuccess('Participant ID copied to clipboard');
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 text-left"
                              >
                                Copy ID
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not generated</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(participant.status)}`}>
                          {participant.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceBadge(participant.attendance)}`}>
                            {participant.attendance || 'absent'}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateAttendance(participant.id, 'present')}
                              className={`px-2 py-1 text-xs rounded ${participant.attendance === 'present' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => updateAttendance(participant.id, 'absent')}
                              className={`px-2 py-1 text-xs rounded ${participant.attendance === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'}`}
                            >
                              A
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {participant.certificateURL ? (
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  ✓ Certificate Issued
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => window.open(participant.certificateURL, '_blank')}
                                  className="text-blue-600 hover:text-blue-900 text-xs font-medium flex items-center space-x-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = participant.certificateURL;
                                    link.download = `${participant.name || 'participant'}_certificate.pdf`;
                                    link.target = '_blank';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="text-green-600 hover:text-green-900 text-xs font-medium flex items-center space-x-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span>Download</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const confirmed = window.confirm(
                                      `Are you sure you want to update the certificate for ${participant.name || participant.fullName || 'this participant'}?\n\n` +
                                      'This will replace the existing certificate. Please ensure the new certificate is correct.'
                                    );
                                    if (confirmed) {
                                      const fileInput = document.createElement('input');
                                      fileInput.type = 'file';
                                      fileInput.accept = '.pdf,.jpg,.jpeg,.png';
                                      fileInput.onchange = (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          uploadCertificate(participant.id, file);
                                        }
                                      };
                                      fileInput.click();
                                    }
                                  }}
                                  className="text-orange-600 hover:text-orange-900 text-xs font-medium flex items-center space-x-1"
                                  disabled={uploadingCertificate === participant.id}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span>{uploadingCertificate === participant.id ? 'Updating...' : 'Update'}</span>
                                </button>
                              </div>
                              {participant.qrCodeURL && (
                                <button
                                  onClick={() => window.open(participant.qrCodeURL, '_blank')}
                                  className="text-purple-600 hover:text-purple-900 text-xs font-medium flex items-center space-x-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                  </svg>
                                  <span>QR Code</span>
                                </button>
                              )}
                              {participant.certificateUploadedAt && (
                                <div className="text-xs text-gray-500">
                                  Issued: {new Date(participant.certificateUploadedAt.seconds * 1000).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const confirmed = window.confirm(
                                        `Are you sure you want to upload the certificate for ${participant.name || participant.fullName || 'this participant'}?\n\n` +
                                        'Important: Once uploaded, the certificate cannot be changed or replaced. ' +
                                        'Please ensure this is the correct final certificate.'
                                      );
                                      if (confirmed) {
                                        uploadCertificate(participant.id, file);
                                      } else {
                                        // Reset the file input
                                        e.target.value = '';
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id={`cert-${participant.id}`}
                                  disabled={uploadingCertificate === participant.id}
                                />
                                <label
                                  htmlFor={`cert-${participant.id}`}
                                  className={`cursor-pointer px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                                    uploadingCertificate === participant.id 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  {uploadingCertificate === participant.id ? 'Uploading...' : 'Upload Certificate'}
                                </label>
                              </div>
                              <div className="text-xs text-amber-600 font-medium">
                                ⚠ Permanent - Cannot be changed
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
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
                          </div>
                          
                          <div className="flex space-x-2">
                            {participant.isManuallyAdded && (
                              <button
                                onClick={() => {
                                  setEditingMember({
                                    id: participant.id,
                                    name: participant.name,
                                    email: participant.email,
                                    year: participant.yearOfStudy
                                  });
                                  setShowEditMemberModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-900 transition-colors"
                              >
                                Edit Info
                              </button>
                            )}
                            
                            {participant.qrCodeURL ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => window.open(participant.qrCodeURL, '_blank')}
                                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                >
                                  View QR
                                </button>
                                <button
                                  onClick={() => generateIndividualQR(participant)}
                                  disabled={generatingIndividualQR === participant.id}
                                  className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors disabled:opacity-50"
                                >
                                  {generatingIndividualQR === participant.id ? 'Regenerating...' : 'Regenerate QR'}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => generateIndividualQR(participant)}
                                disabled={generatingIndividualQR === participant.id}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                <span>{generatingIndividualQR === participant.id ? 'Generating...' : 'Generate QR'}</span>
                              </button>
                            )}
                          </div>
                        </div>
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

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="text"
                  value={newMember.year}
                  onChange={(e) => setNewMember(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3rd Year, Final Year"
                />
              </div>
              
              <div className="border-t pt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateParticipantId}
                    onChange={(e) => setGenerateParticipantId(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Generate Unique Participant ID</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Creates a unique ID for certificate validation and tracking. 
                      Recommended for participants who will receive certificates.
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setNewMember({ name: '', email: '', year: '' });
                  setGenerateParticipantId(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addNewMember}
                disabled={!newMember.name || !newMember.email || !newMember.year}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export CSV Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Export Data - Present Participants</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Export Information</p>
                    <p className="text-sm text-blue-600">
                      Workshop: <span className="font-semibold">{selectedWorkshop}</span> | 
                      Present Participants: <span className="font-semibold">
                        {workshopParticipants.filter(p => p.attendance === 'present').length}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Select Fields to Export</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllFields}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={deselectAllFields}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(exportFields).map(([field, selected]) => {
                  const fieldLabels = {
                    name: 'Name',
                    email: 'Email Address',
                    college: 'College/Institution',
                    yearOfStudy: 'Year of Study',
                    mobile: 'Mobile Number',
                    participantId: 'Participant ID',
                    qrCodeURL: 'QR Code Link (Cloudinary)',
                    certificateURL: 'Certificate Link',
                    localFilePath: 'Local File Path',
                    exactQRFilePath: 'Exact QR File Path'
                  };
                  
                  return (
                    <label
                      key={field}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleExportField(field)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${
                          selected ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {fieldLabels[field]}
                        </span>
                        {field === 'qrCodeURL' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Links to certificate validation page
                          </p>
                        )}
                        {field === 'participantId' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Unique identifier for each participant
                          </p>
                        )}
                        {field === 'localFilePath' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Simple format: {customPathPrefix}/ParticipantName.png
                          </p>
                        )}
                        {field === 'exactQRFilePath' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Exact format: {customPathPrefix}/ParticipantName_AttendanceStatus_QR.png
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {Object.values(exportFields).every(selected => !selected) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Please select at least one field to export.
                  </p>
                </div>
              )}
            </div>
            
            {/* Export Configuration */}
            <div className="space-y-4 mt-6 pt-4 border-t">
              <h4 className="text-lg font-medium text-gray-900">Export Configuration</h4>
              
              {/* Custom Path Prefix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Path Prefix
                </label>
                <input
                  type="text"
                  value={customPathPrefix}
                  onChange={(e) => setCustomPathPrefix(e.target.value)}
                  placeholder="e.g., ./QR_Codes or /path/to/files"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This prefix will be used in file path fields. Example: {customPathPrefix}/ParticipantName_present_QR.png
                </p>
              </div>
              
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">CSV (Comma-separated)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="txt"
                      checked={exportFormat === 'txt'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">TXT (Tab-separated)</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateExport}
                disabled={generatingCSV || Object.values(exportFields).every(selected => !selected)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {generatingCSV && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{generatingCSV ? 'Generating...' : `Export ${exportFormat.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Uploading Certificate</h3>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">{uploadProgress}% Complete</p>
              
              {/* Upload Steps */}
              <div className="space-y-2 text-left mb-6">
                <div className={`flex items-center space-x-2 ${uploadProgress >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Uploading certificate to cloud</span>
                </div>
                <div className={`flex items-center space-x-2 ${uploadProgress >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Generating participant ID</span>
                </div>
                <div className={`flex items-center space-x-2 ${uploadProgress >= 70 ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Creating QR code</span>
                </div>
                <div className={`flex items-center space-x-2 ${uploadProgress >= 90 ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Uploading QR code</span>
                </div>
                <div className={`flex items-center space-x-2 ${uploadProgress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Updating database</span>
                </div>
              </div>
              
              {/* Show uploaded image preview */}
              {uploadedImageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Certificate Preview:</p>
                  <img 
                    src={uploadedImageUrl} 
                    alt="Certificate Preview" 
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
              
              {uploadProgress === 100 && (
                <div className="mt-4">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Upload Complete!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Generation Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                QR Codes - Present Participants ({generatedQRs.length})
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {generatingQRs && generatedQRs.length === 0 && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating QR codes...</p>
              </div>
            )}
            
            {generatedQRs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedQRs.map((participant) => (
                  <div key={participant.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold text-gray-900 truncate">{participant.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                      <p className="text-xs text-gray-600 font-mono mt-1">{participant.participantId}</p>
                    </div>
                    
                    <div className="flex justify-center mb-3">
                      <img 
                        src={participant.qrCodeDataURL} 
                        alt="QR Code" 
                        className="w-32 h-32 border rounded"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadQR(participant.qrCodeDataURL, participant.name, participant.participantId)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => window.open(participant.qrCodeURL, '_blank')}
                        className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!generatingQRs && generatedQRs.length > 0 && (
              <div className="mt-6 pt-4 border-t flex justify-center">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Member Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="text"
                  value={editingMember.year}
                  onChange={(e) => setEditingMember(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 3rd Year, Final Year"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditMemberModal(false);
                  setEditingMember(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editMember}
                disabled={!editingMember.name || !editingMember.email || !editingMember.year}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Member
              </button>
            </div>
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
