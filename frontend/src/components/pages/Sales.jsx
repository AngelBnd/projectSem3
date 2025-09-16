import FilterDropdown from "../FilterButton";
import SearchBar from "../SearchBar";
import TransactionRow from "../TransactionRow";
import { Link } from "react-router-dom";
import Button from "../Button";


export default function Sales(){  
  const placeHolderValue = [
    { number: 27, label: "Total Items" },
    { number: 27, label: "Low Stock Items" },
    { number: 27, label: "Out of Stock Items" },
  ];

  const boxes = new Array(3).fill(null);
  const testRows = new Array(12).fill(null);


  return (
    <div className="w-full text-black  ">
      <div className="text-nunito font-bold text-4xl mb-[16px]">
        Sales
      </div>

      <div className="w-full h-[140px] flex gap-3 mb-[40px]">
        {placeHolderValue.map((box, index) => (
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
        <div className="text-nunito text-2xl">Transactions</div>
     
        <div className="ml-auto flex gap-4  ">
          <SearchBar/>

          <FilterDropdown
            label="Filter"
            options={["Category", "What else", "Among"]}
            onSelect={(value) => console.log("Selected:", value)}
          />

           <Link to="/sales/input">
            <Button>Add Transaction</Button>
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
              <th className="w-1/6 px-6 py-2 font-bold text-center">Total</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Invoice Date</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
              {testRows.map((index) =>(
                <TransactionRow />
              ))}
            
          </tbody>
        </table>
      </div>
    </div>
  );
}