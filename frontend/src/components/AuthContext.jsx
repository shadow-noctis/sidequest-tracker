import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Decodes token and sets user
  const setUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch {
      setUser(null);
    }
  };

  // Login function
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUserFromToken(newToken);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    console.log("Logged out...");
  };

  // Check token validity on mount and whenever token changes
  useEffect(() => {
    if (!token) return;

    const checkToken = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/ping', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Invalid token");
        // Token is valid, make sure user state is up to date
        setUserFromToken(token);
      } catch (err) {
        console.log("Token is invalid, logging out...");
        logout();
      }
    };

    checkToken();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
