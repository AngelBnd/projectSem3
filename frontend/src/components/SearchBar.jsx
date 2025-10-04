import {useState} from 'react';

export default function SearchBar ({setQuery, setSearchInput, handleKeyDown}) {

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    console.log(value)
 }  
 
 return (
    <div className="flex items-center gap-1 px-4 py-2 rounded-lg w-[270px] max-w-md">
    <svg xmlns="http://www.w3.org/2000/svg" id="Isolation_Mode" data-name="Isolation Mode" viewBox="0 0 24 24" width="16" height="16"><path d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z"/></svg>

      <input
        type="text"
        placeholder="Search by product code or name..."
        className="ml-2 bg-transparent text-lato text-[14px] focus:outline-none text-gray-600 w-full placeholder:text-gray-400 font-medium"
        onChange = {handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}