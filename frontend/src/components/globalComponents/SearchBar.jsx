import { useState } from 'react';
import { ScanIcon } from '../../assets/SvgIcons';

export default function SearchBar ({setQuery, setSearchInput, handleKeyDown, value, variant}) {

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    console.log(value)
  } 
  
  const isScanVariant = variant === 'canScan';

  return (
    <div className={`
        flex items-center rounded-md w-[420px] max-w-md bg-[#EAECF0] 
       'px-1 py-1'  `}
    >
      <div className={`${isScanVariant ? 'px-3' : 'px-0'} flex items-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" id="Isolation_Mode" data-name="Isolation Mode" viewBox="0 0 24 24" width="16" height="16"><path d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z"/></svg>
      </div>

      <input
        type="text"
        placeholder="Search by product code or name..."
        className={`bg-transparent text-lato text-[14px] focus:outline-none text-gray-600 w-full placeholder:text-gray-400 font-medium 
                    ${isScanVariant ? 'ml-0 pr-2' : 'ml-2 pr-0'}`} 
        onChange = {handleChange}
        onKeyDown={handleKeyDown}
        value={value}
      />

      {isScanVariant && (
        <>
          <div className="w-[1px] h-6 bg-gray-300"></div> 
            <button 
              type="button" 
              className="flex bg-transparent items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none"
              aria-label="Scan product"
            >
              <ScanIcon className="w-4 h-4" /> 
              <span className="text-sm text-black font-medium">Scan</span> 
            </button>
        </>
      )}
    </div>
  );
}