import Button from "../Button";
import FilterDropdown from "../FilterButton";
import SearchBar from "../SearchBar";
import BadgeStatus from "../BadgeStatus";

const stockStatuses = ["Low stock", "Good", "Out of Stock", "Low stock"];

export default function Inventory(){
  const boxes = new Array(3).fill(null);
 
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

      <div className=" w-100% overflow-y-auto">
            <table className="table-auto w-full text-left border-collapse font-nunito font-thin">
              <thead>
                <tr>
                  <th className="px-4 py-2 font-medium">Code</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Quantity</th>
                  <th className="px-4 py-2 font-medium">Last Updated</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Table rows go here */}
              </tbody>
            </table>
      </div>
    </div>
  );
}