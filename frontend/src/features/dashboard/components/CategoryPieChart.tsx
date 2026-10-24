import { Pie } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";
import { useEffect, useState } from "react";
import { fetchSalesOrders } from "../../sales/api";
import { aggregateChannels } from "../../../utils/aggregation"; // <-- aggregateChannels should handle channel/subchannel

const generateColors = (count: number) => {
  const colors = [
    "#3376FC",
    "#FDB45C",
    "#9ACD32",
    "#4BC0C0",
    "#9966FF",
    "#FF6384",
    "#6A5ACD",
    "#FFA07A",
    "#20B2AA",
    "#BA55D3",
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export default function ChannelPieChart() {
  const [chartDataState, setChartDataState] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sales = await fetchSalesOrders();

        const { labels, data } = aggregateChannels(sales);

        setChartDataState({ labels, data });
      } catch (error) {
        console.error("Fetch error for Pie Chart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const backgroundColors = generateColors(chartDataState.labels.length);

  const chartData = {
    labels: chartDataState.labels,
    datasets: [
      {
        label: "Items Sold by Channel/Subchannel",
        data: chartDataState.data,
        backgroundColor: backgroundColors,
        hoverOffset: 15,
      },
    ],
  };

  const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        align: "start",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"pie">) {
            const label = context.label || "";
            const total = context.dataset.data.reduce(
              (sum, value) => sum + value,
              0
            );
            const currentValue = context.raw as number;
            const percentage = ((currentValue / total) * 100).toFixed(1) + "%";
            return `${label}: ${currentValue.toLocaleString()} items (${percentage})`;
          },
        },
      },
    },
  };

  if (isLoading) return <div>Loading Sales by Channels...</div>;
  if (chartDataState.data.length === 0)
    return <div>No channel data found for charting.</div>;

  return <Pie data={chartData} options={chartOptions} />;
}
