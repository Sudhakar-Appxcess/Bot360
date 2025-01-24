import React, { useEffect } from 'react';
import './Message.css';

const Message = ({ message, type, onClose }) => {
  const messageStyles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-500',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Display for 5 seconds for better visibility

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg text-white shadow-lg shadow-lg ${messageStyles[type]} 
        transition-transform duration-300 transform animate-fade-in 
        max-w-xs w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl`}
    >
      <div className="flex items-center space-x-2">
        {/* Display icon based on the message type */}
        <div className="text-lg sm:text-xl md:text-2xl">
          {type === 'success' && '✔️'}
          {type === 'error' && '❌'}
          {type === 'info' && 'ℹ️'}
          {type === 'warning' && '⚠️'}
        </div>
        <span className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl">{message}</span>
      </div>
    </div>
  );
};

export default Message;
