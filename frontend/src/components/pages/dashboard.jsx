// Dashboard.jsx (Optimized for 4 Equal Boxes)
export default function Dashboard() {
  return (
    <div className="grid grid-cols-4 md:grid-cols-9 gap-4 py-8"> 

      <div className="col-span-4 md:col-span-9 grid grid-cols-4 gap-4">
          
          <div className="col-span-1 bg-white rounded-lg shadow p-4"> 
            <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
            <p className="text-2xl font-bold">Rp 12,500,000</p>
          </div>

          <div className="col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-700">Total Profit</h2>
            <p className="text-2xl font-bold">Rp 3,500,000</p>
          </div>

          <div className="col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
            <p className="text-2xl font-bold">120</p>
          </div>


          <div className="col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-700">New Metric</h2>
            <p className="text-2xl font-bold">4th Box</p>
          </div>
      </div>
      
  
      <div className="col-span-4 md:col-span-9 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700">Sales Overview</h2>
        <p className="text-gray-600 mt-2">
          This area can contain charts or tables.
        </p>
      </div>

      <div className="col-span-4 md:col-span-9 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700">Inventory Summary</h2>
        <p className="text-gray-600 mt-2">
          Add your inventory details here.
        </p>
      </div>
    </div>
  );
}