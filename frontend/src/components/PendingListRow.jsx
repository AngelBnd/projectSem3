import { useState, useEffect, useRef } from 'react';
import BadgeStatus from './BadgeStatus';
import Dropdown from "./Dropdown";

export default function PendingListRow({item}) {

  return (
    <tr className="bg-white rounded-md shadow text-sm ">
      <td className="w-1/6 text-center py-2">{sale.invoiceId}</td>
      <td className="w-1/6 text-center py-2">{sale.name || "Unknown"}</td>
      <td className="w-1/6 text-center py-2">{totalQuantity}</td>
      <td className="w-1/6 text-center py-2">
        Rp {parseFloat(totalAmount).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="w-1/6 text-center py-2">{invoiceDate.split("T")[0]}</td>
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
              type="transaction" // Set type to transaction
              onDelete={onDelete}
              ref={dropdownMenuRef}
            />
          </div>
        </div>
      </td>
    </tr>
  );
}