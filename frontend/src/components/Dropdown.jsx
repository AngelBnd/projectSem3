import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { forwardRef } from "react";

const Dropdown = forwardRef(({ 
  isOpen, 
  position, 
  onClose, 
  item, 
  type = "product", // Default to product type
  onDelete
}, ref) => {
  if (!isOpen) return null;

  // Configuration based on dropdown type
  const config = {
    product: {
      editLink: "/inventory/input",
      editState: { mode: "edit", item },
      editText: "Edit",
      deleteText: "Delete"
    },
    transaction: {
      editLink: "/sales/input", // Adjust path as needed
      editState: { mode: "edit", item },
      editText: "Edit",
      deleteText: "Delete"
    }
  };

  const { editLink, editState, editText, deleteText } = config[type];

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
      className="mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50"
    >
      <div className="py-1">
        <Link
          to={editLink}
          state={editState}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#3376FC]"
          onClick={onClose}
        >
          {editText}
        </Link>

        <button
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 bg-white"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
              onDelete?.(item.productCode);   // call parent handler (Inventory.jsx) with code
            }
            onClose?.();
          }}
        >
          {deleteText}
        </button>
      </div>
    </div>,
    document.body
  );
});

Dropdown.displayName = "Dropdown";

export default Dropdown;