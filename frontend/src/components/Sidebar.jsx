import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="col-span-2 bg-white  flex flex-col h-screen p-[40px]">
      <h1 className="text-2xl text-black font-bold mb-8 font-nunito">StockWise</h1>
      <nav className='h-full '>
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


      <div className="w-full h-32 flex-col justify-content-center items-center">
        <div className=' flex justify-content-center items-center h-16 w-full gap-2'>
          <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="black"  class="icon icon-tabler icons-tabler-filled icon-tabler-user"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" /></svg>
          <div className='flex flex-col'>
            <div className='text-black font-nunito'>Usernamenya</div>
            <div className='text-gray-600 text-xs'>Role</div>
          </div>
        </div>

        <div className='text-black'>
          Log out
        </div>
      </div>
    </div>
  );
};

export default Sidebar;