import { useEffect, useRef, useState, useCallback } from 'react';

export default function ReCaptcha({ onVerify, onExpire, onError }) {
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Memoize the render function to prevent unnecessary re-renders
  const renderRecaptcha = useCallback(() => {
    if (!recaptchaRef.current || !window.grecaptcha || !RECAPTCHA_SITE_KEY) {
      return;
    }

    // If widget already exists, reset it first
    if (widgetIdRef.current !== null) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
        return;
      } catch (err) {
        console.log('Reset failed, will re-render:', err);
      }
    }

    try {
      // Clear the container
      recaptchaRef.current.innerHTML = '';
      
      // Render new reCAPTCHA
      widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: onVerify,
        'expired-callback': onExpire,
        'error-callback': onError,
        theme: 'light',
        size: 'normal'
      });
      
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error('reCAPTCHA render error:', err);
      setError('Failed to load reCAPTCHA. Please refresh the page.');
    }
  }, [RECAPTCHA_SITE_KEY, onVerify, onExpire, onError]);

  useEffect(() => {
    let mounted = true;

    const loadRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render) {
        if (mounted) renderRecaptcha();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="recaptcha"]')) {
        // Script is loading, wait for it
        const checkRecaptcha = setInterval(() => {
          if (window.grecaptcha && window.grecaptcha.render) {
            clearInterval(checkRecaptcha);
            if (mounted) renderRecaptcha();
          }
        }, 100);
        
        return () => clearInterval(checkRecaptcha);
      }

      // Load script
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (mounted && window.grecaptcha) {
          renderRecaptcha();
        }
      };
      
      document.head.appendChild(script);
    };

    loadRecaptcha();

    return () => {
      mounted = false;
      // Cleanup
      if (window.grecaptcha && widgetIdRef.current !== null) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (error) {
          console.log('reCAPTCHA cleanup error:', error);
        }
      }
      widgetIdRef.current = null;
      setIsLoaded(false);
    };
  }, [renderRecaptcha]);

  if (!RECAPTCHA_SITE_KEY) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800 text-sm">
          ⚠️ reCAPTCHA not configured. Please add VITE_RECAPTCHA_SITE_KEY to your environment variables.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800 text-sm">
          ❌ {error}
        </p>
        <button 
          onClick={() => {
            setError(null);
            widgetIdRef.current = null;
            renderRecaptcha();
          }}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div ref={recaptchaRef}></div>
      {!isLoaded && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading reCAPTCHA...</span>
        </div>
      )}
    </div>
  );
}
