import type { MouseEventHandler, ReactNode } from 'react';
import { FilterIcon } from '../../assets/SvgIcons';

interface FilterButtonV2Props {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}

function FilterButtonV2({ onClick, children }: FilterButtonV2Props) {
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