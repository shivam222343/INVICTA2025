import { useState, useEffect } from 'react';

const CelebrationModal = ({ isOpen, onClose, userName, workshop, whatsappLink, isFreeRegistration = false }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [particles, setParticles] = useState([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Generate particles
      const newParticles = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#A8E6CF', '#FFD93D'][Math.floor(Math.random() * 8)],
        delay: Math.random() * 3,
        duration: Math.random() * 4 + 2
      }));
      setParticles(newParticles);
      
      // Animation sequence - show animations for 2-3 seconds then options
      setTimeout(() => setAnimationPhase(1), 300);
      setTimeout(() => setAnimationPhase(2), 800);
      setTimeout(() => setAnimationPhase(3), 1500);
      setTimeout(() => setShowContent(true), 3000); // Show options after 3 seconds
    } else {
      setAnimationPhase(0);
      setShowContent(false);
      setParticles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Primary gradient background */}
        <div className={`absolute inset-0 transition-all duration-2000 ${
          animationPhase >= 1 
            ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' 
            : 'bg-black'
        }`} />
        
        {/* Secondary animated overlay */}
        <div className={`absolute inset-0 transition-all duration-3000 ${
          animationPhase >= 2 
            ? 'bg-gradient-to-tr from-pink-600/30 via-purple-600/30 to-blue-600/30' 
            : 'bg-transparent'
        }`} />
        
        {/* Animated geometric shapes */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full transition-all duration-4000 ${
                animationPhase >= 2 ? 'opacity-20' : 'opacity-0'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                background: `radial-gradient(circle, ${['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 5)]}40, transparent)`,
                transform: `scale(${animationPhase >= 3 ? 1 : 0})`,
                transitionDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full transition-all ${
              animationPhase >= 1 ? 'animate-bounce' : 'opacity-0'
            }`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 20px ${particle.color}`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              transform: `scale(${animationPhase >= 1 ? 1 : 0})`,
              transitionDelay: `${particle.delay * 200}ms`
            }}
          />
        ))}
      </div>

      {/* Main Content - Scaled down to fit 100vh */}
      <div className="relative flex items-center justify-center h-screen p-2 overflow-y-auto">
        <div className="w-full max-w-2xl text-center scale-75 sm:scale-90 md:scale-100">
          
          {/* Success Icon with Epic Animation - Smaller */}
          <div className={`relative mb-6 transform transition-all duration-2000 ${
            animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}>
            {/* Pulsing rings - Smaller */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute rounded-full border-2 border-white/30 transition-all duration-2000 ${
                    animationPhase >= 2 ? 'animate-ping' : ''
                  }`}
                  style={{
                    width: `${80 + i * 25}px`,
                    height: `${80 + i * 25}px`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
            
            {/* Main success icon - Smaller */}
            <div className="relative z-10 w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Main Title Animation - Smaller text */}
          <div className={`mb-6 transform transition-all duration-1500 delay-500 ${
            animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-3 animate-pulse">
              SUCCESS!
            </h1>
            <h2 className="text-xl md:text-3xl font-bold text-white mb-2">
              🎉 Registration Complete! 🎉
            </h2>
            <p className="text-lg md:text-xl text-blue-200">
              Welcome to INVICTA 2025
            </p>
          </div>

          {/* User Info Card - Smaller */}
          {showContent && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4 border border-white/20 shadow-2xl transform transition-all duration-1000 animate-fade-in">
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold text-white mb-2">
                  {userName}
                </div>
                <div className="text-sm text-blue-200 mb-3">
                  Successfully registered for
                </div>
                <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-full text-sm shadow-lg transform hover:scale-105 transition-transform">
                  {workshop}
                </div>
                
                {/* Status Message - Smaller */}
                <div className={`mt-3 p-3 rounded-xl ${
                  isFreeRegistration 
                    ? 'bg-blue-500/20 border border-blue-400/30'
                    : 'bg-green-500/20 border border-green-400/30'
                }`}>
                  <div className="flex items-center justify-center mb-1">
                    <svg className={`w-4 h-4 mr-2 ${
                      isFreeRegistration ? 'text-blue-400' : 'text-green-400'
                    }`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`font-semibold text-sm ${
                      isFreeRegistration ? 'text-blue-300' : 'text-green-300'
                    }`}>
                      {isFreeRegistration ? 'Registration Confirmed!' : 'Payment Under Review'}
                    </span>
                  </div>
                  <p className={`text-xs ${
                    isFreeRegistration ? 'text-blue-200' : 'text-green-200'
                  }`}>
                    {isFreeRegistration 
                      ? 'Your free registration is confirmed! Welcome to INVICTA 2025!' 
                      : "We'll verify your payment and send confirmation details soon!"
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Only WhatsApp and View More - Smaller */}
          {showContent && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {/* WhatsApp Group Button - Smaller */}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-full hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center min-w-[200px] text-sm"
                >
                <svg className="w-4 h-4 mr-2 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                </svg>
                  Join WhatsApp Group
                </a>
              )}
              
              {/* View More About INVICTA Button - Smaller */}
              <button
                onClick={() => window.location.href = '/about'}
                className="group bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-xl min-w-[200px] flex items-center justify-center text-sm"
              >
                <svg className="w-4 h-4 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="group-hover:animate-pulse">View More About INVICTA</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Close button - subtle */}
      {showContent && (
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-white/60 hover:text-white text-2xl font-bold transition-colors duration-300 z-10"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default CelebrationModal;
