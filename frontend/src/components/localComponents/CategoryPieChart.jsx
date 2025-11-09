import { Pie } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { aggregateCategories } from '../../utils/aggregation';

const generateColors = (count) => {
    const colors = [
        '#3376FC', '#FDB45C', '#9ACD32', '#4BC0C0', '#9966FF', 
        '#FF6384', '#6A5ACD', '#FFA07A', '#20B2AA', '#BA55D3'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export default function CategoryPieChart() {
    const [chartDataState, setChartDataState] = useState({ labels: [], data: [] });
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      
        const fetchData = async () => {
            setIsLoading(true);
            try {
               
                const [productsRes, salesRes] = await Promise.all([
                    fetch("http://localhost:3000/api/inventory", { headers }),
                    fetch("http://localhost:3000/api/sales", { headers })
                ]);

                if (!productsRes.ok || !salesRes.ok) {
                    throw new Error('One or both API fetches failed.');
                }

                const products = await productsRes.json();
                const rawSales = await salesRes.json();

                console.log("RAW INVENTORY/PRODUCTS DATA:", products)
                console.log("RAW TRANSACTIONS DATA:", rawSales)
            
                const productMap = products.reduce((acc, p) => {
                    if (p.productCode && p.productCategory) {
                        acc[p.productCode] = p.productCategory;
                    }
                    return acc;
                }, {});
                console.log("MAPPED INVENTORY/PRODUCTS DATA:", productMap)
                
                const { labels, data } = aggregateCategories(rawSales, productMap);
                
                setChartDataState({ labels, data });
                setIsLoading(false);

            } catch (error) {
                console.error("Fetch error for Pie Chart:", error);
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
                label: 'Items Sold by Category',
                data: chartDataState.data,
                backgroundColor: backgroundColors,
                hoverOffset: 15,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'start', 
                labels: {
                padding: 20,
                // --- FIX: Use point style to render circles ---
                usePointStyle: true, // <-- This tells Chart.js to use the point style
                pointStyle: 'circle' // <-- This explicitly sets the style to a circle
            }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {

                        const label = context.label || '';
                        const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
                        const currentValue = context.raw;
                        const percentage = ((currentValue / total) * 100).toFixed(1) + '%';
                        return `${label}: ${currentValue.toLocaleString()} items (${percentage})`;
                    }
                }
            }
        }
    };

    if (isLoading) {
        return <div>Loading Sales Categories...</div>;
    }
    
    // Check if data is truly empty after loading
    if (chartDataState.data.length === 0) {
        return <div>No category data found for charting.</div>;
    }

    return <Pie data={chartData} options={chartOptions} />;
}