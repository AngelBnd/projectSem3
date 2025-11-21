import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PopupProvider } from './components/globalComponents/PopupContext';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale, 
  BarElement,
  ArcElement,   
  PointElement,  
  LineElement,  
  Title,       
  Tooltip,      
  Legend       
} from 'chart.js';

// **Register the components with Chart.js**
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement, 
  PointElement,
  ArcElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Import BrowserRouter
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PopupProvider> 
    {/* Wrap the App component with BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </PopupProvider>
  </React.StrictMode>
);