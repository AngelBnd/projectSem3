import { useState, useEffect } from 'react'; // Import useEffect
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {

  return (
    <div className="app-container">
      <Sidebar/>
    </div>
  );
}

export default App;