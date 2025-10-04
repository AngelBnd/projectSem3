import Button from "../Button";
import FilterDropdown from "../FilterButton";
import SearchBar from "../SearchBar";
import BadgeStatus from "../BadgeStatus";
import InventoryRow from "../InventoryRow";
import NotFound from "../NotFound";
import { Link } from "react-router-dom";
import { useEffect, useState, useSyncExternalStore } from "react";

// Assuming these are still valid based on your backend logic
const stockStatuses = ["Low stock", "Good", "Out of Stock", "Low stock"];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState(""); 
  const [updateItems, setUpdateItems] = useState([])
  

  const [filter, setFilter] = useState('All');
  const categoryFilters = ['All', ...new Set(items.map(item => item.productCategory))];

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch("http://localhost:3000/api/inventory", { headers })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized access');
        }
        return res.json();
      })
      .then((data) => setUpdateItems(data))
      .catch((err) => {
        console.error("Error fetching inventory:", err);
        if (err.message === 'Unauthorized access') {
          window.location.href = '/login';
        }
      });
  }, []);

  // const updateItems = items.filter(item => {
  //   if (filter != 'All' && item.productCategory !== filter) {
  //     return false;
  //   }

  //   if (query) {
  //     const searchTerm = query.toLowerCase();
  //     const matchesName = item.productName.toLowerCase().includes(searchTerm);
  //     const matchesCode = item.productCode.toLowerCase().includes(searchTerm);
  //     if (!matchesName && !matchesCode) {
  //       return false;
  //     }
  //   }
  //   return true;
  // });

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`/api/inventory/search?q=${encodeURIComponent(searchInput)}`, { headers });
      const data = await res.json();
      setUpdateItems(data);
    }
  };

  return (
    <div className="w-full text-black">
      <div className="font-nunito font-bold text-4xl mb-[16px]">
        Inventory Management
      </div>

      <div className="w-full h-[140px] flex gap-3 mb-[40px]">
        {theBoxValues.map((box, index) => (
          <div
            key={index}
            className="bg-white w-full h-full rounded-lg shadow flex flex-col items-start justify-center px-5"
          >
            <span className="text-3xl font-bold font-nunito text-black">
              {box.number}
            </span>
            <span className="text-sm text-gray-600">{box.label}</span>
          </div>
        ))}
      </div>

      <div className="w-full h-[35px] font-bold mb-[32px] flex">
        <div className="text-nunito text-2xl">Inventory Overview</div>

        <div className="ml-auto flex gap-4">
          <SearchBar 
          setSearchInput={setSearchInput} 
          handleKeyDown={handleKeyDown}
          />

          <FilterDropdown
            label="Filter"
            options={categoryFilters}
            onSelect={(selectedOption) => setFilter(selectedOption)}
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
            {updateItems.length === 0 ? (
              <NotFound />
            ) :
              updateItems.map((item, index) => (
                <InventoryRow
                  key={item.productCode}
                  item={item}
                  onDelete={(code) => {
                    const token = localStorage.getItem('token');
                    const headers = { 'Authorization': `Bearer ${token}` };

                    fetch(`http://localhost:3000/api/inventory/${encodeURIComponent(code)}`, {
                      method: "DELETE",
                      headers: headers,
                    })
                      .then((res) => {
                        if (!res.ok) throw new Error("Delete failed");
                        return res.json();
                      })
                      .then(() => {
                        // The filter logic on the frontend is still correct
                        setItems((prev) => prev.filter((i) => String(i.productCode) !== String(code)));
                      })
                      .catch((err) => {
                        console.error("Delete failed:", err);
                        alert("Failed to delete item. Check console/server logs.");
                      });
                  }}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}