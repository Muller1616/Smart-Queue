const Button = ({ children, onClick, disabled, variant = "primary", className = "" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-accent text-primary hover:bg-opacity-90",
    danger: "bg-danger text-white hover:bg-opacity-90",
    success: "bg-success text-white hover:bg-opacity-90",
    outline: "border-2 border-accent text-accent hover:bg-accent hover:text-primary"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
export default Button;
