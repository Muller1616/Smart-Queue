import { useEffect, useState } from "react";
import API from "../api/axios";
import QueueList from "../components/QueueList";

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  const serveNext = async () => {
    await API.put("/tickets/serve");
    getStats();
  };

  const getStats = async () => {
    const { data } = await API.get("/tickets/stats");
    setStats(data.data);
  };

  useEffect(() => {
    getStats();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
<QueueList />

      <button onClick={serveNext}>Serve Next Ticket</button>

      {stats && (
        <div>
          <p>Total: {stats.total}</p>
          <p>Waiting: {stats.waiting}</p>
          <p>Served: {stats.served}</p>
          <p>Cancelled: {stats.cancelled}</p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
