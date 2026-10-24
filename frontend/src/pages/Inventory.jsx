import Button from "../components/globalComponents/Button";
import FilterDropdown from "../components/globalComponents/FilterButton";
import SearchBar from "../components/globalComponents/SearchBar";
import BadgeStatus from "../components/globalComponents/BadgeStatus";
import InventoryRow from "../components/localComponents/InventoryRow";
import NotFound from "../components/globalComponents/NotFound";
import { Link } from "react-router-dom";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useDebounce } from "../components/globalComponents/Debounce";
import { api } from "../lib/api";
const stockStatuses = ["Low stock", "Good", "Out of Stock", "Low stock"];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState(''); 
  const [updateItems, setUpdateItems] = useState([])
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTrigger, setSearchTrigger] = useState('');

  const categoryFilters = ['All', ...categories];

  const theBoxValues = [
    { number: updateItems.length, label: "Total Items" },
    {
      number: updateItems.filter(
        (item) => parseInt(item.initialStock) <= parseInt(item.thresholdStock) && parseInt(item.initialStock)!=0
      ).length,
      label: "Low Stock Items",
    },
    {
      number: updateItems.filter((item) => parseInt(item.initialStock) === 0).length,
      label: "Out of Stock Items",
    },
  ];

  useEffect(() => {
    api
      .get("/api/inventory/categories")
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error("Error fetching categories:", err.message);
      });
  }, []);

  useEffect(() => {
    api
      .get("/api/inventory/")
      .then((data) => setItems(data))
      .catch((err) => {
        console.error("Error fetching categories:", err.message);
      });
  }, []);

  useEffect(() => {
    let url;

    if(searchTrigger) {
      url = `/api/inventory/search?q=${encodeURIComponent(searchTrigger)}`;
    } else {
      url = `/api/inventory`;

      if(selectedCategory && selectedCategory !== 'All') {
        url += `?category=${encodeURIComponent(selectedCategory)}`;
      }
    }

    const fetchdata = async () => {
      try {
        const data = await api.get(url);

        setUpdateItems(data);

        if(searchTrigger) {
          setSelectedCategory("All");
        }

      } catch(error) {
        console.error("Error fetching inventory:", error.message);
      }
    };

    fetchdata();
  }, [searchTrigger, selectedCategory]);

  // const updateItems = items;

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  //   const url = debounceQuery
  //     ? `http://localhost:3000/api/inventory/search?q=${encodeURIComponent(debounceQuery)}`
  //     : `http://localhost:3000/api/inventory`;

  //   const fetchData = async () => {
  //     try {
  //       const res = await fetch(url, { headers });
  //       if (!res.ok) {
  //         throw new Error('Unauthorized access');
  //       }

  //       const data = await res.json();
  //       setItems(data);
  //       if(!debounceQuery) {
  //         setStaticItems(data);
  //       }
        
  //     } catch (err) {
  //       console.error("Error fetching inventory:", err);
  //       if (err.message === 'Unauthorized access') {
  //         window.location.href = '/login';
  //       }
  //     }
  //   };

  //   fetchData();
  // }, [debounceQuery]);

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
      // const token = localStorage.getItem('token');
      // const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // const res = await fetch(`/api/inventory/search?q=${encodeURIComponent(searchInput)}`, { headers });
      // const data = await res.json();
      // setUpdateItems(data);

      if(searchInput === '') {
        setSearchTrigger('');
      } else {
        setSearchTrigger(searchInput);
      }
    }
  };

  // useEffect(()=>{
  //   setUpdateItems(items);
  // },[items])

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
          value={searchInput}
          />

          <FilterDropdown
            label="Filter"
            options={categoryFilters}
            onSelect={(selectedOption) => {
              setSearchTrigger('');
              setSearchInput('');
              setSelectedCategory(selectedOption);
            }}
            selectedValue={selectedCategory}
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
                    api
                      .delete(`/api/inventory/${encodeURIComponent(code)}`)
                      .then(() => {
                        // The filter logic on the frontend is still correct
                        setItems((prev) => prev.filter((i) => String(i.productCode) !== String(code)));
                        setUpdateItems((prev) => prev.filter((i) => String(i.productCode) !== String(code)));
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