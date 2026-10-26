import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSalesOrders } from "../../sales/api";
import { aggregateSalesValueByMonth } from "../../../utils/aggregation";
import { aggregateSalesValueByYear } from "../../../utils/aggregation";
import { aggregateSalesValueByWeekly } from "../../../utils/aggregation";

export default function ChartBar({ timeFrame }: { timeFrame: string }) {
  const {
    data: salesData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["salesOrders"],
    queryFn: fetchSalesOrders,
  });
  const chartDataState = useMemo(() => {
    switch (timeFrame) {
      case "Yearly":
        return aggregateSalesValueByYear(salesData);
      case "Weekly":
        return aggregateSalesValueByWeekly(salesData);
      case "Monthly":
      default:
        return aggregateSalesValueByMonth(salesData);
    }
  }, [salesData, timeFrame]);

  const chartData = {
    labels: chartDataState.labels,
    datasets: [
      {
        label: "Total Sales Amount",
        data: chartDataState.data,
        backgroundColor: "#3376FC",
        borderRadius: 5, // <-- Rounded corners for bars
        barThickness: 18, // <-- Thinner bars
        maxBarThickness: 20, // <-- Max thickness to prevent too wide bars on fewer data points
        categoryPercentage: 0.7,
        barPercentage: 0.8,
      },
    ],
  };

  // --- CHART OPTIONS FOR CUSTOMIZATION ---
  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: "top",
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          display: true,
        },
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 5,
          callback: function (value) {
            // Use toLocaleString with 'id-ID' locale and 'IDR' currency
            return Number(value).toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0, // Rupiah typically uses no decimals for large numbers
              maximumFractionDigits: 0,
            });
          },
        },
      },
    },
  };

  if (isLoading) return <div>Loading Sales Data...</div>;
  if (error) return <div>Error loading sales data: {error.message}</div>;

  if (chartDataState.data.length === 0 && salesData.length > 0) {
    return <div>No sales data found for charting.</div>;
  }

  return <Bar data={chartData} options={chartOptions} />; // <-- Pass the options here
}
