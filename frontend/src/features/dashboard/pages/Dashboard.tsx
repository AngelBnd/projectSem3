import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartBar from "../components/ChartBar";
import CategoryPieChart from "../components/CategoryPieChart";
import FilterDropdown from "../../../components/globalComponents/FilterButton";
import TopSellingProducts from "../components/TopSellingProducts";
import RecentTransactionsTable from "../components/RecentTransactionsTable";
import Button from "../../../components/globalComponents/Button";
import { ExportIcon } from "../../../assets/SvgIcons";
import {
  DashboardSummary,
  exportDashboard,
  fetchDashboardSummary,
} from "../api";
import { useMutation, useQuery } from "@tanstack/react-query";

interface SummaryState {
  totalSales: number;
  totalRevenue: number;
  lowStockItems: number;
  totalCustomers: number;
}

const formatCurrency = (amount: number) =>
  `Rp ${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;

const DashboardTopBoxes = ({ summary }: { summary: SummaryState }) => {
  const { totalSales, totalRevenue, lowStockItems, totalCustomers } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      <div className="bg-white p-6 shadow rounded-md flex flex-col justify-center">
        <p className="text-3xl font-nunito font-bold">{totalSales}</p>
        <span className="text-gray-600 mt-1">Total Sales</span>
      </div>

      <div className="bg-white p-6 shadow rounded-md flex flex-col justify-center">
        <p className="text-3xl font-nunito font-bold">
          {formatCurrency(totalRevenue)}
        </p>
        <span className="text-gray-600 mt-1">Total Revenue</span>
      </div>

      <div className="bg-white p-6 shadow rounded-md flex flex-col justify-center">
        <p className="text-3xl font-nunito font-bold">{lowStockItems}</p>
        <span className="text-gray-600 mt-1">Low Stock Items</span>
      </div>

      <div className="bg-white p-6 shadow rounded-md flex flex-col justify-center">
        <p className="text-3xl font-nunito font-bold">{totalCustomers}</p>
        <span className="text-gray-600 mt-1">Total Customers</span>
      </div>
    </div>
  );
};

const handleExportPDF = async () => {
  const res = await exportDashboard();

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "dashboard.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export default function Dashboard() {
  const navigate = useNavigate();
  const exportMutation = useMutation({ mutationFn: handleExportPDF });

  const { data, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardSummary,
  });

  const dashboardSummary: SummaryState = {
    totalSales: parseFloat(String(data?.totalSales)) || 0,
    totalRevenue: parseFloat(String(data?.totalRevenue)) || 0,
    lowStockItems: data?.lowStockItems ?? 0,
    totalCustomers: data?.totalCustomers ?? 0,
  };

  const [filterBarData, setFilterBarData] = useState("Monthly");
  const categoryFilters = ["Yearly", "Monthly", "Weekly"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  if (isLoading) return <div>Loading Dashboard...</div>;
  if (error)
    return <div>Error: {error.message}. Check server console for details.</div>;

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex justify-between items-center mb-2 w-full">
        <div>
          <h1 className="text-2xl font-semibold font-nunito">Dashboard</h1>
          <h3 className="text-[#777B7C] text-sm">
            Overview of your store's performance
          </h3>
        </div>

        <div>
          <Button
            className="no-print"
            onClick={() => exportMutation.mutate()}
            children={"Export All as PDF"}
            icon={ExportIcon}
            variant="white"
            disabled={exportMutation.isPending}
          />
          {exportMutation.error && (
            <div className="text-red-500 text-xs mt-1">
              Export failed: {exportMutation.error.message}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-9">
        <DashboardTopBoxes summary={dashboardSummary} />
      </div>

      <div className="col-span-9">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-2 ">
          {/* Cashflow Chart */}
          <div className="lg:col-span-2 bg-white rounded-md shadow p-6 flex flex-col min-h-[340px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-nunito">Cashflow</h2>
              <FilterDropdown
                className="no-print"
                label={filterBarData}
                options={categoryFilters}
                onSelect={(option) => setFilterBarData(option)}
              />
            </div>
            <div className="flex-grow">
              <ChartBar timeFrame={filterBarData} />
            </div>
          </div>

          {/* Categories Sold Chart */}
          <div className="bg-white rounded-md shadow p-6 flex flex-col">
            <h2 className="text-xl font-bold font-nunito mb-4">
              Categories Sold
            </h2>
            <div className="flex-grow">
              <CategoryPieChart />
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-9 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-md shadow p-6">
            <TopSellingProducts />
          </div>
          <div className="bg-white rounded-md shadow p-6">
            <RecentTransactionsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
