import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Inventory from './components/pages/Inventory';
import Sales from './components/pages/Sales';

function App() {
  return (
    <div className="grid grid-cols-12 min-h-screen w-screen bg-gray-100">
      {/* Sidebar column */}
      <Sidebar />

      {/* Main content column */}
      <main className="col-span-10 bg-[#F5F7FA] px-[180px] mt-[52px]">
        <Routes>  
          <Route path="/inventory" element={<Inventory />} /> 
          <Route path="/sales" element={<Sales />} /> 
        </Routes>
      </main>
    </div>
  );
}


export default App;