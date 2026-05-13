import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="card flex items-center p-6 space-x-6 hover:border-accent/30 transition-colors"
    >
      <div className="w-14 h-14 rounded-2xl bg-accent/5 text-accent flex items-center justify-center shrink-0">
        <Icon size={28} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest truncate">{title}</p>
        <div className="flex items-baseline space-x-3 mt-1">
          <h3 className="text-3xl font-black text-primary">{value}</h3>
          {trend && (
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${trend.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
