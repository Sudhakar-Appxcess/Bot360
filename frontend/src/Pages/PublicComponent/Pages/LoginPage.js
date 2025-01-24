import React, { useState, useEffect } from 'react';
import { login } from '../Services/authService';
import { useNavigate } from 'react-router-dom';
import Message from '../../../Response/Message'; 
import { Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('testadmin');
  const [password, setPassword] = useState('testadmin');
  const [role, setRole] = useState('admin'); 
  const [message, setMessage] = useState({ text: '', type: '' }); 
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); 
    try {
      const response = await login(username, password, role);

      if (response && response.detail === "Login successful") {
        setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
        setShowMessage(true);
        setTimeout(() => navigate('/'), 500); 
      }
    } catch (error) {
      console.error("Login failed:", error);
      setMessage({ text: error.message, type: 'error' }); 
      setShowMessage(true);
    }
  };

  const handleCloseMessage = () => {
    setShowMessage(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      {showMessage && (
        <Message
          message={message.text}
          type={message.type}
          onClose={handleCloseMessage}
        />
      )}
      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-lg w-full sm:w-96 lg:w-96 transition-transform transform hover:scale-105">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6">Login</h2>
        <div className="relative mb-6">
          <input
            type="text"
            placeholder=" "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full px-4 py-3 text-lg text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:border-blue-600 peer transition-all duration-300 ease-in-out"
            required
          />
          <label className="absolute left-4 top-3 transform -translate-y-6 -translate-x-2 text-lg font-medium text-gray-500 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:-translate-y-0 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-4 peer-focus:-translate-x-2 peer-focus:text-blue-600 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 transition-all duration-300 ease-in-out">
           Username
          </label>
        </div>
        <div className="relative mb-6">
          <input
            type="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-4 py-3 text-lg text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:border-blue-600 peer transition-all duration-300 ease-in-out"
            required
          />
          <label className="absolute left-4 top-3 transform -translate-y-6 -translate-x-2 text-lg font-medium text-gray-500 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:-translate-y-0 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-4 peer-focus:-translate-x-2 peer-focus:text-blue-600 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 transition-all duration-300 ease-in-out">
           Password
          </label>
        </div>
        <div className="relative mb-6">
          <select
            value={role}
            placeholder=" "
            onChange={(e) => setRole(e.target.value)}
            className="block w-full px-4 py-3 text-lg text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:border-blue-600 peer transition-all duration-300 ease-in-out"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <label className="absolute left-4 top-3 transform -translate-y-6 -translate-x-2 text-lg font-medium text-gray-500 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:-translate-y-0 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-4 peer-focus:-translate-x-2 peer-focus:text-blue-600 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 transition-all duration-300 ease-in-out">
            Role
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Login
        </button>
        <p className="mt-4 text-sm sm:text-base text-center">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
