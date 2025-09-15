import { Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-xl font-bold">This is the Home Page</h1>
      <Link to="/about" className="mt-4 text-lg text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
        Go to About Page
      </Link>
    </div>
  );
}

function About() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-green-600">This is the About Page</h1>
      <Link to="/" className="mt-4 text-lg text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
        Go to Home Page
      </Link>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;