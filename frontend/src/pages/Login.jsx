import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import toast, { Toaster } from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      login({ token: data.token, user: data.data.user });
      toast.success("Login successful!");

      if (data.data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <Card title="Login" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              className="w-full bg-primary border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent outline-none"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-primary border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent outline-none"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          Don't have an account? <Link to="/register" className="text-accent hover:underline">Register</Link>
        </p>
      </Card>
    </div>
  );
}

export default Login;
