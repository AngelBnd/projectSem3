import React, { useEffect, useState } from "react";
import FilterDropdown from "../globalComponents/FilterButton"; // Assuming you have this imported

const TopSellingRow = ({ product }) => {
  return (
    <tr className="bg-white rounded-xl shadow transition duration-150">
      <td className="w-1/2 px-6 py-3 text-left font-semibold text-gray-800 rounded-l-xl">
        {product.productName}
      </td>
      <td className="w-1/2 px-6 py-3 text-center text-gray-600 rounded-r-xl">
        {Math.abs(product.totalQuantitySold)}
      </td>
    </tr>
  );
};

export default function TopSellingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState("All");
  const categoryFilters = ["All", "Last 7 Days", "Last 30 Days"];

  const getPeriodParam = (filterValue) => {
    switch (filterValue) {
      case "Last 7 Days":
        return "last_7_days";
      case "Last 30 Days":
        return "last_30_days";
      case "All":
      default:
        return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!token) return;

    const fetchTopSellingProducts = async () => {
      setLoading(true);
      setError(null);

      const periodParams = getPeriodParam(filter);
      let topSellUrl =
        "http://localhost:3000/api/dashboard/top-selling-products";

      if (periodParams) {
        topSellUrl = `${topSellUrl}?period=${periodParams}`;
      }

      try {
        const response = await fetch(topSellUrl, { headers });
        if (!response.ok) {
          throw new Error("Failed to fetch top-selling products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Top selling products fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellingProducts();
  }, [filter]);

  if (loading)
    return (
      <div className="basis-1/3 bg-white p-6 shadow rounded-lg h-full flex flex-col justify-center items-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="basis-1/3 bg-white p-6 shadow rounded-lg h-full flex flex-col justify-center items-center">
        Error: {error}
      </div>
    );

  return (
    <div className="bg-white basis-1/3 rounded-lg shadow h-full px-8 py-6 flex flex-col overflow-hidden box-border">
      <div className="flex justify-between mb-2">
        <div className="font-nunito text-xl font-bold flex items-center">
          Top Selling Products
        </div>

        <FilterDropdown
          className="no-print"
          label={filter}
          options={categoryFilters}
          onSelect={(selectedOption) => setFilter(selectedOption)}
        />
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <table className="table-auto w-full border-separate border-spacing-y-3 font-nunito text-[14px]">
          <thead className="text-gray-600 text-sm">
            <tr>
              <th className="w-1/2 px-6 py-2 font-bold text-center">
                Product Name
              </th>
              <th className="w-1/2 px-6 py-2 font-bold text-center">
                Quantity Sold
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center py-4 text-gray-500">
                  No data found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <TopSellingRow key={product.productCode} product={product} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
