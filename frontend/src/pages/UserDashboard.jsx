import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import QueueList from "../components/QueueList";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Loading from "../components/Loading";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import toast, { Toaster } from 'react-hot-toast';

function UserDashboard() {
  const { user, logout } = useContext(AuthContext);
  const socket = useSocket();
  const [myTicket, setMyTicket] = useState(null);
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQueues = async () => {
    try {
      const { data } = await API.get("/queues");
      setQueues(data.data);
      if (data.data.length > 0 && !selectedQueue) {
        setSelectedQueue(data.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch queues", err);
      toast.error("Failed to load queues");
    }
  };

  const joinQueue = async () => {
    if (!selectedQueue) {
      toast.error("Please select a queue");
      return;
    }
    try {
      setLoading(true);
      await API.post("/tickets/join", { queueId: selectedQueue });
      toast.success("Joined queue successfully!");
      getMyTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join queue");
    } finally {
      setLoading(false);
    }
  };

  const getMyTicket = async () => {
    try {
      const { data } = await API.get("/tickets/my-ticket");
      if (data.success && data.data) {
        setMyTicket(data.data);
      } else {
        setMyTicket(null);
      }
    } catch {
      setMyTicket(null);
    }
  };

  const cancelTicket = async () => {
    if (!window.confirm("Are you sure you want to cancel your ticket?")) return;
    try {
      await API.put("/tickets/cancel");
      setMyTicket(null);
      toast.success("Ticket cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel ticket");
    }
  };

  useEffect(() => {
    fetchQueues();
    getMyTicket();
  }, []);

  // Socket Listener
  useEffect(() => {
    if (!socket) return;

    socket.on("ticket:update", (data) => {
        // If I have a ticket, refresh to check if my position changed or status changed
        // Or if I don't have a ticket, maybe I joined via another device? (Edge case)
        
        // Simple strategy: Always refresh my ticket status on any ticket update
        // Optimization: Only if queue matches my ticket's queue
        getMyTicket();

        // If the update is specifically about MY ticket
        if (myTicket && data.ticket && data.ticket._id === myTicket._id) {
            if (data.type === 'serve') {
                toast("It's your turn! Go to the counter.", { icon: '🔔', duration: 5000 });
            }
        }
    });

    socket.on("queue:update", () => {
        fetchQueues();
    });

    return () => {
        socket.off("ticket:update");
        socket.off("queue:update");
    };
  }, [socket, myTicket]);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
              Smart Queue
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Actions */}
          <div className="space-y-8">
            {!myTicket ? (
              <Card title="Join a Queue">
                {queues.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Select Service</label>
                      <select 
                        value={selectedQueue || ""} 
                        onChange={(e) => setSelectedQueue(e.target.value)}
                        className="w-full bg-primary border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent outline-none"
                      >
                        {queues.map(q => (
                          <option key={q._id} value={q._id}>{q.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={joinQueue} 
                      disabled={loading || !selectedQueue}
                      className="w-full"
                    >
                      {loading ? <Loading /> : "Get Ticket"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-400">No queues available at the moment.</p>
                )}
              </Card>
            ) : (
              <Card title="Your Ticket" className="border-accent/20">
                <div className="text-center py-8">
                  <div className="text-6xl font-bold font-mono text-accent mb-4">
                    #{myTicket.ticketNumber}
                  </div>
                  <div className="flex justify-center mb-6">
                    <Badge status={myTicket.status} />
                  </div>
                  
                  <div className="space-y-2 text-gray-300 mb-8">
                    <p>Queue: <span className="text-white font-medium">{myTicket.queue?.name}</span></p>
                    {myTicket.status === 'waiting' && (
                      <p>Position in line: <span className="text-white font-medium">{myTicket.position}</span></p>
                    )}
                  </div>

                  {myTicket.status === 'serving' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 animate-pulse">
                      <p className="text-green-400 font-bold text-lg">Please go to the counter!</p>
                    </div>
                  )}

                  <Button variant="danger" onClick={cancelTicket} className="w-full">
                    Cancel Ticket
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Queue List */}
          <div>
            <QueueList queueId={selectedQueue} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
