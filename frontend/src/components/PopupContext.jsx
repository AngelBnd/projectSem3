import React, { createContext, useContext, useState } from 'react';

const PopupContext = createContext();

export const usePopup = () => {
  return useContext(PopupContext);
};

export const PopupProvider = ({ children }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({});

  const openPopup = (content, onConfirm) => {
    setPopupContent({ content, onConfirm });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupContent({});
  };

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