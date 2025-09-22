import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="col-span-2 bg-white  flex flex-col h-screen p-[40px]">
      <h1 className="text-2xl text-black font-bold mb-8 font-nunito">StockWise</h1>
      <nav>
        <ul>
            <div className='text-[#838790] font-nunito text-[10px] mb-[8px]'>REPORT</div>
            <li className="mb-[20px]">
                <Link to="/Inventory" className="text-black text-[18px] ml-4 hover:text-gray-500 transition">Inventory</Link>
            </li>
            
            <li className="mb-4">
                <Link to="/Sales" className="text-black text-[18px] ml-4  hover:text-gray-500 transition">Sales</Link>
            </li>
            <hr class="my-4 border-t border-gray-300" />
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;