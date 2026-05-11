import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle, noPadding = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-panel rounded-xl overflow-hidden flex flex-col",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-white/5 bg-white/2">
          {title && <h3 className="text-lg font-medium text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-zinc-500 mono mt-1 uppercase tracking-wider">{subtitle}</p>}
        </div>
      )}
      <div className={cn("flex-1", !noPadding && "p-6")}>
        {children}
      </div>
    </motion.div>
  );
};

import { cn } from '../utils';
