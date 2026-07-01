import React, { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const AuthContext = createContext({
  isAuthenticated: false,
  getAccessToken: () => null,
  saveUser: (_userData) => {},
  getUser: () => ({}),
  logout: () => {},
  checkAuth: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isloading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cookie es HttpOnly -- JS no puede leerla; viaja automaticamente con credentials: "include"
  function getAccessToken() {
    return null;
  }

  function saveUser(userData) {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }

  function getUser() {
    return user;
  }

  async function logout() {
    // Limpiar estado ANTES del fetch para evitar que el redirect de login
    // o una ruta protegida rebote a /dashboard mientras isAuthenticated siga
    // siendo true durante la petición de red.
    sessionStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
    try {
      await fetch("/api/logout", {
        method: "DELETE",
        credentials: "include",
      });
    } catch (_) {
      // ignorar errores de red; el estado ya se limpió
    }
  }

  async function checkAuth() {
    try {
      const response = await fetch("/api/verifyToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        saveUser(data.user);
      } else {
        toast.error("Tu sesion ha expirado. Inicia sesion nuevamente.");
        setTimeout(() => logout(), 10000);
      }
    } catch (error) {
      console.error("Error en la autenticacion:", error);
      toast.error("Tu sesion ha expirado. Inicia sesion nuevamente.");
      setTimeout(() => logout(), 10000);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        getAccessToken,
        saveUser,
        getUser,
        logout,
        checkAuth,
      }}
    >
      {isloading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <ClipLoader color="#3498db" size={50} />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
