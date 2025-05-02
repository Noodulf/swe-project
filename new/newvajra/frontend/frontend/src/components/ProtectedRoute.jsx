// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Temporarily bypass authentication for testing
  return children;
};

export default ProtectedRoute;
