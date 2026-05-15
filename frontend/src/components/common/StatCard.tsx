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
      whileHover={{ y: -4, boxShadow: '0 12px 24px -10px rgba(13,27,42,0.15)' }}
      className="bg-white rounded-2xl border border-border p-6 flex items-center space-x-6 shadow-cool transition-all duration-300 group"
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-400/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
        <Icon size={28} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-text-admin-secondary uppercase tracking-[0.2em] truncate mb-1">{title}</p>
        <div className="flex items-baseline space-x-3">
          <h3 className="text-3xl font-black text-navy-900 tracking-tight">{value}</h3>
          {trend && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${trend.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
