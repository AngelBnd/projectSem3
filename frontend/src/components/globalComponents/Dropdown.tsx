import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
// 1. Import useState and useLayoutEffect from React
import { forwardRef, useState, useLayoutEffect } from "react";
import type { CSSProperties } from "react";
import { usePopup } from "./PopupContext";
import { PopupOption } from "./PopupComp";

export interface DropdownItem {
  invoiceId?: string | number;
  productCode?: string;
  [key: string]: unknown;
}

interface DropdownProps {
  isOpen: boolean;
  position: { top: number; left: number } | null;
  onClose?: () => void;
  item: DropdownItem;
  type?: "product" | "transaction";
  onDelete?(id: string | number): void;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({
  isOpen,
  position,
  onClose,
  item,
  type = "product", // Default to product type
  onDelete
}, ref) => {
  const { openPopup } = usePopup();
  const element = typeof ref === "object" && ref ? ref.current : null;
  // 2. State to hold the calculated style of the dropdown.
  // It's initially positioned but hidden, so we can measure it without a visual flicker.
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({ visibility: 'hidden' });
  const [marginClass, setMarginClass] = useState("mt-2");

  useLayoutEffect(() => {
    // This effect runs when the dropdown is opened and its element is available.
    if (isOpen && element && position) {
      const dropdownRect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if the dropdown would overflow the bottom of the viewport
      const isOverflowing = position.top + dropdownRect.height > windowHeight;

      if (isOverflowing) {
        // --- Open Upwards ---
        // Calculate the new 'top' to position the dropdown above the trigger point.
        const top = position.top - dropdownRect.height - 35;
        setDropdownStyle({
          position: "absolute",
          top: `${top}px`,
          left: `${position.left}px`,
          visibility: 'visible' // Make it visible in the correct position
        });
        setMarginClass("mb-2"); // Use margin-bottom for spacing
      } else {
        // --- Open Downwards (Default) ---
        setDropdownStyle({
          position: "absolute",
          top: `${position.top}px`,
          left: `${position.left}px`,
          visibility: 'visible' // Make it visible in the correct position
        });
        setMarginClass("mt-2"); // Use margin-top for spacing
      }
    }
  }, [isOpen, position, element]); // Rerun effect if these props change

  if (!isOpen) return null;

  // Configuration based on dropdown type
  const config = {
    product: {
      editLink: "/inventory/input",
      editState: { mode: "edit", item },
      editText: "Update",
      deleteText: "Delete"
    },
    transaction: {
      editLink: "/sales/input",
      editState: { mode: "edit", item },
      editText: "Edit",
      deleteText: "Delete"
    }
  };

  const { editLink, editState, editText, deleteText } = config[type];

  const handleDelete = () => {
    const id = type === "transaction" ? item.invoiceId : item.productCode;
    onDelete?.(id as string | number);
  }

  const handleOpenOption = () => {
    onClose?.();

    openPopup(
      <PopupOption
        message={`Are you sure you want to delete this ${type} (${type === "transaction" ? item.invoiceId : item.productCode})?`}
      />,
      handleDelete
    );
  };

  return createPortal(
    <div
      ref={ref}
      // 3. Apply the calculated style and dynamic margin class
      style={dropdownStyle}
      className={`w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50 ${marginClass}`}
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
          onClick={handleOpenOption}
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