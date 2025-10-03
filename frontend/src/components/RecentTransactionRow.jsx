export default function RecentTransactionRow({ transaction }) {
  const formatCurrency = (amount, currency) => {
    return `${currency} ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
  };

 return (
        <tr className="bg-white rounded-xl shadow-md transition duration-150">
            <td className="w-1/5 px-6 py-3 text-left font-semibold text-gray-800 rounded-l-xl">
                {transaction.invoiceID}
            </td>

            <td className="w-1/5 px-6 py-3 text-left text-gray-600 truncate">
                {transaction.customerName}
            </td>

            <td className="w-1/5 px-6 py-3 text-center text-gray-600">
                {transaction.invoiceDate}
            </td>

            <td className="w-1/5 px-6 py-3 text-right font-bold text-gray-900">
                {transaction.totalQuantity}
            </td>

            <td className="w-1/5 px-6 py-3 text-center text-sm text-gray-500 rounded-r-xl">
                {formatCurrency(transaction.totalAmount, transaction.currency)}
            </td>
        </tr>
    )
}