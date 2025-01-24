import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Pages/Navbar/Navbar';
import Login from './Pages/PublicComponent/Pages/LoginPage';
import Register from './Pages/PublicComponent/Pages/RegisterPage';
import PrivateRoutes from './Routes/PrivateRoutes';
import ErrorPage from './Response/ErrorPage';

import ChatBotPage from "./Pages/PrivateComponent/ProtectedPage/ChatBotPage";
import UploadPage from "./Pages/PrivateComponent/ProtectedPage/UploadPage";
import EmailDashboard from "./Pages/PrivateComponent/AdminPage/EmailDashboard";
import CustomDB from './Pages/PrivateComponent/ProtectedPage/CustomDB';
import Authenticate from './Routes/Authenticate';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Authenticate ><ChatBotPage /></Authenticate>} />
          <Route path="/upload" element={<Authenticate ><UploadPage /></Authenticate>} />
          <Route path="/customdb" element={<Authenticate ><CustomDB /></Authenticate>} />
          <Route path="/email" element={<Authenticate adminOnly><EmailDashboard /></Authenticate>} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
