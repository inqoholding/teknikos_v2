import React from "react";

export function BrandLogo({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle 
        cx="50" 
        cy="50" 
        r="38" 
        stroke="currentColor" 
        strokeWidth="12" 
        strokeDasharray="180 250" 
        strokeLinecap="round"
        transform="rotate(-15 50 50)"
      />
      <rect 
        x="42" 
        y="42" 
        width="16" 
        height="16" 
        rx="4" 
        fill="currentColor"
      >
        <animate 
          attributeName="opacity" 
          values="1;0.6;1" 
          dur="2s" 
          repeatCount="indefinite" 
        />
      </rect>
    </svg>
  );
}
