// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FaPaperPlane } from 'react-icons/fa';
// import Message from '../../../Response/Message';

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');

//   useEffect(() => {
//     if (messages.length === 0) {
//       setMessages([{
//         text: "Welcome! How can I assist you today..?",
//         sender: 'bot',
//       }]);
//     }
//   }, [messages]);

//   const handleSendMessage = async () => {
//     if (!userInput.trim()) return;

//     const userMessage = { text: userInput, sender: 'user' };
//     setMessages(prev => [...prev, userMessage]);
//     setUserInput('');

//     try {
//       setIsLoading(true);
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/askz`,
//         {
//           question: userInput,
//           top_k: 3,
//           score_threshold: 0.3
//         },
//         { withCredentials: true }
//       );

//       const botMessage = { 
//         text: response.data.answer.split('\n'), 
//         sender: 'bot'
//       };
//       setMessages(prev => [...prev, botMessage]);
//     } catch (error) {
//       setErrorMessage('Failed to send message. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md p-6">
//         {messages.map((msg, index) => (
//           <div key={index} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
//             <div className={`inline-block px-4 py-2 rounded-lg shadow-md transition-all duration-300 
//               ease-in-out relative ${msg.sender === 'user' ? 
//               'bg-blue-500 text-white rounded-br-none' : 
//               'bg-gray-200 text-black rounded-bl-none'}`}
//             >
//               <div className={`absolute ${msg.sender === 'user' ? 'right-0 top-0' : 'left-0 top-0'} 
//                 w-2 h-0 border-l-8 border-r-8 border-t-8 border-transparent 
//                 ${msg.sender === 'user' ? 'border-t-blue-500' : 'border-t-gray-200'}`} 
//               />

//               {Array.isArray(msg.text) ? (
//                 msg.text.map((line, lineIndex) => (
//                   <div key={lineIndex} className="whitespace-pre-wrap">
//                     {line.split(/\*\*(.*?)\*\*/g).map((part, i) =>
//                       i % 2 === 0 ? part : <span key={i} className="font-bold">{part}</span>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div className="whitespace-pre-wrap">
//                   {msg.text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
//                     i % 2 === 0 ? part : <span key={i} className="font-bold">{part}</span>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}

//         {isLoading && (
//           <div className="flex items-center my-2">
//             <div className="flex items-center space-x-1">
//               {[1, 2, 3].map((i) => (
//                 <span key={i} className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" 
//                   style={{ animationDelay: `${(i-1)*0.2}s` }} 
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="flex sticky bottom-0 bg-white p-4 shadow-md">
//         <input
//           type="text"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//           placeholder="Type your message..."
//           className="flex-1 border border-gray-300 rounded-l-lg p-4 focus:outline-none 
//             focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
//         />
//         <button
//           onClick={handleSendMessage}
//           disabled={!userInput.trim()}
//           className="bg-blue-500 text-white rounded-r-lg p-4 hover:bg-blue-700 
//             transition-all duration-300 ease-in-out disabled:bg-blue-300"
//         >
//           <FaPaperPlane className="text-xl" />
//         </button>
//       </div>

//       {errorMessage && (
//         <Message message={errorMessage} type="error" onClose={() => setErrorMessage('')} />
//       )}
//     </div>
//   );
// };

// export default ChatBot;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import Message from '../../../Response/Message';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        text: "Welcome! How can I assist you today..?",
        sender: 'bot',
      }]);
    }
  }, [messages]);

  const formatMessage = (text) => {
    if (typeof text === 'string') {
      // Handle heading with bold
      return text.split('\n').map((line, index) => {
        if (line.startsWith('###')) {
          const headingText = line.replace('###', '').trim();
          return (
            <div key={index} className="font-bold text-lg mb-2 mt-4">
              {headingText}
            </div>
          );
        }
        // Handle regular bold text and numbered lists
        return (
          <div key={index} className="mb-1">
            {line.split(/\*\*(.*?)\*\*/g).map((part, i) =>
              i % 2 === 0 ? (
                <span key={i}>{part}</span>
              ) : (
                <span key={i} className="font-bold">{part}</span>
              )
            )}
          </div>
        );
      });
    }
    return text;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { text: userInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/askz`,
        {
          question: userInput,
          top_k: 3,
          score_threshold: 0.3
        },
        { withCredentials: true }
      );

      const botMessage = { 
        text: response.data.answer, 
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md p-6">
        {messages.map((msg, index) => (
          <div key={index} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-4 py-2 rounded-lg shadow-md transition-all duration-300 
              ease-in-out relative ${msg.sender === 'user' ? 
              'bg-blue-500 text-white rounded-br-none' : 
              'bg-gray-200 text-black rounded-bl-none'}`}
            >
              <div className={`absolute ${msg.sender === 'user' ? 'right-0 top-0' : 'left-0 top-0'} 
                w-2 h-0 border-l-8 border-r-8 border-t-8 border-transparent 
                ${msg.sender === 'user' ? 'border-t-blue-500' : 'border-t-gray-200'}`} 
              />
              {formatMessage(msg.text)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center my-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3].map((i) => (
                <span key={i} className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" 
                  style={{ animationDelay: `${(i-1)*0.2}s` }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex sticky bottom-0 bg-white p-4 shadow-md">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-l-lg p-4 focus:outline-none 
            focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
        />
        <button
          onClick={handleSendMessage}
          disabled={!userInput.trim()}
          className="bg-blue-500 text-white rounded-r-lg p-4 hover:bg-blue-700 
            transition-all duration-300 ease-in-out disabled:bg-blue-300"
        >
          <FaPaperPlane className="text-xl" />
        </button>
      </div>

      {errorMessage && (
        <Message message={errorMessage} type="error" onClose={() => setErrorMessage('')} />
      )}
    </div>
  );
};

export default ChatBot;