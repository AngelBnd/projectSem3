import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Inventory from './components/pages/Inventory';
import Sales from './components/pages/Sales';
import InputSales from './components/pages/InputSales';
import InputInventory from './components/pages/InputInventory';

function App() {
  return (
    <div className="grid grid-cols-12 min-h-screen w-screen bg-gray-100">
      {/* Sidebar column */}
      <Sidebar />

      {/* Main content column */}
      <main className="col-span-10 bg-[#F5F7FA] px-[180px] mt-[52px]">
        <Routes>  
          {/* Redirect from root to /inventory */}
          <Route path="/" element={<Navigate to="/inventory" replace />} />  

          <Route path="/inventory" element={<Inventory />} /> 
          <Route path="/sales" element={<Sales />} /> 
          <Route path="/sales/input" element={<InputSales />} />
          <Route path="/inventory/input" element={<InputInventory />} /> 
        </Routes>
      </main>
    </div>
  );
}

export default App;
