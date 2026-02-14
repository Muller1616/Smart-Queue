import { useEffect, useState } from "react";
import API from "../api/axios";

function QueueList() {
  const [queue, setQueue] = useState([]);

  const fetchQueue = async () => {
    const { data } = await API.get("/tickets/queue");
    setQueue(data.data);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div>
      <h3>Current Queue</h3>
      <ul>
        {queue.map((ticket) => (
          <li key={ticket._id}>
            Ticket #{ticket.number}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QueueList;
