import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute component for role-based access control.
 * @param {React.ReactNode} children - The component to render if authorized.
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ["ADMIN", "OWNER"]).
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authUser, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Not logged in, redirect to home or login page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!authUser?.role || !allowedRoles.includes(authUser.role)) {
      // Role not allowed, redirect to home or unauthorized page
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
