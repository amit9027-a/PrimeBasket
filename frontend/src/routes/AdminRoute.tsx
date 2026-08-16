import { Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "ADMIN") return <Navigate to="/unauthorized" replace />;

  return children;
};

export default AdminRoute;
