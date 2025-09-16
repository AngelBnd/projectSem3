import { createPortal } from "react-dom";

export default function Dropdown({ isOpen, position, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
      className="mt-2 w-20 bg-white border border-gray-200 rounded-md shadow-lg z-50 "
    >
      <div className="py-1">
        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#3376FC]">
          Edit
        </a>
        <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700">
          Delete
        </a>
      </div>
    </div>,
    document.body
  );
}
