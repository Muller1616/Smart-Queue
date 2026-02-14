const Card = ({ children, title, className = "" }) => {
  return (
    <div className={`bg-secondary p-6 rounded-xl shadow-lg border border-white/5 ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>}
      {children}
    </div>
  );
};
export default Card;
