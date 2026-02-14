const Badge = ({ status }) => {
  const styles = {
    waiting: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    serving: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    served: "bg-green-500/20 text-green-400 border-green-500/50",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/50",
    completed: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.waiting} capitalize`}>
      {status}
    </span>
  );
};
export default Badge;
