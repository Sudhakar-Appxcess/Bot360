// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  const handleBeforeUnload = (event) => {
    // Clear the role from local storage
    localStorage.removeItem('role');
  };

  useEffect(() => {
    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex justify-between items-center shadow-lg z-50">
        <h3 className="text-white text-2xl font-bold"></h3>
        
        <div className="hidden md:flex items-center space-x-6">
          {role === 'admin' && (
            <>
              <Link to="/email" className="text-white hover:text-yellow-300 transition">Admin Dashboard</Link>
              <Link to="/" className="text-white hover:text-yellow-300 transition">ChatBot</Link>
              <Link to="/upload" className="text-white hover:text-yellow-300 transition">Upload</Link>
              <Link to="/customdb" className="text-white hover:text-yellow-300 transition">CustomDB</Link>
            </>
          )}
          {role === 'user' && (
            <>
              <Link to="/" className="text-white hover:text-yellow-300 transition">ChatBot</Link>
              <Link to="/upload" className="text-white hover:text-yellow-300 transition">Upload</Link>
              <Link to="/customdb" className="text-white hover:text-yellow-300 transition">CustomDB</Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="text-white bg-red-600 hover:bg-red-500 transition px-4 py-2 rounded-md">
            Logout
          </button>
        </div>
        
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMobile(!isMobile)}
        >
          {isMobile ? (
            <div className="flex flex-col items-center transition-transform duration-300">
              <div className="w-6 h-0.5 bg-white mb-1 transform rotate-45 transition-all ease-in-out"></div>
              <div className="w-6 h-0.5 bg-white mb-1 transition-opacity opacity-0"></div>
              <div className="w-6 h-0.5 bg-white mb-1 transform -rotate-45 transition-all ease-in-out"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center transition-transform duration-300">
              <div className="w-6 h-0.5 bg-white mb-1 transition-all ease-in-out"></div>
              <div className="w-6 h-0.5 bg-white mb-1 transition-all ease-in-out"></div>
              <div className="w-6 h-0.5 bg-white mb-1 transition-all ease-in-out"></div>
            </div>
          )}
        </button>
      </nav>

      <aside className={`fixed top-0 left-0 h-full w-3/4 bg-white shadow-lg transition-transform transform ${isMobile ? 'translate-x-0' : '-translate-x-full'} z-50 flex flex-col pt-16 overflow-y-auto`}>
        <div className="px-4 py-2 border-b border-gray-200"></div>
        <ul className="flex flex-col items-stretch space-y-2 p-4">
          {role === 'admin' && (
            <>
              <li>
                <Link to="/email" className="flex font-bold items-center p-3 rounded-lg text-gray-800 hover:bg-blue-100 transition duration-300" onClick={() => setIsMobile(false)}>
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/" className="flex font-bold items-center p-3 rounded-lg text-gray-800 hover:bg-blue-100 transition duration-300" onClick={() => setIsMobile(false)}>
                  ChatBot
                </Link>
                <Link to="/upload" className="flex font-bold items-center p-3 rounded-lg text-gray-800 hover:bg-blue-100 transition duration-300" onClick={() => setIsMobile(false)}>
                  Upload
                </Link>
                <Link to="/customdb" className="flex font-bold items-center p-3 rounded-lg text-gray-800 hover:bg-blue-100 transition duration-300" onClick={() => setIsMobile(false)}>
                  CustomDB
                </Link>
              </li>
            </>
          )}
          {role === 'user' && (
            <li>
              <Link to="/" className="flex font-bold items-center p-3 rounded-lg text-gray-800 hover:bg-blue-100 transition duration-300" onClick={() => setIsMobile(false)}>
                ChatBot
              </Link>
              <Link to="/upload" className="flex font-bold items-center p-3 rounded-lg text-gray-800 hover:bg-blue-100 transition duration-300" onClick={() => setIsMobile(false)}>
                Upload
              </Link>
              <Link to="/customdb" className="flex font-bold items-center p-3 rounded-lg text-gray-800 hover:bg-blue-100 transition duration-300" onClick={() => setIsMobile(false)}>
                CustomDB
              </Link>
            </li>
          )}
        </ul>
        <div className="mt-auto px-4 py-2 border-t border-gray-200">
          <button
            onClick={() => { handleLogout(); setIsMobile(false); }}
            className="w-full text-white bg-red-500 hover:bg-red-600 transition duration-300 rounded-lg p-3 font-semibold">
            Logout
          </button>
        </div>
      </aside>

      {isMobile && (
        <div className="fixed inset-0 bg-black opacity-40 transition-opacity z-40" onClick={() => setIsMobile(false)}></div>
      )}
    </>
  );
};

export default Navbar;
