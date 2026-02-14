import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import Button from "../components/Button";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { motion } from "framer-motion";

function Profile() {
  const { user, login } = useContext(AuthContext); // login updates the user context
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;

      const { data } = await API.put("/users/profile", payload);
      
      // Update local storage and context
      // We need to keep the token but update the user object
      const token = localStorage.getItem("token");
      login({ token, user: data.data });
      
      toast.success("Profile updated successfully");
      setForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 flex items-center justify-center">
      <Toaster position="top-right" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card title="Edit Profile">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-primary border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Change Password (Optional)</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">New Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-primary border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent outline-none"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full bg-primary border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent outline-none"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export default Profile;
