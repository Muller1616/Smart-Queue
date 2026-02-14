import { useEffect, useState } from "react";
import API from "../api/axios";
import QueueList from "../components/QueueList";

function UserDashboard() {
  const [myTicket, setMyTicket] = useState(null);
  const [loading, setLoading] = useState(false);


  const joinQueue = async () => {
  try {
    setLoading(true);
    await API.post("/tickets/join");
    getMyTicket();
  } catch (err) {
    alert(err.response?.data?.message);
  } finally {
    setLoading(false);
  }
};

  const getMyTicket = async () => {
    try {
      const { data } = await API.get("/tickets/my-ticket");
      setMyTicket(data.data);
    } catch {
      setMyTicket(null);
    }
  };

  const cancelTicket = async () => {
    await API.put("/tickets/cancel");
    setMyTicket(null);
  };

  useEffect(() => {
    getMyTicket();
  }, []);



  return (
    <div>
      <h2>User Dashboard</h2>
      <QueueList />

      {!myTicket ? (
        <button onClick={joinQueue}>Join Queue</button>
      ) : (
        <div>
          <p>Ticket: {myTicket.ticketNumber}</p>
          <p>Position: {myTicket.position}</p>
          <button onClick={cancelTicket}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
