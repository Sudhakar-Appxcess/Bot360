// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { FaPaperPlane } from 'react-icons/fa'; // Send icon
// import { MdClose } from 'react-icons/md'; // Close modal icon
// import Message from '../../../Response/Message'; // Import the Message component

// axios.defaults.withCredentials = true;

// const CustomeDB = () => {
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [connectionString, setConnectionString] = useState('');
//   const [connectionType, setConnectionType] = useState("mysql")
//   const [response, setResponse] = useState('');
//   const [messageType, setMessageType] = useState('');
//   const [messageContent, setMessageContent] = useState('');

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (messages.length === 0) {
//       const welcomeMessage = {
//         text: "Welcome to the Custom Database Connection! How can I assist you today?",
//         sender: 'bot',
//       };
//       setMessages([welcomeMessage]);
//     }
//   }, [messages]);

//   const formatText = (text) => {
//     return text
//       .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold formatting
//       .replace(/\n/g, '<br/>');                           // Line breaks
//   };

//   const handleSendMessage = async () => {
//     const userMessage = { text: userInput, sender: 'user' };
//     setMessages((prev) => [...prev, userMessage]);
//     setUserInput('');

//     try {
//       setIsLoading(true);
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/customdb/ask`,
//         { question: userInput },
//         { withCredentials: true }
//       );

//       const botMessage = { text: formatText(response.data.response), sender: 'bot' };
//       setMessages((prev) => [...prev, botMessage]);
//       setIsLoading(false);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessageType('error');
//       setMessageContent('Failed to send message, Check the internet or database connectivity');
//       // setMessageContent(response.detail)
//       setIsLoading(false);
//     }
//   };

//   const handleConnect = async () => {
//     try {
//       const res = await axios.post(
//         `${process.env.REACT_APP_API_URL}/customdb/connect_db`,
//         { db_url: connectionString , db_type:connectionType},
//         { withCredentials: true }, {
//         credentials: 'include'
//       }
//       );

//       if (res.data.message) {
//         setMessageType('success');
//         setMessageContent('Successfully connected to the database!');
//       } else {
//         setMessageType('error');
//         setMessageContent('Failed to connect to the database.');
//       }
//     } catch (error) {
//       console.error('Connection error:', error);
//       setMessageType('error');
//       setMessageContent('Error connecting to the database.');
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };


//   const handleDisconnect = async () => {
//     try {
//       await axios.get(`${process.env.REACT_APP_API_URL}/customdb/disconnect_db`,
//         { withCredentials: true }
//       );
//       setMessageType('success');
//       setMessageContent('Disconnected Successfully');
//     } catch (error) {
//       console.error("Failed to disconnect:", error);
//       setMessageType('error');
//       setMessageContent('Error Disconnecting to the database.');
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       {/* Header */}
//       <div className="flex-none bg-white shadow-md p-4 flex justify-between items-center">
//       <h1 className="text-xl font-semibold text-blue-600">Custom Database Connection</h1>
//       <div className="flex space-x-4">
        
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="bg-blue-500 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition duration-300 ease-in-out"
//           >
//             Connect to Database
//           </button>
//           <button
//             onClick={handleDisconnect}
//             className="bg-red-500 text-white rounded-lg px-6 py-2 hover:bg-red-700 transition duration-300 ease-in-out"
//           >
//             Disconnect
//           </button>
        
//       </div>
//     </div>
//       {/* Message Area - Show success/error/info messages */}
//       {messageType && (
//         <Message
//           message={messageContent}
//           type={messageType}
//           onClose={() => setMessageType('')}
//         />
//       )}

//       {/* Message Area */}
//       <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md p-6">
//         {messages.map((msg, index) => (
//           <div key={index} className={`my-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
//             <div
//               className={`inline-block px-5 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
//                 } relative`}
//             >
//               {/* V-shaped Tail */}
//               <div className={`absolute ${msg.sender === 'user' ? 'right-0 top-0' : 'left-0 top-0'} w-0 h-0 
//                               border-l-8 border-r-8 border-t-8 border-transparent 
//                               ${msg.sender === 'user' ? 'border-t-blue-500' : 'border-t-gray-200'} `} />

//               <div
//                 className="whitespace-pre-wrap"
//                 dangerouslySetInnerHTML={{ __html: msg.text }}
//               ></div>
//             </div>
//           </div>
//         ))}
//         {isLoading && (
//           <div className="flex items-center my-4">
//             <div className="flex items-center space-x-2">
//               <span className="dot"></span>
//               <span className="dot"></span>
//               <span className="dot"></span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Input and Send Button */}
//       <div className="flex sticky bottom-0 bg-white p-4 shadow-md">
//         <input
//           type="text"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           placeholder="Type your message..."
//           className="flex-1 border border-gray-300 rounded-l-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
//         />

       
//         <button
//           onClick={handleSendMessage}
//           disabled={!userInput.trim()}
//           className="bg-blue-500 text-white rounded-r-lg p-4 hover:bg-blue-700 transition duration-300 ease-in-out disabled:bg-gray-400"
//         >
//           <FaPaperPlane />
//         </button>
//       </div>

//       {/* Modal for Database Connection */}
//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
//             <button
//               onClick={closeModal}
//               className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl font-bold"
//             >
//               <MdClose />
//             </button>
//             <div className="space-y-4">
//               <h2 className="text-lg font-semibold">Database Connection</h2>
//               <input
//                 type="text"
//                 placeholder="Enter database URL"
//                 value={connectionString}
//                 onChange={(e) => setConnectionString(e.target.value)}
//                 className="border border-gray-300 rounded-lg p-2 w-full"
//               />
//               {/* Dropdown for selecting ConnectionType */}
//             <select
//               value={connectionType}
//               onChange={(e) => setConnectionType(e.target.value)}
//               className="border border-gray-300 rounded-lg p-2 w-full"
//             >
//               <option value="" disabled>Select Database Type</option>
//               <option value="mysql">MySQL</option>
//               <option value="postgres">PostgreSQL</option>
//               <option value="mongodb">MongoDB</option>
//               <option value="sqlite">SQLite</option>
//             </select>
//               <button
//                 onClick={handleConnect}
//                 className="bg-blue-500 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition duration-300 ease-in-out w-full"
//               >
//                 Connect
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       <style jsx>{`
//         .dot {
//           width: 10px;
//           height: 10px;
//           background-color: #d1d5db;
//           display: inline-block;
//           margin: 2px;
//           border-radius: 50%;
//         }

//         .dot:nth-child(1) {
//           animation: bounce 1s infinite;
//         }

//         .dot:nth-child(2) {
//           animation: bounce 1s infinite 0.2s;
//         }

//         .dot:nth-child(3) {
//           animation: bounce 1s infinite 0.4s;
//         }

//         @keyframes bounce {
//           0% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(-6px);
//           }
//           100% {
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CustomeDB;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import Message from '../../../Response/Message';

axios.defaults.withCredentials = true;

const CustomeDB = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionString, setConnectionString] = useState('');
  const [connectionType, setConnectionType] = useState("mysql")
  const [response, setResponse] = useState('');
  const [messageType, setMessageType] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        text: "Welcome to the Custom Database Connection! How can I assist you today?",
        sender: 'bot',
      };
      setMessages([welcomeMessage]);
    }
  }, [messages]);

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold formatting
      .replace(/\n/g, '<br/>');                           // Line breaks
  };

  const handleSendMessage = async () => {
    const userMessage = { text: userInput, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');

    try {
      setIsLoading(true);
      const DBKey = localStorage.getItem('DBKey'); // Retrieve DBKey from localStorage
      if (!DBKey) {
        setMessageType('error');
        setMessageContent('Database is not connected. Please connect first.');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/customdb/ask`,
        { question: userInput },
        { headers: { 'DBKey': DBKey } } // Pass DBKey in headers
      );

      const botMessage = { text: formatText(response.data.response), sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageType('error');
      setMessageContent('Failed to send message, Check the internet or database connectivity');
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/customdb/connect_db`,
        { db_url: connectionString , db_type:connectionType},
        { withCredentials: true }, {
        credentials: 'include'
      });

      if (res.data.DBKey) {
        console.log("Stored in localhost")
        localStorage.setItem('DBKey', res.data.DBKey);  // Store DBKey in localStorage
        setMessageType('success');
        setMessageContent('Successfully connected to the database!');
      } else {
        console.log("Not Stored in localhost")
        setMessageType('error');
        setMessageContent('Failed to connect to the database.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setMessageType('error');
      setMessageContent('Error connecting to the database.');
    }
  };

  const handleDisconnect = async () => {
    try {
      const DBKey = localStorage.getItem('DBKey'); // Retrieve DBKey from localStorage
      if (DBKey) {
        await axios.get(`${process.env.REACT_APP_API_URL}/customdb/disconnect_db`,
          { headers: { 'DBKey': DBKey } }
        );
        localStorage.removeItem('DBKey'); // Remove DBKey from localStorage
        setMessageType('success');
        setMessageContent('Successfully disconnected from the database!');
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      setMessageType('error');
      setMessageContent('Error disconnecting from the database.');
    }
  };
  const closeModal = () => {
        setIsModalOpen(false);
      };
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex-none bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-blue-600">Custom Database Connection</h1>
      <div className="flex space-x-4">
        
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Connect to Database
          </button>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 text-white rounded-lg px-6 py-2 hover:bg-red-700 transition duration-300 ease-in-out"
          >
            Disconnect
          </button>
        
      </div>
    </div>
      {/* Message Area - Show success/error/info messages */}
      {messageType && (
        <Message
          message={messageContent}
          type={messageType}
          onClose={() => setMessageType('')}
        />
      )}

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md p-6">
        {messages.map((msg, index) => (
          <div key={index} className={`my-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block px-5 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                } relative`}
            >
              {/* V-shaped Tail */}
              <div className={`absolute ${msg.sender === 'user' ? 'right-0 top-0' : 'left-0 top-0'} w-0 h-0 
                              border-l-8 border-r-8 border-t-8 border-transparent 
                              ${msg.sender === 'user' ? 'border-t-blue-500' : 'border-t-gray-200'} `} />

              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              ></div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center my-4">
            <div className="flex items-center space-x-2">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input and Send Button */}
      <div className="flex sticky bottom-0 bg-white p-4 shadow-md">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-l-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
        />

       
        <button
          onClick={handleSendMessage}
          disabled={!userInput.trim()}
          className="bg-blue-500 text-white rounded-r-lg p-4 hover:bg-blue-700 transition duration-300 ease-in-out disabled:bg-gray-400"
        >
          <FaPaperPlane />
        </button>
      </div>

      {/* Modal for Database Connection */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              <MdClose />
            </button>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Database Connection</h2>
              <input
                type="text"
                placeholder="Enter database URL"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
              {/* Dropdown for selecting ConnectionType */}
            <select
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full"
            >
              <option value="" disabled>Select Database Type</option>
              <option value="mysql">MySQL</option>
              <option value="postgres">PostgreSQL</option>
              <option value="mongodb">MongoDB</option>
              <option value="sqlite">SQLite</option>
            </select>
              <button
                onClick={handleConnect}
                className="bg-blue-500 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition duration-300 ease-in-out w-full"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .dot {
          width: 10px;
          height: 10px;
          background-color: #d1d5db;
          display: inline-block;
          margin: 2px;
          border-radius: 50%;
        }

        .dot:nth-child(1) {
          animation: bounce 1s infinite;
        }

        .dot:nth-child(2) {
          animation: bounce 1s infinite 0.2s;
        }

        .dot:nth-child(3) {
          animation: bounce 1s infinite 0.4s;
        }

        @keyframes bounce {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CustomeDB;


