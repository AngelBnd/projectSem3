import React from "react";
import { usePopup } from "./PopupContext";

const PopupWrapper = ({ children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
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

export const PopupOkay = ({ message = "Operation completed successfully." }) => {
    const { closePopup } = usePopup(); 

    return (
        <PopupWrapper>
            <p className="text-gray-800 text-lg mb-6">{message}</p>
            <div className="flex justify-end">
                <button
                    onClick={closePopup}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[#3376FC] hover:bg-blue-600 transition"
                >
                    Okay
                </button>
            </div>
        </PopupWrapper>
    );
};