import { useState, useEffect, useRef } from "react";
import BadgeStatus from "../globalComponents/BadgeStatus";
import Dropdown from "../globalComponents/Dropdown";
import { useNavigate } from "react-router-dom";

export default function InventoryRow({ item, onDelete }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dropdownMenuRef = useRef(null);
  const dropdownTriggerRef = useRef(null);
  const formatLastUpdated = (utcDateString) => {
    if (!utcDateString) return "N/A";
    
    const date = new Date(utcDateString);

    // Options to force UTC+7 (Asia/Jakarta)
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Use 24-hour format
        timeZone: 'Asia/Jakarta' // Forces conversion to UTC+7
    };

    // Use toLocaleString to convert and format based on options
    const formattedString = date.toLocaleString('en-GB', options);

    // The output is typically: "29/09/2025, 00:55:51" (D/M/Y, H:M:S)
    // We need to reformat this string manually to YYYY-MM-DD HH:MM:SS

    // Split the date and time parts
    const [datePart, timePart] = formattedString.split(', ');
    
    // Split the date part and rearrange from DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = datePart.split('/');
    
    // Final desired format: YYYY-MM-DD HH:MM:SS
    return `${year}-${month}-${day} ${timePart}`;
  };

  const handleToggleDropdown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setIsDropdownOpen((prev) => !prev);
  };
  useEffect(() => {
      function handleClickOutside(event) {
        // Check if click is outside both trigger and dropdown menu
        if (
          dropdownTriggerRef.current && 
          !dropdownTriggerRef.current.contains(event.target) &&
          dropdownMenuRef.current && 
          !dropdownMenuRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false);
        }
      }

      function handleScroll() {
        setIsDropdownOpen(false);
      }

      if (isDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll, true);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }, [isDropdownOpen]);


    const status =
    parseInt(item.initialStock) === 0
      ? "Out of Stock"
      : parseInt(item.initialStock) <= parseInt(item.thresholdStock)
      ? "Low stock"
      : "Good";

    const handleEdit = () => {
      navigate("/sales/input", { state: { mode: "edit", item } });
    };

  return (
    <tr className="bg-white rounded-md shadow text-sm">
      <td className="w-1/6 text-center py-2">{item.productCode}</td>
      <td className="w-1/6 text-center py-2">{item.productName}</td>
      <td className="w-1/6 text-center py-2">{item.productCategory}</td>
      <td className="w-1/6 text-center py-2">{item.initialStock}</td>
      <td className="w-1/6 text-center py-2">{formatLastUpdated(item.lastUpdated)}</td>
      <td className="w-1/6 text-center py-2">
        <BadgeStatus status={status}/>
      </td>
      <td className="w-1/6 text-center py-2">
        <div className="flex justify-center space-x-4">
          {/* Details button */}
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#EBF2FF] hover:bg-blue-100 transition cursor-pointer">
            <svg
              className="w-3 h-3 text-gray-800"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="#3376FC"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 5c.47 0 .917-.092 1.326-.26l1.967 1.967a1 1 0 0 0 1.414-1.414l-1.817-1.818A3.5 3.5 0 1 0 11.5 17Z"
              />
            </svg>
          </div>

          {/* Dropdown trigger */}
          <div
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#EBF2FF] hover:bg-blue-100 transition cursor-pointer relative"
            onClick={handleToggleDropdown}
            ref={dropdownRef}
          >
            <svg
              className="w-3 h-3 text-gray-800"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="#3376FC"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#3376FC"
                strokeLinecap="round"
                strokeWidth="3"
                d="M12 6h.01M12 12h.01M12 18h.01"
              />
            </svg>

            {/* Dropdown menu */}
            <Dropdown
              isOpen={isDropdownOpen}
              position={dropdownPosition}
              onClose={() => setIsDropdownOpen(false)}
              item={item}
              type="product" // Explicitly set type (optional since product is default)
              onDelete={onDelete}
              ref={dropdownMenuRef}
            />
          </div>
        </div>
      </td>
    </tr>
  );
}
