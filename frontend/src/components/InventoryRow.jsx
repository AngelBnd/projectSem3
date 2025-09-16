import { useState, useEffect, useRef } from 'react';
import BadgeStatus from './BadgeStatus';

export default function InventoryRow() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <tr className="bg-white rounded-md shadow text-sm ">
      <td className="w-1/6 text-center py-2">P001</td>
      <td className="w-1/6 text-center py-2">Laptop</td>
      <td className="w-1/6 text-center py-2">Electronics</td>
      <td className="w-1/6 text-center py-2">10</td>
      <td className="w-1/6 text-center py-2">2025-09-16</td>
      <td className="w-1/6 text-center py-2">
        <BadgeStatus status={"Good"} />
      </td>
      <td className="w-1/6 text-center py-2">
          <div className="flex justify-center space-x-4">
            
            {/* The three dots icon container is now a relative parent for the dropdown */}
     
            {/* Look at details button */}
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#EBF2FF] hover:bg-blue-100 transition cursor-pointer">
              <svg className="w-3 h-3 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#3376FC" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 5c.47 0 .917-.092 1.326-.26l1.967 1.967a1 1 0 0 0 1.414-1.414l-1.817-1.818A3.5 3.5 0 1 0 11.5 17Z" clipRule="evenodd"/>
              </svg>
            </div>
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#EBF2FF] hover:bg-blue-100 transition cursor-pointer relative" onClick={toggleDropdown} ref={dropdownRef}>
              <svg className="w-3 h-3 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#3376FC" viewBox="0 0 24 24">
                <path stroke="#3376FC" stroke-linecap="round" stroke-width="3" d="M12 6h.01M12 12h.01M12 18h.01"/>
              </svg>
              {/* Dropdown Menu - absolutely positioned relative to its new parent */}
              {isDropdownOpen && (
                <div className="absolute top-8 -right-6 mt-2 w-20 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</a>
                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
                  </div>
                </div>
              )}
            </div>


          </div>
        </td>
    </tr>
  );
}