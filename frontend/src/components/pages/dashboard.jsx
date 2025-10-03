import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
// Ensure these chart components exist and are imported correctly
import ChartBar from "../ChartBar"; 
import CategoryPieChart from "../CategoryPieChart"; 
import FilterDropdown from "../FilterButton"; 
import TopSellingProducts from "../TopSellingProducts"; 
import RecentTransactionsTable from "../RecentTransactionsTable"; 

// Helper function to format currency (Rp)
const formatCurrency = (amount) => {
  return `Rp ${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;
};

// Component to render the top boxes
const DashboardTopBoxes = ({ summary }) => {
    // ... (unchanged DashboardTopBoxes code)
    const { totalSales, totalProfit, lowStockItems, totalCustomers } = summary;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-4 shadow rounded-lg flex flex-col justify-center">
                <h3 className="text-lg font-medium text-gray-500">Total Sales</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
            </div>

            <div className="bg-white p-4 shadow rounded-lg flex flex-col justify-center">
                <h3 className="text-lg font-medium text-gray-500">Profit</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalProfit)}</p>
            </div>

            <div className="bg-white p-4 shadow rounded-lg flex flex-col justify-center">
                <h3 className="text-lg font-medium text-gray-500">Low Stock Items</h3>
                <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
            </div>

            <div className="bg-white p-4 shadow rounded-lg flex flex-col justify-center">
                <h3 className="text-lg font-medium text-gray-500">Total Customers</h3>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
        </div>
    );
};


export default function Dashboard(){
    const navigate = useNavigate();
    const [dashboardSummary, setDashboardSummary] = useState({
        totalSales: 0,
        totalProfit: 0,
        lowStockItems: 0,
        totalCustomers: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for the Cashflow chart filter
    const [filterBarData, setFilterBarData] = useState('Monthly');
    const categoryFilters = ['Yearly', 'Monthly', 'Weekly'];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchDashboardSummary = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/dashboard/summary', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard summary');
                }
                const data = await response.json();
                
                setDashboardSummary({
                    totalSales: parseFloat(data.totalSales) || 0,
                    totalProfit: parseFloat(data.totalProfit) || 0,
                    lowStockItems: data.lowStockItems,
                    totalCustomers: data.totalCustomers,
                });
            } catch (err) {
                console.error("Dashboard summary fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardSummary();
    }, [navigate]);

    if (loading) return <div>Loading Dashboard...</div>;
    if (error) return <div>Error: {error}. Check your server console for details.</div>;


    return(
        <div className="w-full text-black">
            <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

            {/* 1. Top Boxes */}
            <DashboardTopBoxes summary={dashboardSummary} />

            {/* 💡 2. NEW CHART SECTION: Uses the 2/3 and 1/3 split */}
            <div className=" w-full h-[300px] flex gap-2 mb-6"> 
                
                {/* Cashflow Chart (2/3 width) */}
                <div className="bg-white basis-2/3 rounded-lg shadow h-full px-8 py-6 flex flex-col gap-4 overflow-hidden box-border">
                    <div className="w-full flex justify-between items-center">
                        <div className="font-nunito text-xl font-bold">
                            Cashflow
                        </div>
                        <FilterDropdown
                            label="Monthly"
                            options={categoryFilters}
                            onSelect={(selectedOption) => setFilterBarData(selectedOption)}
                        />
                    </div>
                    
                    {/* Chart Wrapper */}
                    <div className="flex-grow"> 
                        <ChartBar
                            timeFrame={filterBarData}
                        />
                    </div>
                </div>

                {/* Categories Sold Chart (1/3 width) */}
                <div className="bg-white basis-1/3 rounded-lg shadow h-full px-8 py-6 flex flex-col overflow-hidden box-border">
                    <div className="font-nunito text-xl font-bold mb-4">
                        Categories Sold
                    </div>
                    <div className="flex-grow"> 
                        <CategoryPieChart/>
                    </div>
                </div>
            </div>

            {/* 3. Bottom Section: Top Selling & Recent Transactions (Uses the 1/3 and 2/3 split) */}
            <div className=" w-full h-80 flex gap-2">
                <TopSellingProducts /> 
                <RecentTransactionsTable />
            </div>
        </div>
    )
}