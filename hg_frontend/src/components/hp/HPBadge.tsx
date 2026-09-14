import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface HPBadgeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'earned' | 'available';
  animated?: boolean;
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5 gap-0.5',
  md: 'text-sm px-2 py-1 gap-1',
  lg: 'text-base px-3 py-1.5 gap-1.5',
};

const iconSizes = { sm: 10, md: 14, lg: 18 };

export function HPBadge({ value, size = 'sm', variant = 'earned', animated = false }: HPBadgeProps) {
  const className = `inline-flex items-center font-body font-semibold rounded-full ${sizeClasses[size]} ${
    variant === 'earned' ? 'bg-success/20 text-success' : 'bg-accent/20 text-accent'
  }`;

  if (animated) {
    return (
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={className}
      >
        <Flame size={iconSizes[size]} />
        +{value} HP
      </motion.span>
    );
  }

  return (
    <span className={className}>
      <Flame size={iconSizes[size]} />
      +{value} HP
    </span>
  );
}
