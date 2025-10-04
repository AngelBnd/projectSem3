// components/TopSellingProducts.jsx
import React, { useEffect, useState } from 'react';
import FilterDropdown from './FilterButton'; // Assuming you have this imported

// Row Component (TopSellingRow)
const TopSellingRow = ({ product }) => {
    return (
        <tr className="bg-white rounded-xl shadow-md transition duration-150">
            <td className="w-1/2 px-6 py-3 text-left font-semibold text-gray-800 rounded-l-xl">
                {product.productName}
            </td>
            <td className="w-1/2 px-6 py-3 text-center text-gray-600 rounded-r-xl">
                {product.totalQuantitySold}
            </td>
        </tr>
    );
};

// Main Component (Fetching and Display)
export default function TopSellingProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Placeholder state for the filter dropdown
    const [filter, setFilter] = useState('All'); 
    const categoryFilters = ['All', 'This Month', 'Last 30 Days']; 

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchTopSellingProducts = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/dashboard/top-selling-products', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch top-selling products');
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
    }, []);

    if (loading) return <div className="basis-1/3 bg-white p-6 shadow rounded-lg h-full flex flex-col justify-center items-center">Loading...</div>;
    if (error) return <div className="basis-1/3 bg-white p-6 shadow rounded-lg h-full flex flex-col justify-center items-center">Error: {error}</div>;

    return (
        // 💡 Uses basis-1/3 for 1/3 width
        <div className="bg-white basis-1/3 rounded-lg shadow h-full px-8 py-6 flex flex-col overflow-hidden box-border">
            <div className="flex justify-between">
                <div className="font-nunito text-xl font-bold mb-4">
                    Top Selling Products
                </div>
                
                {/* Filter Dropdown */}
                <FilterDropdown
                    label="Filter"
                    options={categoryFilters}
                    onSelect={(selectedOption) => setFilter(selectedOption)}
                />
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar"> 
                <table className="table-auto w-full border-separate border-spacing-y-3 font-nunito text-[14px]">
                    <thead className="text-gray-600 text-sm">
                        <tr>
                            <th className="w-1/2 px-6 py-2 font-bold text-center">Product Name</th>
                            <th className="w-1/2 px-6 py-2 font-bold text-center">Quantity Sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr><td colSpan="2" className="text-center py-4 text-gray-500">No data found.</td></tr>
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