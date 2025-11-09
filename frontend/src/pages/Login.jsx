import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/globalComponents/Button'; 
import loginImage from '../../src/assets/loginimage.jpg'; 

function Login({ setAuthenticated }) {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
   const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password }),
   });

   const data = await response.json();

   if (!response.ok) {
    setError(data.error || 'Login failed');
    return;
   }

   localStorage.setItem('token', data.token);
   localStorage.setItem('user', JSON.stringify(data.user));

   setAuthenticated(true);
   navigate('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    setError('An error occurred. Please try again.');
  }
 };

 return (
  <div className='min-h-screen  min-w-screen flex justify-center items-center'>
    <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-md overflow-hidden h-[570px]">
      <div className="w-1/2 p-12 flex flex-col justify-center">
        <h2 className="text-4xl font-semibold mb-6 text-gray-800">Log in</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border p-2 rounded-2xl w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            />
          </div>
           <div>
           <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 rounded-2xl w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            />
            </div>
            <Button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
            Log in
            </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? 
          <a href="/register" className="text-blue-600 font-medium hover:underline">
          &nbsp; Register
          </a>
        </div>
        {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
      </div>
      <div className="w-1/2 hidden md:block relative"> {/* Added 'relative' here */}
        <img src={loginImage} alt="Login Panel" className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white to-transparent"></div>
      </div>
  </div>
  </div>

 );
}

export default Login;