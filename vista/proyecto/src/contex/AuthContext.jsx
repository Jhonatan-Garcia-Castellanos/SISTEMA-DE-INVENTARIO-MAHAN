import { createContext, useContext, useState } from "react";
 
const AuthContext = createContext(null);
 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
 
  const login = (email, password) => {
    if (email === "admin@demo.com" && password === "admin123") {
      setUser({ name: "Admin", email });
      setError("");
      return true;
    }
    setError("Credenciales incorrectas. Usa admin@demo.com / admin123");
    return false;
  };
 
  const logout = () => setUser(null);
 
  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => useContext(AuthContext);
