import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) {
    // If user tries to access admin route but is user, redirect to user dashboard
    if (user.role === "USER") return <Navigate to="/user" />;
    // If admin tries to access user route, redirect to admin dashboard
    if (user.role === "ADMIN") return <Navigate to="/admin" />;
    
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
