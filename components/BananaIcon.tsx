import React from 'react';

interface BananaIconProps {
  className?: string;
  size?: number;
}

export const BananaIcon: React.FC<BananaIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Black Outline/Shadow */}
      <path 
        d="M6 2H10V4H12V6H14V8H16V10H18V12H20V18H18V20H16V22H10V20H8V18H6V16H4V8H6V2Z" 
        fill="#000000"
      />
      {/* Yellow Body */}
      <path 
        d="M8 4H10V6H12V8H14V10H16V12H18V18H16V20H10V18H8V16H6V8H8V4Z" 
        fill="#FACC15" 
      />
      {/* Stem Accent (Greenish) */}
      <path 
        d="M8 4H10V6H8V4Z" 
        fill="#A3E635"
      />
      {/* Highlight (Lighter Yellow) */}
      <path
        d="M10 8H12V10H10V8Z"
        fill="#FEF08A"
      />
       <path
        d="M12 10H14V12H12V10Z"
        fill="#FEF08A"
      />
    </svg>
  );
};