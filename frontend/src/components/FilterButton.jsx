import { useState, useRef, useEffect } from "react";


function FilterDropdown({ label = "Filter", options = [], onSelect }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    onSelect?.(option);
    setOpen(false);
  };

  return (
    <div className="relative inline-block " ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-[120px] py-[6px] bg-[#EAECF0] text-black rounded-full hover:bg-gray-200 transition focus:outline-none focus:ring-0 focus-visible:outline-none"
      >
        <span>{selected || label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`transition-transform ${open ? "rotate-180" : ""} ml-auto`} id="Bold" viewBox="0 0 24 24" width="13" height="13"><path d="M1.51,6.079a1.492,1.492,0,0,1,1.06.44l7.673,7.672a2.5,2.5,0,0,0,3.536,0L21.44,6.529A1.5,1.5,0,1,1,23.561,8.65L15.9,16.312a5.505,5.505,0,0,1-7.778,0L.449,8.64A1.5,1.5,0,0,1,1.51,6.079Z"/></svg>
      </button> 

      {/* Dropdown */}
      {open && (
        <div className="absolute w-40 border rounded-lg shadow">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className="w-full text-left px-4 py-2 bg-white focus:outline-none focus:ring-0 focus-visible:outline-none"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
