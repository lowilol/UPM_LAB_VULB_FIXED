import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./rutas/login.jsx";
import Signup from "./rutas/signup.jsx";
import ChangerPassword from "./rutas/ChangerPassword.jsx";
import Profile from "./rutas/profile.jsx";
import Dashboard from "./rutas/dashboard.jsx";
import RequestPasssword from "./rutas/RequestPassword.jsx";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./rutas/protectedRoute.jsx";
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/changerPassword/:token" element={<ChangerPassword />} />
        <Route path="/requestPassword" element={<RequestPasssword />} />

      
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/me" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);