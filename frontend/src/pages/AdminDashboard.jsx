import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import QueueList from "../components/QueueList";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import toast, { Toaster } from 'react-hot-toast';

function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const socket = useSocket();
  const [stats, setStats] = useState(null);
  const [queues, setQueues] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState(""); // For filtering/serving
  const [newQueueName, setNewQueueName] = useState("");

  const serveNext = async () => {
    try {
      // Pass the selected queue ID if any
      const payload = selectedQueueId ? { queueId: selectedQueueId } : {};
      await API.patch("/tickets/next", payload);
      toast.success("Next ticket called!");
      // Stats will update via socket
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to serve next ticket");
    }
  };

  const completeTicket = async (ticketId) => {
    try {
      await API.patch(`/tickets/${ticketId}/complete`);
      toast.success("Ticket completed");
      // Stats will update via socket
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete ticket");
    }
  };

  const getStats = async () => {
    try {
      const { data } = await API.get("/tickets/stats");
      setStats(data.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchQueues = async () => {
    try {
      const { data } = await API.get("/queues");
      setQueues(data.data);
    } catch (err) {
      console.error("Failed to fetch queues", err);
    }
  };

  const createQueue = async (e) => {
    e.preventDefault();
    if (!newQueueName) return;
    try {
        await API.post("/queues", { name: newQueueName });
        setNewQueueName("");
        // Queues will update via socket
        toast.success("Queue created!");
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to create queue");
    }
  };

  const deleteQueue = async (queueId) => {
    if (!window.confirm("Are you sure? This will cancel all active tickets in this queue.")) return;
    try {
        await API.delete(`/queues/${queueId}`);
        toast.success("Queue deleted");
        // Socket will update list
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete queue");
    }
  };

  const resetQueue = async (queueId) => {
    if (!window.confirm("Are you sure? This will clear all waiting tickets.")) return;
    try {
        await API.post(`/queues/${queueId}/reset`);
        toast.success("Queue reset");
        // Socket will update list
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to reset queue");
    }
  };

  useEffect(() => {
    getStats();
    fetchQueues();
  }, []);

  // Socket Listener
  useEffect(() => {
    if (!socket) return;

    socket.on("ticket:update", () => {
        getStats();
    });

    socket.on("queue:update", () => {
        fetchQueues();
    });

    return () => {
        socket.off("ticket:update");
        socket.off("queue:update");
    };
  }, [socket]);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </header>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="text-center py-4">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-gray-400 text-sm">Waiting</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.waiting}</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-gray-400 text-sm">Serving</p>
              <p className="text-2xl font-bold text-blue-400">{stats.serving}</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-gray-400 text-sm">Served</p>
              <p className="text-2xl font-bold text-green-400">{stats.served}</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-gray-400 text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Controls & Current Ticket */}
          <div className="space-y-8">
            <Card title="Controls">
              <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Serve from Queue</label>
                    <select 
                        value={selectedQueueId} 
                        onChange={(e) => setSelectedQueueId(e.target.value)}
                        className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-accent mb-4"
                    >
                        <option value="">All Queues</option>
                        {queues.map(q => (
                            <option key={q._id} value={q._id}>{q.name}</option>
                        ))}
                    </select>
                </div>
                <Button onClick={serveNext} className="w-full">Serve Next Ticket</Button>
              </div>
            </Card>

            {/* Now Serving List */}
            {stats?.servingTickets && stats.servingTickets.length > 0 ? (
                stats.servingTickets.map(ticket => (
                    <Card key={ticket._id} title="Now Serving" className="border-blue-500/30 bg-blue-500/5">
                        <div className="text-center">
                        <div className="text-5xl font-bold font-mono text-blue-400 mb-2">
                            #{ticket.ticketNumber}
                        </div>
                        <p className="text-xl text-white font-medium mb-1">{ticket.user?.name}</p>
                        <p className="text-gray-400 text-sm">Queue: {ticket.queue?.name}</p>
                        <div className="mt-4">
                            <Button onClick={() => completeTicket(ticket._id)} variant="success" className="w-full">
                                Complete
                            </Button>
                        </div>
                        </div>
                    </Card>
                ))
            ) : (
               <Card className="flex items-center justify-center h-40 border-dashed border-2 border-gray-700 bg-transparent">
                 <p className="text-gray-500">No active tickets</p>
               </Card>
            )}

            <Card title="Create Queue">
              <form onSubmit={createQueue} className="flex gap-2">
                <input 
                  value={newQueueName}
                  onChange={(e) => setNewQueueName(e.target.value)}
                  placeholder="Queue Name"
                  className="flex-1 bg-primary border border-white/10 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-accent"
                />
                <Button type="submit">Add</Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Queues */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-white">Queues</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {queues.map(q => (
                <div key={q._id} className="relative group">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium text-accent">{q.name}</h4>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => resetQueue(q._id)}
                            className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded hover:bg-yellow-500/40"
                            title="Clear all tickets"
                        >
                            Reset
                        </button>
                        <button 
                            onClick={() => deleteQueue(q._id)}
                            className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/40"
                            title="Delete Queue"
                        >
                            Delete
                        </button>
                    </div>
                  </div>
                  <QueueList queueId={q._id} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
