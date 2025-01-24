import React, { useState, useEffect } from 'react';
import { register } from '../Services/authService'; 
import { Link, useNavigate } from 'react-router-dom';
import Message from '../../../Response/Message'; 

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState({ text: '', type: '' }); 
  const [showMessage, setShowMessage] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      navigate('/'); 
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const response = await register(username, password, email, role);
      if (response) {
        setMessage({ text: 'User registered successfully! Redirecting to login...', type: 'success' });
        setShowMessage(true); 
        setTimeout(() => navigate('/login'), 500);
      }
    } catch (error) {
      console.error("Registration failed:", error);
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
      <form onSubmit={handleRegister} className="bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-lg w-full sm:w-96 lg:w-96 transition-transform transform hover:scale-105">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6">Register</h2>
        
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
          <input
            type="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-4 py-3 text-lg text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:border-blue-600 peer transition-all duration-300 ease-in-out"
            required
          />
          <label className="absolute left-4 top-3 transform -translate-y-6 -translate-x-2 text-lg font-medium text-gray-500 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:-translate-y-0 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-4 peer-focus:-translate-x-2 peer-focus:text-blue-600 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 transition-all duration-300 ease-in-out">
            Email
          </label>
        </div>

        <div className="relative mb-6">
          <select
            value={role}
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
          Register
        </button>
        
        <p className="mt-4 text-sm sm:text-base text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
