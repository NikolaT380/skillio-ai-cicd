import React from 'react';
import { Sparkles } from 'lucide-react';

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <span className="text-2xl font-black text-primary tracking-tight">
          S<span className="text-accent underline decoration-4 decoration-accent/30 underline-offset-4">killio</span> AI
        </span>
        <Sparkles 
          className="absolute -top-1 -right-4 text-accent animate-pulse" 
          size={18} 
        />
      </div>
    </div>
  );
};

export default Logo;
