import type { ReactNode } from "react";
import { usePopup } from "./PopupContext";

const TRANSITION_DURATION = 300; // IN MS
const TRANSITION_CLASSES = `transition-all duration-${TRANSITION_DURATION} ease-in-out`;

interface PopupWrapperProps {
  children: ReactNode;
  show?: boolean;
}

const PopupWrapper = ({ children, show }: PopupWrapperProps) => {
  const opacityClass = show ? "opacity-100" : "opacity-0";
  const backdropOpacity = show ? "bg-opacity-30" : "bg-opacity-0";
  const scaleClaass = show ? "scale-100" : "scale-95";

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-[9999] ${TRANSITION_CLASSES} ${opacityClass} ${backdropOpacity}`}
    >
      <div
        className={`bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm ${TRANSITION_CLASSES} ${scaleClaass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const PopupWrapperAlt = ({ children, show }: PopupWrapperProps) => {
  const opacityClass = show ? "opacity-100" : "opacity-0";
  const translateClass = show ? "translate-y-0" : "-translate-y-full";

  return (
    <div className="fixed inset-x-0 top-0 pt-5 pb-12 flex items-center justify-center z-[9999]">
      <div
        className={`bg-white p-3 px-5 rounded-lg shadow-lg h-auto my-auto w-auto mx-auto ${TRANSITION_CLASSES} ${translateClass} ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

interface PopupMessageProps {
  message: string;
  show?: boolean;
}

export const PopupOption = ({
  message,
  show = false,
  type = "default",
}: PopupMessageProps & { type?: "default" | "delete" | "update" | "create" }) => {
  const { popupContent, closePopup } = usePopup();

  const handleConfirm = () => {
    popupContent.onConfirm?.();
    closePopup();
  };

  // Determine button color based on type
  let confirmBtnClasses =
    "px-4 py-2 text-sm font-medium rounded-md text-white transition ";
  if (type === "delete") {
    confirmBtnClasses += "bg-red-600 hover:bg-red-700";
  } else {
    confirmBtnClasses += "bg-blue-500 hover:bg-blue-600";
  }

  return (
    <PopupWrapper show={show}>
      <p className="text-gray-800 text-lg mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        {/* Close Button */}
        <button
          onClick={closePopup}
          className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-black hover:bg-gray-100 transition"
        >
          Close
        </button>
        <button onClick={handleConfirm} className={confirmBtnClasses}>
          Yes, {message.includes("delete") ? "Delete" : "Confirm"}
        </button>
      </div>
    </PopupWrapper>
  );
};

export const PopupOkay = ({ message, show = false }: PopupMessageProps) => {

  return (
    <PopupWrapperAlt show={show}>
      <p className="text-gray-800 text-md text-center flex items-center justify-center align-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0fcf0c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-circle-check"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M9 12l2 2l4 -4" />
        </svg>
        {message}
      </p>
    </PopupWrapperAlt>
  );
};

export const PopupError = ({ message, show }: PopupMessageProps) => {

  return (
    <PopupWrapperAlt show={show}>
      <p className="text-gray-800 text-md text-center flex items-center justify-center align-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#cf0c0c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-circle-x"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M10 10l4 4m0 -4l-4 4" />
        </svg>
        {message}
      </p>
    </PopupWrapperAlt>
  );
};
