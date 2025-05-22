import React from "react";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Pages/Home/Home";
import Calendar from "./Pages/Calendar/Сalendar";
import Students from "./Pages/Students/Students";
import Teachers from "./Pages/Teachers/Teachers";
import Statistics from "./Pages/Statistics/statistics";
import Login from "./Pages/Authorization/login";
import ScrollToTop from "./Components/ScrollToTop";
import ProtectedRoute from "./Components/ProtectedRoute";
import { EventsProvider } from "./Components/EventsContext";
import "./style/config.css";

const App = () => {
  return (
    <Router>
      <EventsProvider>
        <ScrollToTop />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Routes>
          {/* Общедоступные маршруты */}
          <Route path="/login" element={<Login />} />

          {/* Защищенные маршруты */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <Teachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/settings"
            element={
              <ProtectedRoute isAdmin>
                <Settings />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </EventsProvider>
    </Router>
  );
};

export default App;