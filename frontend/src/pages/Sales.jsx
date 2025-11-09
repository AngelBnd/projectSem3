import FilterDropdown from "../globalComponents/FilterButton";
import SearchBar from "../globalComponents/SearchBar";
import TransactionRow from "../localComponents/TransactionRow";
import { Link } from "react-router-dom";
import Button from "../globalComponents/Button";
import NotFound from "../globalComponents/NotFound";
import { useEffect, useState, useMemo  } from "react";
import { useDebounce } from "../globalComponents/Debounce";


export default function Sales(){
  const [sales, setSales] = useState([]);
  const [updateSales, setUpdateSales] = useState([]);

  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTrigger, setSearchTrigger] = useState('');

  const categoryFilters = ['All', ...categories];

  const [timeFilter, setTimeFilter] = useState('all_sales'); 
  const timeFilters = [
  { value: 'all_sales', label: 'All Sales' },
  { value: 'last_7_days', label: 'Last Week' },
  { value: 'last_30_days', label: 'Last Month' },
  { value: 'last_365_days', label: 'Last Year' },
  ];

  // const timeFilters = ['This Year','This month','This Week'];

  // const debounceQuery = useDebounce(query, 300);

  const productMap = useMemo(() => {
    return new Map(products.map(p => [p.productCode, p]));
  }, [products]);

  // const flatSalesData = useMemo(() => {
  //   return sales.flatMap((invoice) => {
  //     return (invoice.lineItems || []).map((lineItem) => {
  //       const product = productMap.get(lineItem.productCode);
  //       return product ? product.productCategory : 'Unknown category';
  //     });
  //   });
  // }, [sales, productMap]);

  // useEffect(() => {
  //     const productMap = new Map(products.map(p => [p.productCode, p]));

  //     if (filter === 'All') {
  //         setUpdateSales(sales);
  //         return;
  //     }

  //     const filtered = sales.filter(invoice => {
  //         return (invoice.lineItems || []).some(lineItem => {
  //             const product = productMap.get(lineItem.productCode);
  //             return product && product.productCategory === filter;
  //         });
  //     });

  //     setUpdateSales(filtered);

  // }, [sales, filter, products]);

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      if (searchInput === '') {
        setSearchTrigger('')
      } else {
        setSearchTrigger(searchInput);
      }
    }
  };

  const { profitTotal, orderTotal, expenseTotal } = useMemo(() => {
    let profit = 0;
    let orders = 0;
    let expense = 0;
    let totalSale = 0;

    const productMap = new Map(products.map(p => [p.productCode, p]));

    sales.forEach((invoice) => { 
        (invoice.lineItems || []).forEach((lineItem) => {
            const product = productMap.get(lineItem.productCode);

            if (product) {
                // Get data from LineItem and Product
                const quantity = parseInt(lineItem.quantitySold || 0, 10);
                const cost = parseFloat(product.unitCost || 0);
                
                const saleAmount = parseFloat(lineItem.lineSubtotal || 0); 

                if (!isNaN(quantity) && !isNaN(cost) && !isNaN(saleAmount)) { 
                    orders += quantity;
                    expense += cost * quantity;
                    totalSale += saleAmount;
                }
            }
        });
    });

    return {
      profitTotal: totalSale - expense,
      orderTotal: orders,
      expenseTotal: expense,
    };
  }, [sales, products]);

  const totals = [
    { number: profitTotal, label: "Profit Total" },
    { number: expenseTotal, label: "Expense Total" },
    { number: orderTotal, label: "Order Total" },
  ];

  const boxes = new Array(3).fill(null);
  const testRows = new Array(12).fill(null);

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  //   Promise.all([
  //     fetch("http://localhost:3000/api/sales", { headers }).then((res) => {
  //       if (!res.ok) {
  //         throw new Error('Unauthorized access');
  //       }
  //       return res.json();
  //     }),
  //     fetch("http://localhost:3000/api/inventory", { headers }).then((res) => {
  //       if (!res.ok) {
  //         throw new Error('Unauthorized access');
  //       }
  //       return res.json();
  //     }),
  //   ])
  //   .then(([transactions, inventory]) => {
  //     setSales(transactions);
  //     setProducts(inventory);
  //   })
  //   .catch((err) => {
  //     console.error("Error fetching data:", err);
  //     // Optional: Handle redirection to login page if needed
  //     if (err.message === 'Unauthorized access') {
  //         // You might want to handle this more globally with a context or a higher-order component
  //         window.location.href = '/login';
  //     }
  //   });
  // }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const fetchData = async () => {
      let salesUrl;
      const categoryUrl = `http://localhost:3000/api/sales/categories`;

      const params = new URLSearchParams();

      if(searchTrigger) {
        if(searchTrigger) params.append('search', searchTrigger);
        if (timeFilter && timeFilter !== 'all_sales') params.append('period', timeFilter);
        if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);

      } else {
        if (timeFilter && timeFilter !== 'all_sales') params.append('period', timeFilter);
        if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      }

      salesUrl = `http://localhost:3000/api/sales?${params.toString()}`;
      
      try {
        const [inventoryResponse, salesResponse, categoryResponse] = await Promise.all([
          fetch("http://localhost:3000/api/inventory", { headers }),
          fetch(salesUrl, { headers }),
          fetch(categoryUrl, { headers })
        ]);

        if (!inventoryResponse.ok || !salesResponse.ok || !categoryResponse.ok) {
          throw new Error('Failed to fetch initial data');
        }

        const inventory = await inventoryResponse.json();
        const sales = await salesResponse.json();
        const categoriesList = await categoryResponse.json();

        setProducts(inventory);
        setSales(sales);
        setCategories(categoriesList);
        setUpdateSales(sales);

        if (searchTrigger) {
          setSelectedCategory('All');
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.message === 'Unauthorized' || err.message === 'Unauthorized access') {
          window.location.href = '/login';
        }
      }
    };

    fetchData();
  }, [timeFilter, selectedCategory, searchTrigger]);
  
  useEffect(()=>{
    setUpdateSales(sales);
  },[sales])

  return (
    <div className="w-full text-black  ">
      <div className="w-full flex justify-between">
        <div className="font-nunito font-bold text-4xl mb-[16px]">
          Sales
        </div>
        <FilterDropdown
          label="Time"
          options={timeFilters.map(f => f.label)}
          selectedValue={timeFilters.find(f => f.value === timeFilter)?.label || 'All Sales'}
          onSelect={(selectedLabel) => {
            const selectedOption = timeFilters.find(f => f.label === selectedLabel);
            if (selectedOption) {
              setTimeFilter(selectedOption.value);
              setSearchTrigger(''); // Reset search when time changes
              setSearchInput('');
            }
          }}
        />
      </div>

      <div className="w-full h-[140px] flex gap-3 mb-[40px]">
        {totals.map((box, index) => (
          <div
            key={index}
            className="bg-white w-full h-full rounded-lg shadow flex flex-col items-start justify-center px-5"
          >
            <span className="text-3xl font-bold font-nunito text-black flex items-end gap-1">
              {box.label !== "Order Total" && (
                <span className="text-lg font-bold font-nunito text-black">Rp</span>
              )}
              {box.label === "Order Total"
                ? box.number
                : box.number.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm text-gray-600">{box.label}</span>
          </div>
        ))}
      </div>

      <div className="w-full  h-[35px] font-bold mb-[32px] flex">
        <div className="text-nunito text-2xl">Transactions</div>

        <div className="ml-auto flex gap-4  ">
          <SearchBar setSearchInput={setSearchInput} handleKeyDown={handleKeyDown} value={searchInput}/>

          <FilterDropdown
            label="Filter"
            options={categoryFilters}
            onSelect={(selectedOption) => {
              setSelectedCategory(selectedOption);
              setSearchTrigger('');
              setSearchInput('');
            }}
            selectedValue={selectedCategory}
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
              <th className="w-1/6 px-6 py-2 font-bold text-center">Quantity</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Total</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Invoice Date</th>
              <th className="w-1/6 px-6 py-2 font-bold text-center">Action</th>
            </tr>
          </thead>
            <tbody>
              {updateSales.length === 0 ? (
                <NotFound />
              ) : (
                updateSales.map((sale) => (
                  <TransactionRow
                    key={sale.invoiceId}
                    sale={sale}
                    products={products}
                    onDelete={(invoiceId) => {
                      const token = localStorage.getItem('token');
                      const headers = { 'Authorization': `Bearer ${token}` };

                      fetch(`http://localhost:3000/api/sales/${encodeURIComponent(invoiceId)}`, {
                        method: "DELETE",
                        headers: headers,
                      })
                        .then((res) => {
                          if (!res.ok) throw new Error("Delete failed");
                          return res.json();
                        })
                        .then(() => {
                          setSales((prev) => prev.filter((s) => String(s.invoiceId) !== String(invoiceId)));
                          setUpdateSales((prev) => prev.filter((s) => String(s.invoiceId) !== String(invoiceId)));
                        })
                        .catch((err) => {
                          console.error("Delete failed:", err);
                          alert("Failed to delete item. Check console/server logs.");
                        });
                    }}
                  />
                ))
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
}