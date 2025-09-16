import Button from "../Button";
import FilterDropdown from "../FilterButton";
import SearchBar from "../SearchBar";
import BadgeStatus from "../BadgeStatus";
import InventoryRow from "../InventoryRow";


const stockStatuses = ["Low stock", "Good", "Out of Stock", "Low stock"];

export default function Inventory(){
  const boxes = new Array(3).fill(null);
  const testRows = new Array(12).fill(null);


  return (
    <div className="w-full text-black  ">
      <div className="text-nunito font-bold text-4xl mb-[16px]">
        Inventory Management
      </div>

      <div className="w-full h-[140px] flex gap-3 mb-[40px]">
        {boxes.map((box, index) => (
          <div
            key={index}
            className="bg-white w-full h-full rounded-lg shadow flex items-center justify-center"
          >
            
          </div>
        ))}
      </div>

      <div className="w-full  h-[35px] font-bold mb-[32px] flex">
        <div className="text-nunito text-2xl">Inventory Overview</div>
     
        <div className="ml-auto flex gap-4  ">
          <SearchBar/>

          <FilterDropdown
            label="Filter"
            options={["Category", "What else", "Among"]}
            onSelect={(value) => console.log("Selected:", value)}
          />

          <Button>Add item</Button>
        </div>
      </div>

      <div className="w-full overflow-y-auto h-[374px] custom-scrollbar">
        <table className="table-auto w-full border-separate border-spacing-y-2 font-nunito text-[14px]">
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
              {testRows.map((index) =>(
                <InventoryRow />
              ))}
            
          </tbody>
        </table>
      </div>
    </div>
  );
}