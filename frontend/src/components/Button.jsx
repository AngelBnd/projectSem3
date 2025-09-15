function Button({ onClick, className, children }) {
  return (
    <button
      onClick={onClick}
      className={`focus:outline-none focus:ring-0 focus-visible:outline-none px-8 py-[6px] rounded-full shadow bg-blue-500 text-white hover:bg-blue-600 transition font-nunito text-semibold text-[14px] ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
