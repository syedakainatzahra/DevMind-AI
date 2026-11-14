
import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
      }

      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser || !parsedUser.email) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
      }

      return parsedUser;

    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  // ======================================
  // Login
  // ======================================

  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    setUser(userData);
  };

  // ======================================
  // Update User
  // ======================================

  const updateUser = (updatedData) => {
    setUser((previousUser) => {
      if (!previousUser) return previousUser;

      const updatedUser = {
        ...previousUser,
        ...updatedData,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  // ======================================
  // Logout
  // ======================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
  };

  const isAuthenticated = Boolean(
    user && localStorage.getItem("token")
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
