import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Certificates = () => {
  const [searchType, setSearchType] = useState('email');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [searched, setSearched] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Image carousel states
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageDesc, setNewImageDesc] = useState('');
  const [likedImages, setLikedImages] = useState(new Set());
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Image management states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);
  
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const workshopGreetings = {
      morning: [
        "☀️ Good Morning, Code Warrior! Ready to hunt for your Build It Better certificate?",
        "🌅 Rise and Shine! Time to see if your Think, Blink & Build skills earned you that digital badge!",
        "🌞 Morning, BlendForge Master! Let's see if you blended your way to success!",
        "🌄 Good Morning, CamVision Expert! Your certificate hunt begins now!"
      ],
      afternoon: [
        "🌤️ Good Afternoon, Workshop Champion! Time to claim your Build It Better trophy!",
        "☀️ Afternoon Greetings! Did your Think, Blink & Build magic work? Let's find out!",
        "🌻 Hey there, BlendForge Ninja! Ready to forge your certificate path?",
        "🌞 Afternoon, CamVision Guru! Let's focus on finding your achievement!"
      ],
      evening: [
        "🌅 Good Evening, Tech Explorer! Time to build your certificate collection!",
        "🌆 Evening, Innovation Seeker! Let's blink and build your success story!",
        "🌇 Hey Night Owl! Ready to blend your way to certificate glory?",
        "🌃 Evening, Vision Master! Time to capture your certificate moment!"
      ],
      night: [
        "🌙 Burning the midnight oil? Perfect time to hunt for your Build It Better badge!",
        "⭐ Late night certificate hunting? Your Think, Blink & Build journey awaits!",
        "🌟 Night Shift Developer! Let's forge your BlendForge certificate!",
        "🌌 Midnight Vision Quest! Time to focus on your CamVision achievement!"
      ]
    };

    let timeOfDay;
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const greetings = workshopGreetings[timeOfDay];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // Load images from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'gallery'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const imageData = [];
        snapshot.forEach((doc) => {
          imageData.push({ id: doc.id, ...doc.data() });
        });
        setImages(imageData);
      }
    );
    return () => unsubscribe();
  }, []);

  // Auto-slide images every 5 seconds
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  // Image carousel functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const likeImage = async (imageId) => {
    if (likedImages.has(imageId)) return;

    try {
      const imageRef = doc(db, 'gallery', imageId);
      const currentImage = images.find(img => img.id === imageId);
      
      await updateDoc(imageRef, {
        likes: (currentImage.likes || 0) + 1
      });

      setLikedImages(prev => new Set([...prev, imageId]));
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
      
      if (showToast) {
        showToast('Image liked! ❤️', 'success');
      }
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  // Cloudinary upload function with fallback
  // SETUP REQUIRED: 
  // 1. Create a Cloudinary account at https://cloudinary.com
  // 2. Create an upload preset named 'invicta_gallery' with unsigned uploads enabled
  // 3. Replace the values below with your actual Cloudinary credentials
  const uploadToCloudinary = async (file) => {
    // TODO: Replace these with your actual Cloudinary credentials
    const CLOUDINARY_CLOUD_NAME = 'dhsu5h91l'; // Replace with your cloud name
    const UPLOAD_PRESET = 'Invicta_Preset'; // Replace with your upload preset
    
    // Check if Cloudinary is properly configured
    if (CLOUDINARY_CLOUD_NAME === 'demo' || CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      console.warn('Cloudinary not configured. Using fallback method.');
      // For testing purposes, create a local blob URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cloudinary API Error:', errorData);
        throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      
      // Fallback to local blob URL for testing
      console.warn('Falling back to local blob URL');
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // File handling functions
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      showError('Please select a valid image file');
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const uploadImage = async () => {
    if (uploadMethod === 'url') {
      if (!newImageUrl.trim() || !newImageDesc.trim()) {
        showError('Please provide both image URL and description');
        return;
      }
    } else {
      if (!selectedFile || !newImageDesc.trim()) {
        showError('Please select an image file and provide a description');
        return;
      }
    }

    try {
      setUploadingImage(true);
      let imageUrl = newImageUrl.trim();

      // If uploading file, upload to Cloudinary first
      if (uploadMethod === 'file' && selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile);
      }

      await addDoc(collection(db, 'gallery'), {
        url: imageUrl,
        description: newImageDesc.trim(),
        likes: 0,
        createdAt: new Date(),
        uploadedBy: currentUser?.email || 'admin'
      });

      // Reset form
      setNewImageUrl('');
      setNewImageDesc('');
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadMethod('url');
      setShowUploadModal(false);
      
      if (showToast) {
        showToast('Image uploaded successfully! 🎉', 'success');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Edit image function
  const editImage = (image) => {
    setEditingImage(image);
    setNewImageDesc(image.description);
    setNewImageUrl(image.url);
    setUploadMethod('url');
    setShowEditModal(true);
  };

  // Update image function
  const updateImage = async () => {
    if (!editingImage || !newImageDesc.trim()) {
      showError('Please provide a description');
      return;
    }

    try {
      setUploadingImage(true);
      let imageUrl = newImageUrl.trim();

      // If uploading new file, upload to Cloudinary first
      if (uploadMethod === 'file' && selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile);
      }

      const imageRef = doc(db, 'gallery', editingImage.id);
      await updateDoc(imageRef, {
        url: imageUrl,
        description: newImageDesc.trim(),
        updatedAt: new Date(),
        updatedBy: currentUser?.email || 'admin'
      });

      // Reset form
      setNewImageUrl('');
      setNewImageDesc('');
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadMethod('url');
      setEditingImage(null);
      setShowEditModal(false);
      
      if (showToast) {
        showToast('Image updated successfully! ✨', 'success');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      showError('Failed to update image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete image function
  const deleteImage = async (imageId) => {
    try {
      await deleteDoc(doc(db, 'gallery', imageId));
      
      if (showToast) {
        showToast('Image deleted successfully! 🗑️', 'success');
      }
      
      setShowDeleteConfirm(false);
      setDeletingImage(null);
    } catch (error) {
      console.error('Error deleting image:', error);
      showError('Failed to delete image. Please try again.');
    }
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const searchCertificates = async () => {
    if (!searchValue.trim()) {
      showError('Please enter your email or mobile number to search for certificates.');
      return;
    }

    console.log('🔍 Starting certificate search:', {
      searchType,
      searchValue: searchValue.trim()
    });

    try {
      setLoading(true);
      
      // Simplified query to avoid complex index requirements
      const q = query(
        collection(db, 'registrations'),
        where(searchType, '==', searchValue.trim())
      );
      
      const querySnapshot = await getDocs(q);
      let foundCertificates = [];
      
      console.log('📊 Primary search results:', querySnapshot.size, 'documents found');
      
      let hasAbsentUser = false;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Document data:', {
          id: doc.id,
          hasURL: !!data.certificateURL,
          attendance: data.attendance,
          name: data.name || data.fullName,
          email: data.email,
          mobile: data.mobile
        });
        
        // Check if user exists but is marked absent
        if (data.attendance === 'absent') {
          hasAbsentUser = true;
        }
        
        // Filter for certificates with URL and present attendance
        if (data.certificateURL && data.attendance === 'present') {
          foundCertificates.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      // If no certificates found but user exists as absent, show specific message
      if (foundCertificates.length === 0 && hasAbsentUser) {
        console.log('❌ User found but marked as absent');
        setCertificates([]);
        setSearched(true);
        showError('Oops! Looks like you were marked absent for the workshop. Please contact the organizers if this is incorrect.');
        return;
      }
      
      // If no certificates found with attendance filter, try without attendance requirement
      if (foundCertificates.length === 0) {
        console.log('🔄 No results with attendance filter, trying fallback search...');
        
        // Use the same query but filter differently
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Fallback document:', {
            id: doc.id,
            hasURL: !!data.certificateURL,
            attendance: data.attendance,
            name: data.name || data.fullName
          });
          
          // Just check for certificate URL, ignore attendance
          if (data.certificateURL) {
            foundCertificates.push({
              id: doc.id,
              ...data
            });
          }
        });
        
        console.log('📊 Fallback search results:', foundCertificates.length, 'certificates found');
      }
      
      console.log('✅ Final search results:', foundCertificates.length, 'certificates found');
      
      if (foundCertificates.length > 0) {
        console.log('🎉 Redirecting to user certificate page with:', foundCertificates);
        
        // Redirect to user-specific certificate page
        const userInfo = {
          searchType,
          searchValue: searchValue.trim(),
          certificates: foundCertificates
        };
        navigate('/my-certificates', { state: userInfo });
      } else {
        console.log('❌ No certificates found, showing error state');
        setCertificates([]);
        setSearched(true);
        showError('No certificates found for the provided information. Please check your details or contact support.');
      }
    } catch (error) {
      console.error('❌ Error searching certificates:', error);
      showError('Something went wrong while searching. Please try again or contact support if the issue persists.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = (certificateURL, participantName, workshop) => {
    const link = document.createElement('a');
    link.href = certificateURL;
    link.download = `${participantName}_${workshop}_Certificate.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-auto h-10  rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  <img className=" h-10" src="Invicta.png" alt="" />
                   <div>
                <p className="text-sm text-gray-600">Certificate Portal</p>
              </div>
                </span>
              </div>
             
            </div>
            <div className="flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Carousel */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">INVICTA Gallery</h2>
            {isAdmin && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Image</span>
              </button>
            )}
          </div>

          {images.length > 0 ? (
            <div className="relative w-full h-80 sm:h-64 md:h-80 lg:h-96 xl:h-[450px] rounded-3xl overflow-hidden shadow-2xl group">
              {/* Main Image */}
              <div className="relative w-full h-full">
                <img
                  src={images[currentImageIndex]?.url}
                  alt={images[currentImageIndex]?.description}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Description */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white text-lg font-medium leading-relaxed">
                    {images[currentImageIndex]?.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  {/* Like Button */}
                  <button
                    onClick={() => likeImage(images[currentImageIndex]?.id)}
                    disabled={likedImages.has(images[currentImageIndex]?.id)}
                    className={`relative p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
                      likedImages.has(images[currentImageIndex]?.id)
                        ? 'bg-red-500/90 text-white scale-110'
                        : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'
                    }`}
                  >
                    <svg className="w-6 h-6" fill={likedImages.has(images[currentImageIndex]?.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    
                    {/* Like Animation */}
                    {showLikeAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-ping absolute w-8 h-8 bg-red-400 rounded-full opacity-75"></div>
                        <div className="animate-bounce text-red-500 text-2xl">❤️</div>
                      </div>
                    )}
                    
                    {/* Like Count */}
                    <div className="absolute -bottom-2 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[24px] text-center">
                      {images[currentImageIndex]?.likes || 0}
                    </div>
                  </button>

                  {/* Admin Management Buttons */}
                  {isAdmin && (
                    <>
                      {/* Edit Button */}
                      <button
                        onClick={() => editImage(images[currentImageIndex])}
                        className="p-3 rounded-full bg-blue-500/80 backdrop-blur-sm text-white hover:bg-blue-600/90 transition-all duration-300 hover:scale-110"
                        title="Edit Image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setDeletingImage(images[currentImageIndex]);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-3 rounded-full bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600/90 transition-all duration-300 hover:scale-110"
                        title="Delete Image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'bg-white scale-125'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-80 sm:h-64 md:h-80 lg:h-96 xl:h-[450px] bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">No images in gallery yet</p>
                {isAdmin && <p className="text-sm">Click "Add Image" to upload the first image</p>}
              </div>
            </div>
          )}
        </div>

        {/* Time-based Greeting */}
        <div className="text-center mb-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {getTimeBasedGreeting()}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your details below to discover your achievements
          </p>
        </div>

        {/* Professional Search Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>
                <h3 className="text-xl font-semibold text-white">Certificate Search</h3>
                <p className="text-blue-100">Find your INVICTA workshop certificates</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {/* Search Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  How would you like to search?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    searchType === 'email' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      value="email"
                      checked={searchType === 'email'}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        searchType === 'email' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {searchType === 'email' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <svg className={`w-5 h-5 ${searchType === 'email' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span className={`font-medium ${searchType === 'email' ? 'text-blue-900' : 'text-gray-700'}`}>
                        Email Address
                      </span>
                    </div>
                  </label>
                  
                  <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    searchType === 'mobile' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      value="mobile"
                      checked={searchType === 'mobile'}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        searchType === 'mobile' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {searchType === 'mobile' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <svg className={`w-5 h-5 ${searchType === 'mobile' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className={`font-medium ${searchType === 'mobile' ? 'text-blue-900' : 'text-gray-700'}`}>
                        Mobile Number
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Search Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {searchType === 'email' ? 'Your Email Address' : 'Your Mobile Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {searchType === 'email' ? (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                  </div>
                  <input
                    type={searchType === 'email' ? 'email' : 'tel'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchType === 'email' ? 'Enter your email address' : 'Enter your mobile number'}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg placeholder-gray-400 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && searchCertificates()}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {searchType === 'email' 
                    ? 'Use the exact email address from your registration'
                    : 'Use the exact mobile number from your registration'
                  }
                </p>
              </div>

              {/* Search Button */}
              <button
                onClick={searchCertificates}
                disabled={loading || !searchValue.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Searching for your certificates...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find My Certificates</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Workshop Info Section - After Form */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 mb-8 border border-indigo-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
               <img className="w-8 h-8" src="Mavericks.png" alt="" />
            </div>
            <h3 className="text-xl font-bold text-indigo-900 mb-3">About INVICTA 2025</h3>
            <p className="text-indigo-700 text-sm leading-relaxed max-w-3xl mx-auto">
              <strong>INVICTA - The Workshop Series</strong> was conducted on <strong>12th & 13th October 2025</strong> by Team Mavericks at KIT's College of Engineering, Kolhapur. 
              Four specialized workshops: <strong>Build It Better</strong>, <strong>Think, Blink & Build</strong>, <strong>BlendForge</strong>, and <strong>CamVision</strong> enhanced practical learning through hands-on sessions.
            </p>
          </div>
        </div>

        {/* Admin Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full mx-4 overflow-hidden max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Add New Image</h3>
                      <p className="text-purple-100 text-sm">Upload to INVICTA Gallery</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-white hover:text-purple-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Configuration Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Cloudinary Setup Required</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        File uploads are using fallback mode. Configure Cloudinary for permanent storage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Two Column Layout for Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* Left Column - Upload Options */}
                  <div className="space-y-6">
                    {/* Upload Method Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Upload Method
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setUploadMethod('url')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            uploadMethod === 'url'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="text-sm font-medium">URL</span>
                        </button>
                        <button
                          onClick={() => setUploadMethod('file')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            uploadMethod === 'file'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm font-medium">Upload</span>
                        </button>
                      </div>
                    </div>

                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>
                )}

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Image
                    </label>
                    
                    {/* Drag & Drop Area */}
                    <div
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        dragActive
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {previewUrl ? (
                        <div className="space-y-3">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-green-600 font-medium">
                              {selectedFile?.name}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl('');
                            }}
                            className="text-sm text-red-600 hover:text-red-700 underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div>
                            <p className="text-gray-600 font-medium">
                              Drag & drop your image here
                            </p>
                            <p className="text-sm text-gray-500">or</p>
                          </div>
                          <label className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors">
                            <span className="text-sm font-medium">Browse Files</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileSelect(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-gray-400">
                            Supports: JPG, PNG, GIF, WebP (Max 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                  </div>

                  {/* Right Column - Description and Actions */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newImageDesc}
                        onChange={(e) => setNewImageDesc(e.target.value)}
                        placeholder="Enter a description for this image..."
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This description will appear on the image in the gallery carousel.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Full Width */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={uploadImage}
                    disabled={
                      uploadingImage || 
                      !newImageDesc.trim() || 
                      (uploadMethod === 'url' && !newImageUrl.trim()) ||
                      (uploadMethod === 'file' && !selectedFile)
                    }
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Image Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full mx-4 overflow-hidden max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Edit Image</h3>
                      <p className="text-blue-100 text-sm">Update image details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingImage(null);
                      setNewImageUrl('');
                      setNewImageDesc('');
                      setSelectedFile(null);
                      setPreviewUrl('');
                      setUploadMethod('url');
                    }}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Current Image Preview */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Current Image</p>
                  <div className="flex items-center space-x-4">
                    <img
                      src={editingImage?.url}
                      alt={editingImage?.description}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Likes:</span> {editingImage?.likes || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Uploaded:</span> {editingImage?.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Two Column Layout for Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Upload Options */}
                  <div className="space-y-6">
                    {/* Upload Method Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Update Method
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setUploadMethod('url')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            uploadMethod === 'url'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="text-sm font-medium">URL</span>
                        </button>
                        <button
                          onClick={() => setUploadMethod('file')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            uploadMethod === 'file'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm font-medium">Upload New</span>
                        </button>
                      </div>
                    </div>

                    {/* URL Input */}
                    {uploadMethod === 'url' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    )}

                    {/* File Upload */}
                    {uploadMethod === 'file' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Upload New Image
                        </label>
                        
                        {/* Drag & Drop Area */}
                        <div
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                            dragActive
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {previewUrl ? (
                            <div className="space-y-3">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-green-600 font-medium">
                                  {selectedFile?.name}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedFile(null);
                                  setPreviewUrl('');
                                }}
                                className="text-sm text-red-600 hover:text-red-700 underline"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <div>
                                <p className="text-gray-600 font-medium">
                                  Drag & drop new image here
                                </p>
                                <p className="text-sm text-gray-500">or</p>
                              </div>
                              <label className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
                                <span className="text-sm font-medium">Browse Files</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileSelect(e.target.files[0]);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                              <p className="text-xs text-gray-400">
                                Supports: JPG, PNG, GIF, WebP (Max 10MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Description */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newImageDesc}
                        onChange={(e) => setNewImageDesc(e.target.value)}
                        placeholder="Enter a description for this image..."
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This description will appear on the image in the gallery carousel.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Full Width */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingImage(null);
                      setNewImageUrl('');
                      setNewImageDesc('');
                      setSelectedFile(null);
                      setPreviewUrl('');
                      setUploadMethod('url');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateImage}
                    disabled={
                      uploadingImage || 
                      !newImageDesc.trim() || 
                      (uploadMethod === 'url' && !newImageUrl.trim()) ||
                      (uploadMethod === 'file' && !selectedFile)
                    }
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Update Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Delete Image</h3>
                    <p className="text-red-100 text-sm">This action cannot be undone</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={deletingImage?.url}
                      alt={deletingImage?.description}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Are you sure?</p>
                      <p className="text-sm text-gray-600">
                        This will permanently delete this image from the gallery.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Description:</span> {deletingImage?.description}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      <span className="font-medium">Likes:</span> {deletingImage?.likes || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletingImage(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteImage(deletingImage?.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Forever</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Oops!</h3>
                    <p className="text-red-100 text-sm">Something went wrong</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">{errorMessage}</p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium"
                  >
                    Got it
                  </button>
                  <button
                    onClick={() => {
                      setShowErrorModal(false);
                      setSearchValue('');
                      setSearched(false);
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
