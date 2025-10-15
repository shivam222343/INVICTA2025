import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const MyCertificates = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!location.state) {
      // Redirect back to search if no data
      navigate('/certificates');
      return;
    }
    setUserInfo(location.state);
  }, [location.state, navigate]);

  const downloadCertificate = async (certificateURL, participantName, workshop, format = 'pdf') => {
    try {
      // For direct download without conversion issues
      const cleanName = participantName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const cleanWorkshop = workshop.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      
      if (format === 'pdf') {
        // Direct PDF download using a different approach
        const link = document.createElement('a');
        link.href = certificateURL;
        link.download = `${cleanName}_${cleanWorkshop}_Certificate.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('PDF certificate download started', 'success');
      } else if (format === 'png') {
        // Convert PDF to PNG for download
        try {
          const response = await fetch(certificateURL);
          if (!response.ok) throw new Error('Failed to fetch certificate');
          
          const blob = await response.blob();
          
          // Create canvas to convert PDF to PNG
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // For now, we'll use a simpler approach - just download the original
          // In a real implementation, you'd use PDF.js to render to canvas
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${cleanName}_${cleanWorkshop}_Certificate.png`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
          showToast('PNG certificate download started', 'success');
        } catch (pngError) {
          console.error('PNG conversion error:', pngError);
          // Fallback to PDF download
          downloadCertificate(certificateURL, participantName, workshop, 'pdf');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      showToast('Error downloading certificate', 'error');
      
      // Fallback: open in new tab
      window.open(certificateURL, '_blank');
    }
  };

  const validateCertificate = (participantId) => {
    if (participantId) {
      window.open(`/certificate-validation/${participantId}`, '_blank');
    } else {
      showToast('Certificate validation not available', 'error');
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  const { certificates, searchType, searchValue } = userInfo;
  const userName = certificates[0]?.name || certificates[0]?.fullName || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVICTA 2025</h1>
              <p className="text-gray-600">Your Certificate Dashboard</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/certificates')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m0 7h18" />
                </svg>
                <span>New Search</span>
              </button>
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
              >
                Home
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {userName}! 🎉
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Congratulations on completing your INVICTA 2025 workshops! Your certificates are ready for download.
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 font-medium">
              Found via {searchType === 'email' ? 'Email' : 'Mobile'}: {searchValue}
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{certificates.length}</h3>
            <p className="text-gray-600">Certificate{certificates.length > 1 ? 's' : ''} Available</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {certificates.filter(cert => cert.college).length > 0 ? certificates[0].college.split(' ').slice(0, 2).join(' ') : 'Institution'}
            </h3>
            <p className="text-gray-600">Your Institution</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {certificates.filter(cert => cert.participantId).length}
            </h3>
            <p className="text-gray-600">QR Validated</p>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center">
            Your Certificates
          </h3>
          
          <div className="grid gap-8">
            {certificates.map((cert, index) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">
                        {cert.workshop}
                      </h4>
                      <div className="flex items-center space-x-4 text-blue-100">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{cert.name || cert.fullName}</span>
                        </span>
                        {cert.participantId && (
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>ID: {cert.participantId}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white text-sm font-semibold">
                        ✓ Verified
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Certificate Details */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h5>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Participant Name</p>
                            <p className="text-gray-900 font-semibold">{cert.name || cert.fullName}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Institution</p>
                            <p className="text-gray-900">{cert.college}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Year of Study</p>
                            <p className="text-gray-900">{cert.yearOfStudy}</p>
                          </div>
                        </div>
                        {cert.stream && (
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Stream</p>
                              <p className="text-gray-900">{cert.stream}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Actions</h5>
                      <div className="space-y-3">
                        <button
                          onClick={() => window.open(cert.certificateURL, '_blank')}
                          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Certificate</span>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => downloadCertificate(cert.certificateURL, cert.name || cert.fullName, cert.workshop, 'pdf')}
                            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center space-x-1 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>PDF</span>
                          </button>
                          
                          <button
                            onClick={() => downloadCertificate(cert.certificateURL, cert.name || cert.fullName, cert.workshop, 'png')}
                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center space-x-1 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>PNG</span>
                          </button>
                        </div>
                        
                        {cert.participantId && (
                          <button
                            onClick={() => validateCertificate(cert.participantId)}
                            className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Validate Certificate</span>
                          </button>
                        )}
                        
                        <button
                          onClick={async () => {
                            try {
                              const shareText = `Check out my INVICTA 2025 certificate for ${cert.workshop}! 🎓`;
                              
                              if (navigator.share && cert.certificateURL) {
                                // Try to fetch and share the actual certificate file
                                try {
                                  const response = await fetch(cert.certificateURL);
                                  const blob = await response.blob();
                                  const file = new File([blob], `${cert.name || 'certificate'}_${cert.workshop}.pdf`, { type: blob.type });
                                  
                                  await navigator.share({
                                    title: 'INVICTA 2025 Certificate',
                                    text: shareText,
                                    files: [file]
                                  });
                                } catch (fileShareError) {
                                  // Fallback to URL sharing
                                  const shareUrl = cert.participantId 
                                    ? `${window.location.origin}/certificate-validation/${cert.participantId}`
                                    : cert.certificateURL;
                                  
                                  await navigator.share({
                                    title: 'INVICTA 2025 Certificate',
                                    text: shareText,
                                    url: shareUrl,
                                  });
                                }
                              } else {
                                // Fallback for browsers without native sharing
                                const shareUrl = cert.participantId 
                                  ? `${window.location.origin}/certificate-validation/${cert.participantId}`
                                  : cert.certificateURL;
                                
                                await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                                showToast('Certificate link copied to clipboard!', 'success');
                              }
                            } catch (error) {
                              console.error('Share error:', error);
                              showToast('Error sharing certificate', 'error');
                            }
                          }}
                          className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          <span>Share Certificate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center bg-white rounded-2xl shadow-lg p-8">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h4>
          <p className="text-gray-600 mb-6">
            If you have any questions about your certificates or need assistance, we're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@invicta2025.com"
              className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              Contact Support
            </a>
            <button
              onClick={() => navigate('/certificates')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Search Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCertificates;
