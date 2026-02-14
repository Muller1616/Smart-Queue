import { motion } from "framer-motion";
import Badge from "./Badge";

const HistoryList = ({ tickets, isAdmin = false }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No history found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket, index) => (
        <motion.div
          key={ticket._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-secondary p-4 rounded-lg border border-white/5 flex justify-between items-center"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-accent">
                #{ticket.ticketNumber}
              </span>
              <span className="text-gray-300 font-medium">
                {ticket.queue?.name || "Unknown Queue"}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {new Date(ticket.createdAt).toLocaleString()}
              {isAdmin && ticket.user && (
                <span className="ml-2 text-gray-400">
                  by {ticket.user.name} ({ticket.user.email})
                </span>
              )}
            </div>
          </div>
          <Badge status={ticket.status} />
        </motion.div>
      ))}
    </div>
  );
};

export default HistoryList;
