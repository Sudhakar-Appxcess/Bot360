// import React, { useState } from 'react';
// import emailjs from 'emailjs-com';
// import axios from 'axios';
// import Message from '../../../Response/Message'; // Import the Message component

// axios.defaults.withCredentials = true;

// const DynamicForm = ({ closeModal }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     mobile: '',
//     message: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });

//   // Show message and clear after 5 seconds
//   const showMessage = (text, type) => {
//     setMessage({ text, type });
//     setTimeout(() => clearMessage(), 2000); // Clear message after 5 seconds
//   };

//   // Clear the message
//   const clearMessage = () => setMessage({ text: '', type: '' });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const emailData = {
//       to_name: 'AppXcess',
//       from_name: formData.name,
//       email: formData.email,
//       mobile: formData.mobile,
//       message: formData.message
//     };

//     try {
//       // Send the email using emailjs
//       await emailjs.send(
//         'service_nvv5kyo', 
//         'template_zn9elxn', 
//         emailData, 
//         'J8y6H0MjQsIej70_Y'
//       );

//       // Send the form data to the server
//       await axios.post(`${process.env.REACT_APP_API_URL}/email/`, {
//         name: formData.name,
//         email: formData.email,
//         mobile: formData.mobile,
//         message: formData.message
//       }, {
//         withCredentials: true,
//       });

//       showMessage('Email sent and data stored successfully!', 'success');
//       setFormData({
//         name: '',
//         email: '',
//         mobile: '',
//         message: ''
//       });
//       closeModal();
//     } catch (error) {
//       showMessage('Failed to send email or store data, please try again.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center fixed inset-0 bg-gray-900 bg-opacity-50 z-50">
//       <form 
//         onSubmit={handleSubmit} 
//         className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md transform transition-all hover:scale-105"
//       >
//         <button
//           type="button"
//           onClick={closeModal}
//           className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition duration-200"
//         >
//           ✕
//         </button>
//         <h2 className="text-2xl font-semibold text-center mb-6">Contact Us</h2>

//         {['name', 'email', 'mobile', 'message'].map((field, index) => (
//           <div key={index} className="relative mb-6">
//             <input
//               type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
//               name={field}
//               value={formData[field]}
//               onChange={handleChange}
//               placeholder=" "
//               required
//               className="block w-full px-4 py-3 text-lg text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:border-blue-600 peer transition-all duration-300 ease-in-out"
//             />
//             <label className="absolute left-4 top-3 transform -translate-y-6 -translate-x-2 text-lg font-medium text-gray-500 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:-translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:-translate-y-4 peer-focus:-translate-x-2 peer-focus:text-blue-600 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 transition-all duration-300 ease-in-out">
//               {field.charAt(0).toUpperCase() + field.slice(1)}
//             </label>
//           </div>
//         ))}

//         <button
//           type="submit"
//           className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-200"
//           disabled={loading}
//         >
//           {loading ? 'Sending...' : 'Submit'}
//         </button>
//       </form>

//       {/* Displaying the message after submission */}
//       {message.text && (
//         <Message type={message.type} message={message.text} onClose={clearMessage} />
//       )}
//     </div>
//   );
// };

// export default DynamicForm;



import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import axios from 'axios';
import Message from '../../../Response/Message'; // Import the Message component

axios.defaults.withCredentials = true;

const DynamicForm = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Show message and clear after 5 seconds
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => clearMessage(), 2000); // Clear message after 5 seconds
  };

  // Clear the message
  const clearMessage = () => setMessage({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emailData = {
      to_name: 'AppXcess',
      from_name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      message: formData.message
    };

    try {
      // Send the email using emailjs
      await emailjs.send(
        'service_nvv5kyo', 
        'template_zn9elxn', 
        emailData, 
        'J8y6H0MjQsIej70_Y'
      );

      // Send the form data to the server
      await axios.post(`${process.env.REACT_APP_API_URL}/email/`, {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        message: formData.message
      }, {
        withCredentials: true,
      });

      showMessage('Email sent and data stored successfully!', 'success');
      setFormData({
        name: '',
        email: '',
        mobile: '',
        message: ''
      });
      closeModal();
    } catch (error) {
      showMessage('Failed to send email or store data, please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center fixed inset-0 bg-gray-900 bg-opacity-50 z-50">
      <form 
        onSubmit={handleSubmit} 
        className="relative bg-white p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg lg:max-w-xl transform transition-all hover:scale-105"
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition duration-200"
        >
          ✕
        </button>
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6">Contact Us</h2>

        {['name', 'email', 'mobile', 'message'].map((field, index) => (
          <div key={index} className="relative mb-6">
            <input
              type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder=" "
              required
              className="block w-full px-4 py-3 text-lg text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:border-blue-600 peer transition-all duration-300 ease-in-out"
            />
            <label className="absolute left-4 top-3 transform -translate-y-6 -translate-x-2 text-lg sm:text-xl font-medium text-gray-500 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:-translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:-translate-y-4 peer-focus:-translate-x-2 peer-focus:text-blue-600 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 transition-all duration-300 ease-in-out">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-200"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Submit'}
        </button>
      </form>

      {/* Displaying the message after submission */}
      {message.text && (
        <Message type={message.type} message={message.text} onClose={clearMessage} />
      )}
    </div>
  );
};

export default DynamicForm;
