'use client';

import React, { useState, useEffect } from 'react';
import CookieConsent from 'react-cookie-consent';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { updateAnalyticsConsent, hasAnalyticsConsent } from '@/utils/analytics';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Wacht even met het tonen van de banner om hydration mismatch te voorkomen
    const timer = setTimeout(() => {
      // Check if consent was already set in localStorage
      const consentStatus = localStorage.getItem('cookieConsent');
      
      if (consentStatus !== 'true' && consentStatus !== 'false') {
        setIsVisible(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    updateAnalyticsConsent(true);
  };

  const handleDecline = () => {
    setIsVisible(false);
    updateAnalyticsConsent(false);
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