import React from 'react';
import { cn } from '../lib/utils';

// NOTE: To use your custom PNG logo, replace the src below with your image path
// Example: src="/logo.png"
const CUSTOM_LOGO_URL = ""; 

export const Logo = ({ className }: { className?: string }) => {
  if (CUSTOM_LOGO_URL) {
    return (
      <img 
        src={CUSTOM_LOGO_URL} 
        alt="Thalexa Logo" 
        className={cn("object-contain", className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("w-10 h-10", className)}
    >
      {/* Main X body */}
      <path 
        d="M10 10L45 45L10 80H30L55 55L80 80H100L65 45L80 30H60L45 45L25 10H10Z" 
        fill="currentColor" 
      />
      {/* Detached diamond/square in top right */}
      <path 
        d="M75 5L95 25L75 45L55 25L75 5Z" 
        fill="currentColor" 
      />
    </svg>
  );
};
