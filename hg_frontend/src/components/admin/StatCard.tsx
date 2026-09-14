import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${iconColor}`}>
          <Icon size={20} />
        </div>
        {change && (
          <span className={`text-xs font-body font-medium px-2 py-0.5 rounded-full ${
            changeType === 'positive' ? 'bg-success/10 text-success' :
            changeType === 'negative' ? 'bg-destructive/10 text-destructive' :
            'bg-muted text-muted-foreground'
          }`}>
            {change}
          </span>
        )}
      </div>
      <p className="font-display font-bold text-foreground text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground font-body mt-1">{title}</p>
    </motion.div>
  );
}
