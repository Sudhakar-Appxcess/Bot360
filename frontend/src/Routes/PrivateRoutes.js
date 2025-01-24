import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Pages/Navbar/Navbar';
import Authenticate from './Authenticate';

const PrivateRoutes = () => {
  return (
    // <Authenticate  adminOnly>
    <>
      <Navbar />
      <Outlet />
      </>
    // </Authenticate>
  );
};

export default PrivateRoutes;
