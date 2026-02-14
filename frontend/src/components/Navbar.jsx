import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid gray" }}>
      <Link to="/">Home</Link>

      {user && user.role === "user" && (
        <Link to="/user" style={{ marginLeft: "10px" }}>
          Dashboard
        </Link>
      )}

      {user && user.role === "admin" && (
        <Link to="/admin" style={{ marginLeft: "10px" }}>
          Admin
        </Link>
      )}

      {user ? (
        <button onClick={logout} style={{ marginLeft: "20px" }}>
          Logout
        </button>
      ) : (
        <Link to="/register" style={{ marginLeft: "10px" }}>
          Register
        </Link>
      )}
    </nav>
  );
}

export default Navbar;
