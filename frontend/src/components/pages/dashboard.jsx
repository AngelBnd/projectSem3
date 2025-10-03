import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import ChartBar from "../ChartBar";
import CategoryPieChart from "../CategoryPieChart";
import FilterDropdown from "../FilterButton";
import RecentTransactionRow from "../recentTransactionRow";
import TopSellingRow from "../TopSellingRow";

export default function Dashboard(){
    const [data, setData] = useState([]);
    const [filterBarData, setFilterBarData] = useState('Monthly');
    const categoryFilters = ['Yearly', 'Monthly', 'Weekly'];
    const dummyData = [ 
    {
        "invoiceID": "INV-20251003-001",
        "customerName": "Rizky Firmansyah",
        "totalQuantity": 4,
        "totalAmount": 450000.00,
        "currency": "Rp",
        "invoiceDate": "2025-10-03",
        "status": "Paid"
    },
    {
        "invoiceID": "INV-20251003-002",
        "customerName": "Siti Hartono",
        "totalQuantity": 1,
        "totalAmount": 125000.00,
        "currency": "Rp",
        "invoiceDate": "2025-10-03",
        "status": "Paid"
    },
    {
        "invoiceID": "INV-20251003-003",
        "customerName": "Bambang W.",
        "totalQuantity": 2,
        "totalAmount": 28000.00,
        "currency": "Rp",
        "invoiceDate": "2025-10-03",
        "status": "Canceled"
    },
    {
        "invoiceID": "INV-20251002-015",
        "customerName": "Melati Jaya Store",
        "totalQuantity": 15,
        "totalAmount": 1950000.00,
        "currency": "Rp",
        "invoiceDate": "2025-10-02",
        "status": "Paid"
    },
    {
        "invoiceID": "INV-20251002-016",
        "customerName": "Toko Sejahtera",
        "totalQuantity": 3,
        "totalAmount": 75000.00,
        "currency": "Rp",
        "invoiceDate": "2025-10-02",
        "status": "Paid"
    }
    ];

    const productSalesDataDummy = [ 
    {
        "productName": "Signature Espresso Blend 1kg",
        "quantitySold": 850
    },
    {
        "productName": "Cold Brew Concentrate (Bottle)",
        "quantitySold": 520
    },
    {
        "productName": "Vanilla Syrup (1L)",
        "quantitySold": 310
    },
    {
        "productName": "Ceramic Mug - White (Box of 6)",
        "quantitySold": 155
    },
    {
        "productName": "Milk Frother (Pro Model)",
        "quantitySold": 92
    }
    ];

    const dashboardBoxes = [
    { number: 0, label: "Total Sales" },
    { number: 0, label: "Profit" },
    { number: 0, label: "Low Stock Items" },
    { number: 0, label: "Total Customers" },
    ];

    return(
    <div className="w-full text-black">
      <div className="font-nunito font-bold text-4xl mb-[16px]">
        Dashboard
      </div>

      <div className="w-full flex flex-col gap-3 mb-[40px]">
        <div className="w-full h-32 flex gap-2">
            {dashboardBoxes.map((dashboardBox, index)=>(
                <div
                    key={index}
                    className="bg-white w-full h-full rounded-lg shadow flex flex-col items-start justify-center px-5"
                >
                    <span className="text-3xl font-bold font-nunito text-black flex items-end gap-1">
                    {/* {dashboardBox.label !== "Order Total" && (
                        <span className="text-lg font-bold font-nunito text-black">Rp</span>
                    )} */}
                        {/* {dashboardBox.label === "Order Total"
                        ? dashboardBox.number
                        : dashboardBox.number.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} */}
                        {dashboardBox.number}
                    </span>
                <span className="text-sm text-gray-600">{dashboardBox.label}</span>
                </div>

            ))}
        </div>

        <div className=" w-full h-[300px] flex gap-2">
            <div className="bg-white basis-2/3 rounded-lg shadow h-full px-8 py-6 flex flex-col gap-4 overflow-hidden box-border">
                <div className="w-full flex justify-between">
                    <div className="font-nunito text-xl font-bold mb-4">
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

            <div className="bg-white basis-1/3 rounded-lg shadow h-full px-8 py-6 flex flex-col overflow-hidden box-border">
                <div className="font-nunito text-xl font-bold mb-4">
                    Categories Sold
                </div>
                <div className="flex-grow"> 
                    <CategoryPieChart/>
                </div>
            </div>
        </div>

        <div className=" w-full h-80 flex gap-2">
            <div className="bg-white basis-1/3 rounded-lg shadow h-full px-8 py-6 flex flex-col overflow-hidden box-border">
                <div className="flex justify-between">
                    <div className="font-nunito text-xl font-bold mb-4">
                        Top Selling Products
                    </div>

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
                            
                            {productSalesDataDummy.map((item, index) => {
                                return (
                                    <TopSellingRow
                                        key={item.productCode}
                                        item={item}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white basis-2/3 rounded-lg shadow h-full px-8 py-6 flex flex-col overflow-hidden box-border">
                <div className="font-nunito text-xl font-bold ">
                    Recent Transactions
                </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar"> 

                <table className="table-auto w-full border-separate border-spacing-y-3 font-nunito text-[14px]">
                    <thead className="text-gray-600 text-sm">
                        <tr>
                            {/* Note: Columns are w-1/5 for 5 columns for even spacing, not w-1/6 */}
                            <th className="w-1/5 px-6 py-2 font-bold text-center">Invoice ID</th>
                            <th className="w-1/5 px-6 py-2 font-bold text-center">Name</th>
                            <th className="w-1/5 px-6 py-2 font-bold text-center">Invoice Date</th>
                            <th className="w-1/5 px-6 py-2 font-bold text-center">Quantity</th>
                            <th className="w-1/5 px-6 py-2 font-bold text-center">Total</th>  
                        </tr>
                    </thead>
                    <tbody>
                        {/* FIX: Ensure you add the return statement and key inside the map */}
                        {dummyData.map((transaction, index) => {
                            return (
                                <RecentTransactionRow
                                    key={transaction.invoiceID}
                                    transaction={transaction}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>

            </div>
        </div>

      </div>
    </div>
    )
}