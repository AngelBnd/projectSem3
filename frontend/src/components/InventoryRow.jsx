export default function InventoryRow() {
  return (
    <tr className="bg-white rounded-md shadow text-sm">
      <td className="w-1/6 text-center py-2">P001</td>
      <td className="w-1/6 text-center py-2">Laptop</td>
      <td className="w-1/6 text-center py-2">Electronics</td>
      <td className="w-1/6 text-center py-2">10</td>
      <td className="w-1/6 text-center py-2">2025-09-16</td>
      <td className="w-1/6 text-center py-2">Available</td>
      <td className="w-1/6 text-center py-2">
        <div className="flex justify-center space-x-2">
          <button className="bg-blue-500 text-white px-2 py-1 rounded">
            Edit
          </button>
          <button className="bg-red-500 text-white px-2 py-1 rounded">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
