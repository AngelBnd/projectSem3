import FilterDropdown from "../FilterButton";
import SearchBar from "../SearchBar";
import TransactionRow from "../TransactionRow";
import { Link } from "react-router-dom";
import Button from "../Button";
import NotFound from "../NotFound";
import { useEffect, useState, useMemo  } from "react";


export default function Sales(){
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState(""); // Search items state
  const [filter, setFilter] = useState('All'); // Filter category button
  const timeFilters = ['This Year','This month','This Week']

  // Filter categories based on the transactions list shown
  const categoryFilters = ['All', ...new Set(
    sales.map(sale => {
      const product = products.find(p => p.productCode === sale.productCode);
      return product ? product.productCategory : null;
    }).filter(category => category !== null)
  )];

  // Update list of sales based on filters / search
  const updateSales = sales.filter(sale => {
    const matchProduct = products.find(p => p.productCode === sale.productCode);

    if (!matchProduct) return false;

    if(filter != 'All' && matchProduct.productCategory !== filter) {
      return false;
    }

    if (query) {
      const searchTerm = query.toLowerCase();
      const matchesName = matchProduct.productName.toLowerCase().includes(searchTerm);
      const matchesCode = matchProduct.productCode.toLowerCase().includes(searchTerm);
      if (!matchesName && !matchesCode) {
        return false;
      }
    }

    return true;
  });

  const { profitTotal, orderTotal, expenseTotal } = useMemo(() => {
    let profit = 0;
    let orders = 0;
    let expense = 0;
    let totalSale = 0;

    // Filter for valid sales and calculate
    sales.forEach((sale) => {
      const product = products.find(p => p.productCode === sale.productCode);

      // Check if the product exists before doing any calculations
      if (product) {
        const quantity = parseInt(sale.quantitySold || 0, 10);
        const cost = parseFloat(product.unitCost || 0);
        const saleAmount = parseFloat(sale.totalAmount || 0);

        // Check if values are valid numbers before adding them to totals
        if (!isNaN(quantity) && !isNaN(cost) && !isNaN(saleAmount)) {
          orders += quantity;
          expense += cost * quantity;
          totalSale += saleAmount;
        }
      }
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    Promise.all([
      fetch("http://localhost:3000/api/sales", { headers }).then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized access');
        }
        return res.json();
      }),
      fetch("http://localhost:3000/api/inventory", { headers }).then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized access');
        }
        return res.json();
      }),
    ])
    .then(([transactions, inventory]) => {
      setSales(transactions);
      setProducts(inventory);
    })
    .catch((err) => {
      console.error("Error fetching data:", err);
      // Optional: Handle redirection to login page if needed
      if (err.message === 'Unauthorized access') {
          // You might want to handle this more globally with a context or a higher-order component
          window.location.href = '/login';
      }
    });
  }, []);


  return (
    <div className="w-full text-black  ">
      <div className="w-full flex justify-between">
        <div className="text-nunito font-bold text-4xl mb-[16px]">
          Sales
        </div>
        <FilterDropdown
          label="Time"
          options={timeFilters}
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
          <SearchBar onSearch = {setQuery}/>

          <FilterDropdown
            label="Filter"
            options={categoryFilters}
            onSelect={(selectedOption) => setFilter(selectedOption)}
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
              {sales.length === 0 ? (
                <NotFound />
              ) : (
                sales.map((sale) => (
                  <TransactionRow
                    key={sale.invoiceId}
                    sale={sale}
                    products={products}
                    onDelete={(id) => {
                      const token = localStorage.getItem('token');
                      const headers = { 'Authorization': `Bearer ${token}` };

                      fetch(`http://localhost:3000/api/sales/${encodeURIComponent(id)}`, {
                        method: "DELETE",
                        headers: headers,
                      })
                        .then((res) => {
                          if (!res.ok) throw new Error("Delete failed");
                          return res.json();
                        })
                        .then(() => {
                          setSales((prev) => {
                            return prev.filter((s) => String(s.invoiceId) !== String(id));
                          });
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