import { useEffect, useState } from "react";
import API from "../api/axios";
import Badge from "./Badge";
import Card from "./Card";
import { useSocket } from "../context/SocketContext";

function QueueList({ queueId }) {
  const [tickets, setTickets] = useState([]);
  const socket = useSocket();

  const fetchQueue = async () => {
    try {
      const url = queueId ? `/tickets/queue?queueId=${queueId}` : "/tickets/queue";
      const { data } = await API.get(url);
      setTickets(data.data);
    } catch (err) {
      console.error("Failed to fetch queue", err);
    }
  };

  useEffect(() => {
    fetchQueue();
    
    if (socket) {
      socket.on("ticket:update", (data) => {
        // If the update is relevant to this queue (or if no queueId is specified, meaning all queues)
        if (!queueId || data.queueId === queueId || data.ticket?.queue === queueId) {
            fetchQueue();
        }
      });
    }

    return () => {
      if (socket) socket.off("ticket:update");
    };
  }, [queueId, socket]);

  return (
    <Card title="Current Queue" className="h-full">
      {tickets.length === 0 ? (
        <p className="text-gray-400">No tickets in queue.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="flex justify-between items-center p-3 bg-primary/50 rounded-lg border border-white/5">
              <span className="font-mono text-lg font-bold">#{ticket.ticketNumber}</span>
              <Badge status={ticket.status} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default QueueList;
