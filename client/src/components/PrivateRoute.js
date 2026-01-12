import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const token = localStorage.getItem('token'); // Double check token existence

  // If no user is logged in, send them to login
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;