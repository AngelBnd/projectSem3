import { useState, useEffect, useRef } from 'react';
import BadgeStatus from '../../../components/globalComponents/BadgeStatus';
import Dropdown from "../../../components/globalComponents/Dropdown";
import type { MouseEvent as ReactMouseEvent } from 'react';
import { fetchInvoiceLineItems, type InvoiceLineItem } from "../api";

interface TransactionRowProps {
  sale: {
    invoiceDate?: string;
    invoiceId: string | number;
    name?: string;
    totalAmount?: number | string;
    [key: string]: unknown;
  };
  products?: unknown;
  onDelete?: (id: string | number) => void;
}

export default function TransactionRow({sale, products, onDelete }: TransactionRowProps) {
  const {
    invoiceDate,
    invoiceId,
    name,
    totalAmount,
  } = sale;

  const [lineItem, setLineItems] = useState<InvoiceLineItem[]>([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const dropdownTriggerRef = useRef<HTMLDivElement>(null);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const handleToggleDropdown = (event: ReactMouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(()=>{
    console.log(sale);

    fetchInvoiceLineItems(sale.invoiceId)
      .then((data)=>{
        console.log(data);
        setLineItems(data)
      })
      .catch((err) => {
        console.error("get failed:", err);
        alert("Failed to get item. Check console/server logs.");
      });
  },[])


  useEffect(() => {
    if (lineItem.length > 0) {
      const total = lineItem.reduce((sum, item) => sum + (item.quantitySold || 0), 0);
      setTotalQuantity(total);
    } else {
      setTotalQuantity(0);
    }
  }, [lineItem]);


  useEffect(() => {
        console.log(`testtt ${invoiceId}`)
        console.log('dissss', sale);
      });


  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        // Check if click is outside both trigger and dropdown menu
        if (
          dropdownTriggerRef.current && 
          !dropdownTriggerRef.current.contains(event.target as Node) &&
          dropdownMenuRef.current && 
          !dropdownMenuRef.current.contains(event.target as Node)
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


  return (
    <tr className="bg-white rounded-md shadow text-sm ">
      <td className="w-1/6 text-center py-2">{invoiceId}</td>
      <td className="w-1/6 text-center py-2">{name || "Unknown"}</td>
      <td className="w-1/6 text-center py-2">{totalQuantity}</td>
      <td className="w-1/6 text-center py-2">
        Rp {parseFloat(String(totalAmount || 0)).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="w-1/6 text-center py-2">{invoiceDate ? invoiceDate.split("T")[0] : 'N/A'}</td>
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
              item={sale}
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