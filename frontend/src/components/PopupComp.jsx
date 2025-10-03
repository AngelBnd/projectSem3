import React from "react";
import { usePopup } from "./PopupContext";

const PopupWrapper = ({ children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm transition duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

const PopupWrapperAlt = ({ children }) => {
    return (
        <div className="fixed inset-x-0 top-0 pt-5 pb-12 flex items-center justify-center z-[9999] transition-opacity duration-300">
            <div className="bg-white p-3 rounded-lg shadow-l h-auto my-auto w-auto mx-auto transition duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export const PopupOption = ({ message }) => {
    const { popupContent, closePopup } = usePopup();

    const handleConfirm = () => {
        popupContent.onConfirm?.(); 
        closePopup();
    };

    return (
        <PopupWrapper>
            <p className="text-gray-800 text-lg mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                {/* Close Button */}
                <button
                    onClick={closePopup}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
                >
                    Close
                </button>
                {/* Yes/Confirm Button */}
                <button
                    onClick={handleConfirm}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition"
                >
                    Yes, {message.includes("delete") ? "Delete" : "Confirm"}
                </button>
            </div>
        </PopupWrapper>
    );
};

export const PopupOkay = ({ message }) => {
    const { closePopup } = usePopup(); 

    return (
        <PopupWrapperAlt>
            <p className="text-gray-800 text-md text-center flex items-center justify-center">
                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="#0fcf0c"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></svg>
                {message}
            </p>
        </PopupWrapperAlt>
    );
};