// components/ViewSwitch.jsx
import { useState } from 'react';
import { ListIcon, GridIcon } from '../../assets/SvgIcons'; 

type View = 'list' | 'grid';

interface ViewSwitchProps {
  initialView?: View;
  onViewChange?: (view: View) => void;
}

function ViewSwitch({ initialView = 'list', onViewChange }: ViewSwitchProps) {
  const [activeView, setActiveView] = useState<View>(initialView);

  const handleSwitch = (view: View) => {
    setActiveView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="flex bg-[#EAECF0] rounded-lg p-1 space-x-1">

      <button
        onClick={() => handleSwitch('list')}
        className={`
          flex items-center justify-center p-2 rounded-md transition-all duration-200
          ${activeView === 'list' 
            ? 'bg-blue-100 text-blue-600 shadow' 
            : 'bg-transparent text-gray-500 hover:bg-gray-200' 
          }
          focus:outline-none 
          w-10 h-10 // Fixed size for the button area
        `}  
        aria-label="Switch to list view"
      >
        <ListIcon className="w-5 h-5" /> 
      </button>

      <button
        onClick={() => handleSwitch('grid')}
        className={`
          flex items-center justify-center p-2 rounded-md transition-all duration-200
          ${activeView === 'grid' 
            ? 'bg-blue-100 text-blue-600 shadow' 
            : 'bg-transparent text-gray-500 hover:bg-gray-200'
          }
          focus:outline-none 
          w-10 h-10 // Fixed size for the button area
        `}
        aria-label="Switch to grid view"
      >
        <GridIcon className="w-5 h-5" /> 
      </button>
    </div>
  );
}

export default ViewSwitch;