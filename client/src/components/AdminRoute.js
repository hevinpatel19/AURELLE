import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode'; // Make sure to run: npm install jwt-decode

const AdminRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuth();

  // 1. Check if user is logged in
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" />;
  }

  try {
    // 2. Decode the token to read the data inside it
    const decodedToken = jwtDecode(token);
    
    // DEBUGGING: Remove this line later if you want
    console.log("Admin Check - Token Data:", decodedToken);

    // 3. Get the Role (Checks two common places where the role might be stored)
    const userRole = decodedToken.user?.role || decodedToken.role;

    // 4. Check if Role is Admin
    if (userRole === 'admin') {
      return children; // Access Granted
    } else {
      console.log("Access Denied: User role is", userRole);
      return <Navigate to="/" />; // Access Denied -> Go Home
    }

  } catch (error) {
    console.error("Invalid Token:", error);
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;