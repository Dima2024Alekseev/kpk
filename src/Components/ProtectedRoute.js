import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, isAdmin = false }) => {
  console.log("ProtectedRoute rendered");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    console.log("No token, redirecting to /login");
    return <Navigate to="/login" />; // Перенаправление на страницу авторизации
  }

  // Если требуется доступ только для администратора
  if (isAdmin && user?.role !== "admin") {
    console.log("Not admin, redirecting to /");
    return <Navigate to="/" />; // Перенаправление на главную страницу
  }

  return children;
};

export default ProtectedRoute;
