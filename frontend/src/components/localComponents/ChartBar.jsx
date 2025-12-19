import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { aggregateSalesValueByMonth } from "../../utils/aggregation";
import { aggregateSalesValueByYear } from "../../utils/aggregation";
import { aggregateSalesValueByWeekly } from "../../utils/aggregation";

export default function ChartBar({ timeFrame }) {
  const [salesData, setSalesData] = useState([]);
  const [chartDataState, setChartDataState] = useState({
    labels: [],
    data: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch("http://localhost:3000/api/sales", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((d) => {
        setSalesData(d);

        const { labels, data } = aggregateSalesValueByMonth(d);
        setChartDataState({ labels, data });
      })
      .catch((error) => console.error("Fetch error:", error));
  }, []);

  useEffect(() => {
    if (salesData.length === 0) return;

    let labels, data;

    switch (timeFrame) {
      case "Yearly":
        const resultYear = aggregateSalesValueByYear(salesData);
        labels = resultYear.labels;
        data = resultYear.data;
        break;
      case "Monthly":
        const resultMonth = aggregateSalesValueByMonth(salesData);
        labels = resultMonth.labels;
        data = resultMonth.data;
        break;
      case "Weekly":
        const resultWeek = aggregateSalesValueByCurrentWeekDaily(salesData);
        labels = resultWeek.labels;
        data = resultWeek.data;
        break;
      default:
    }

    setChartDataState({ labels, data });
  }, [salesData, timeFrame]);

  useEffect(() => {
    console.log("Raw Data:", salesData);
    console.log("Chart Data:", chartDataState);
  }, [salesData, chartDataState]);

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
      },
    ],
  };

  // --- CHART OPTIONS FOR CUSTOMIZATION ---
  const chartOptions = {
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
        categoryPercentage: 0.7,
        barPercentage: 0.8,
      },
      y: {
        grid: {
          display: true,
        },
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 5,
          callback: function (value, index, ticks) {
            // Use toLocaleString with 'id-ID' locale and 'IDR' currency
            return value.toLocaleString("id-ID", {
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

  if (chartDataState.data.length === 0 && salesData.length === 0) {
    return <div>Loading Sales Data...</div>;
  }

  if (chartDataState.data.length === 0 && salesData.length > 0) {
    return <div>No sales data found for charting.</div>;
  }

  return <Bar data={chartData} options={chartOptions} />; // <-- Pass the options here
}
