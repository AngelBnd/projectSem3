// components/RecentTransactionsTable.jsx
import React, { useEffect, useState } from "react";

// 💡 CORRECTED Helper function to format currency (Rp)
const formatCurrency = (amount) => {
  return `Rp ${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;
};

// Helper function for date formatting (DD/MM/YYYY)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Row Component (RecentTransactionRow)
const RecentTransactionRow = ({ transaction }) => {
  return (
    <tr className="shadow">
      <td className="w-1/5 px-4 py-4 text-sm font-medium text-gray-900">
        {transaction.salesOrderId}
      </td>
      <td className="w-1/5 px-4 py-4  text-center text-sm text-gray-500">
        {transaction.customerName}
      </td>
      <td className="w-1/5 px-4 py-4  text-center text-sm text-gray-500">
        {formatDate(transaction.orderDate)}
      </td>
      <td className="w-1/5 px-4 py-4 text-center text-sm text-gray-500">
        {transaction.totalQuantity}
      </td>
      <td className="w-1/5 px-4 py-4 text-center text-sm text-gray-900">
        {formatCurrency(transaction.totalAmount)}
      </td>
    </tr>
  );
};

// Main Component (Fetching and Display)
export default function RecentTransactionsTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchRecentTransactions = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/dashboard/recent-transactions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch recent transactions");
        }
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        console.error("Recent transactions fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTransactions();
  }, []);

  if (loading)
    return (
      <div className="basis-2/3 bg-white p-6 shadow rounded-lg h-full flex flex-col justify-center items-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="basis-2/3 bg-white p-6 shadow rounded-lg h-full flex flex-col justify-center items-center">
        Error: {error}
      </div>
    );

  return (
    // 💡 Uses basis-2/3 for 2/3 width
    <div className="bg-white basis-2/3 rounded-lg shadow h-full px-8 py-6 flex flex-col overflow-hidden box-border">
      <div className="font-nunito text-xl font-bold mb-4">
        Recent Transactions
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-auto custom-scrollbar">
        <table className="table-auto w-full border-separate border-spacing-y-3 font-nunito text-[14px]">
          <thead className="text-gray-600 text-sm">
            <tr>
              <th className="w-1/5 px-6 py-2 font-bold text-center">
                Sales Order ID
              </th>
              <th className="w-1/5 px-6 py-2 font-bold text-center">Name</th>
              <th className="w-1/5 px-6 py-2 font-bold text-center">
                Sales Order Date
              </th>
              <th className="w-1/5 px-6 py-2 font-bold text-center">
                Quantity
              </th>
              <th className="w-1/5 px-6 py-2 font-bold text-center">
                Total (Rp)
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                >
                  No recent transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <RecentTransactionRow
                  key={transaction.invoiceId}
                  transaction={transaction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
