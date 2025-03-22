'use client';

import React, { useState, useEffect } from 'react';
import CookieConsent from 'react-cookie-consent';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent was already given or declined
    const hasConsent = localStorage.getItem('cookieConsent') === 'true';
    const hasDeclined = localStorage.getItem('cookieConsent') === 'false';
    
    if (!hasConsent && !hasDeclined) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
    
    // Enable Google Analytics when cookies are accepted
    window.gtag?.('consent', 'update', {
      'analytics_storage': 'granted'
    });
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
    
    // Disable Google Analytics when cookies are declined
    window.gtag?.('consent', 'update', {
      'analytics_storage': 'denied'
    });
  };

  if (!isVisible) return null;

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accepteren"
      declineButtonText="Weigeren"
      cookieName="cookieConsent"
      enableDeclineButton
      onAccept={handleAccept}
      onDecline={handleDecline}
      buttonClasses="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded transition-colors"
      declineButtonClasses="bg-transparent border border-white hover:bg-white hover:text-black text-white font-medium py-2 px-4 rounded mr-2 transition-colors"
      contentClasses="flex items-center"
      containerClasses="fixed bottom-0 left-0 w-full z-50 p-4 bg-black bg-opacity-95 border-t border-gray-800 shadow-lg"
      buttonWrapperClasses="flex items-center"
      expires={365}
      ButtonComponent="button"
    >
      <div className="flex items-start md:items-center flex-col md:flex-row pr-8">
        <div className="text-amber-500 font-bold text-xl mr-2">Cookies</div>
        <p className="text-sm text-gray-300">
          Deze website gebruikt cookies en Google Analytics om uw surfervaring te verbeteren en voor analytische doeleinden.
        </p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
        aria-label="Sluiten"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </CookieConsent>
  );
}; 