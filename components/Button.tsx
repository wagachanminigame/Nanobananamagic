import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  // Pixel art button base styles
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 text-sm font-bold border-4 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider";
  
  const variants = {
    // Yellow primary (Banana style)
    primary: "bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300",
    // White secondary
    secondary: "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50",
    // Red danger
    danger: "bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-400",
    // Ghost (minimal pixel border)
    ghost: "bg-transparent text-gray-700 border-transparent hover:bg-black/5 hover:border-black/10 border-2",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="animate-pulse mr-2">▶</span>
          LOADING...
        </>
      ) : children}
    </button>
  );
};