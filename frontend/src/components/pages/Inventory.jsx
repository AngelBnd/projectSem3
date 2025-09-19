import Button from "../Button";
import FilterDropdown from "../FilterButton";
import SearchBar from "../SearchBar";
import BadgeStatus from "../BadgeStatus";
import InventoryRow from "../InventoryRow";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const stockStatuses = ["Low stock", "Good", "Out of Stock", "Low stock"];

export default function Inventory(){
  const [items, setItems] = useState([]);
  const [searchItem, setSearchItem] = useState(''); // Search item filter

  
  const theBoxValues = [
    { number: items.length, label: "Total Items" },
    {
      number: items.filter(
        (item) => parseInt(item.initialStock) <= parseInt(item.thresholdStock)
      ).length,
      label: "Low Stock Items",
    },
    {
      number: items.filter((item) => parseInt(item.initialStock) === 0).length,
      label: "Out of Stock Items",
    },
  ];

  const boxes = new Array(3).fill(null);
  const testRows = new Array(12).fill(null);

  useEffect(()=>{
    fetch("http://localhost:3000/inventory")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching inventory:", err));
  },[]);


  // Search Change component
  const handleSearchChange = (findItem) => {
    setSearchItem(findItem);
  };

  const updateItems = items.filter(item => 
    item.productName.toLowerCase().includes(searchItem.toLowerCase()) || 
    item.productCode.toLowerCase().includes(searchItem.toLowerCase())
  );

  return (
    <div className="w-full text-black  ">
      <div className="text-nunito font-bold text-4xl mb-[16px]">
        Inventory Management
      </div>
      

      <div className="w-full h-[140px] flex gap-3 mb-[40px]">
        {theBoxValues.map((box, index) => (
          <div
            key={index}
            className="bg-white w-full h-full rounded-lg shadow flex flex-col items-start justify-center px-5"
          >
            {/* Big number */}
            <span className="text-3xl font-bold font-nunito text-black">
              {box.number}
            </span>
            {/* Label text */}
            <span className="text-sm text-gray-600">{box.label}</span>
          </div>
        ))}
      </div>

      <div className="w-full  h-[35px] font-bold mb-[32px] flex">
        <div className="text-nunito text-2xl">Inventory Overview</div>
     
        <div className="ml-auto flex gap-4  ">
          <SearchBar onSearchChange={handleSearchChange}/>

          <FilterDropdown
            label="Filter"
            options={["Category", "What else", "Among"]}
            onSelect={(value) => console.log("Selected:", value)}
          />

           <Link to="/inventory/input">
            <Button>Add item</Button>
          </Link>
        </div>
      </div>

      <div className="w-full overflow-y-auto h-[374px] custom-scrollbar">
        <table className="table-auto w-full border-separate border-spacing-y-3 font-nunito text-[14px]">
          <thead className="text-gray-600 text-sm">
            <tr>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Code</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Name</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Category</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Quantity</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Last Updated</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Status</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {updateItems.map((item, index) => (
              <InventoryRow key={index} item={item} />
            ))}
            
          </tbody>
        </table>
      </div>
    </div>
  );
}