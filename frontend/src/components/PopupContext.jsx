import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PopupContext = createContext();
const TRANSITION_DURATION = 300; // IN MS

const GlobalPopupRenderer = ({ isPopupOpen, popupContent }) => {
  return React.cloneElement(popupContent.content, {
    show: isPopupOpen,
  });
};

export const usePopup = () => {
  return useContext(PopupContext);
};

export const PopupProvider = ({ children }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({});
  const timeoutRef = useRef(null);

  const [shouldRender, setShouldRender] = useState(false); 

  const clearExistingTimeout = () => {
    if(timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const openPopup = (content, onConfirm = null, durationMs = 0) => {
    clearExistingTimeout();

    setPopupContent({ content, onConfirm });
    setShouldRender(true);
    setTimeout(() => setIsPopupOpen(true), 10);

    if(durationMs > 0) {
      timeoutRef.current = setTimeout(() => {
        closePopup();
      }, durationMs);
    }
  };

  const closePopup = () => {
    clearExistingTimeout();
    setIsPopupOpen(false);

    setTimeout(() => {
        setShouldRender(false);
        setPopupContent({});
    }, TRANSITION_DURATION);
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
      {shouldRender && <GlobalPopupRenderer isPopupOpen={isPopupOpen} popupContent={popupContent} />}
    </PopupContext.Provider>
  );
};