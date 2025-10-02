import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PopupContext = createContext();

export const usePopup = () => {
  return useContext(PopupContext);
};

export const PopupProvider = ({ children }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({});
  const timeoutRef = useRef(null);

  const clearExistingTimeout = () => {
    if(timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const openPopup = (content, onConfirm = null, durationMs = 0) => {
    clearExistingTimeout();

    setPopupContent({ content, onConfirm });
    setIsPopupOpen(true);

    if(durationMs > 0) {
      timeoutRef.current = setTimeout(() => {
        closePopup();
      }, durationMs);
    }
  };

  const closePopup = () => {
    clearExistingTimeout();
    setIsPopupOpen(false);
    setPopupContent({});
  };

  useEffect(() => {
    return () => clearExistingTimeout();
  }, []); 

  const contextValue = {
    isPopupOpen,
    popupContent,
    openPopup,
    closePopup,
  };

  return (
    <PopupContext.Provider value={contextValue}>
      {children}
    </PopupContext.Provider>
  );
};