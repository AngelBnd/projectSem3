import FilterDropdown from "../FilterButton";
import SearchBar from "../SearchBar";
import TransactionRow from "../TransactionRow";
import { Link } from "react-router-dom";
import Button from "../Button";
import { useEffect, useState, useMemo  } from "react";


export default function Sales(){  
const [sales, setSales] = useState([]);
const [products, setProducts] = useState([]);


  const { profitTotal, orderTotal, expenseTotal } = useMemo(() => {
    let profit = 0;
    let orders = 0;
    let expense = 0;
    let totalSale = 0;

    sales.forEach((sale) => {
      // Find the product info from inventory
      const product = products.find(p => p.productCode === sale.productCode);

      if (!product) return; // skip if product not found

      const quantity = parseInt(sale.quantitySold || 0, 10);
      const cost = parseFloat(product.unitCost || 0);
      const price = parseFloat(product.sellingPrice || 0);

      orders += quantity;
      expense += cost * quantity;
      totalSale += sale.totalAmount;
    });

    return {
      profitTotal: totalSale - expense,
      orderTotal: orders,
      expenseTotal: expense,
    };
  }, [sales]);

  const totals = [
    { number: profitTotal, label: "Profit Total" },
    { number: expenseTotal, label: "Expense Total" },
    { number: orderTotal, label: "Order Total" },
  ];

  const boxes = new Array(3).fill(null);
  const testRows = new Array(12).fill(null);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/transactions").then((res) => res.json()),
      fetch("http://localhost:3000/inventory").then((res) => res.json()),
    ])
      .then(([transactions, inventory]) => {
        setSales(transactions);
        setProducts(inventory);
        console.log("Transactions:", transactions);
        console.log("Inventory:", inventory);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="w-full text-black  ">
      <div className="text-nunito font-bold text-4xl mb-[16px]">
        Sales
      </div>

    <div className="w-full h-[140px] flex gap-3 mb-[40px]">
      {totals.map((box, index) => (
        <div
          key={index}
          className="bg-white w-full h-full rounded-lg shadow flex flex-col items-start justify-center px-5"
        >
          {/* Big number with Rp for profit/expense, plain number for Order Total */}
          <span className="text-3xl font-bold font-nunito text-black flex items-end gap-1">
            {box.label !== "Order Total" && (
              <span className="text-lg font-bold font-nunito text-black">Rp</span>
            )}
            {box.label === "Order Total"
              ? box.number
              : box.number.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              {sales.map((sale, index, ) => (
                <TransactionRow key={index} sale={sale} products={products}/>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}