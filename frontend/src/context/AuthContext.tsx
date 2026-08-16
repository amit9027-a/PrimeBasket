import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router";

type AuthUser = {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
};

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
};

const authContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = (data: AuthResponse) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return <authContext.Provider value={{ user, login, logout }}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(authContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
