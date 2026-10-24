import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface PopupContent {
  content?: ReactElement<{ show?: boolean }>;
  onConfirm?: (() => void) | null;
}

interface PopupContextValue {
  isPopupOpen: boolean;
  popupContent: PopupContent;
  openPopup: (
    content: ReactElement<{ show?: boolean }>,
    onConfirm?: (() => void) | null,
    durationMs?: number
  ) => void;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextValue | null>(null);
const TRANSITION_DURATION = 300; // IN MS

const GlobalPopupRenderer = ({
  isPopupOpen,
  popupContent,
}: {
  isPopupOpen: boolean;
  popupContent: PopupContent;
}) => {
  return React.cloneElement(popupContent.content!, {
    show: isPopupOpen,
  });
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) throw new Error('usePopup must be used within a PopupProvider');
  return context;
};

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<PopupContent>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [shouldRender, setShouldRender] = useState(false); 

  const clearExistingTimeout = () => {
    if(timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const openPopup: PopupContextValue['openPopup'] = (content, onConfirm = null, durationMs = 0) => {
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