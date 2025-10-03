export default function TopSellingRow({ item }) {
  const formatCurrency = (amount, currency) => {
    return `${currency} ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
  };

 return (
        <tr className="bg-white rounded-xl shadow-md transition duration-150">
            <td className="w-1/2 px-6 py-3 text-left font-semibold text-gray-800 rounded-l-xl">
                {item.productName}
            </td>

            <td className="w-1/2 px-6 py-3 text-left text-gray-600 truncate text-center">
                {item.quantitySold}
            </td>
        </tr>
    )
}