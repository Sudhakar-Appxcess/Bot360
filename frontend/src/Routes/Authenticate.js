// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const getUserRole = () => {
//   return localStorage.getItem('role');
// };

// const isAuthenticated = () => {
//   return getUserRole() ? true : false;
// };

// const isAdmin = () => {
//   return getUserRole() === 'admin';
// };

// const Authenticate = ({ children, adminOnly = false }) => {
//   if (!isAuthenticated()) {
//     return <Navigate to="/login" />;
//   }

//   if (adminOnly && !isAdmin()) {
//     return <Navigate to="/" />; 
//   }

//   return children; 
// };

// export default Authenticate;

import React from 'react';
import { Navigate } from 'react-router-dom';

const getUserRole = () => {
  return localStorage.getItem('role');
};

const isAuthenticated = () => {
  return !!getUserRole(); // More concise way to check for existence
};

const isAdmin = () => {
  return getUserRole() === 'admin';
};

const Authenticate = ({ children, adminOnly = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" />;
  }

  return children; 
};

export default Authenticate;
