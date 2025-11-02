import React from 'react';
import { FilterIcon } from './SvgIcons';


const defaultHasBorder = ['primary', 'outline', 'secondary', 'danger'];


function FilterButtonV2({ 
  onClick, 
  className, 
  children, 
  icon: IconComponent, 
  variant = 'primary', 
  hasBorder 
}) {

  const showBorder = hasBorder !== undefined ? hasBorder : defaultHasBorder.includes(variant);

  if (!showBorder) {
    styles = styles.replace(/border(-[^\s]+)?/g, '').trim();
  }


  return (
    <button
      onClick={onClick}
      className={`
        focus:outline-none !focus:ring-0 !focus-visible:outline-none 
        px-3 py-[5px] rounded-md shadow 
        transition font-nunito text-semibold text-[14px] 
        flex items-center justify-center 
        bg-[#EAECF0]
      `}
    >
    <span className="mr-2 flex items-center">
        <FilterIcon />
    </span>

      
      {children}
    </button>
  );
}

export default FilterButtonV2;