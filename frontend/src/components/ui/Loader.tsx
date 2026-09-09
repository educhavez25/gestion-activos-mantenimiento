import React from 'react';
import { cn } from '../../utils/cn';

export const Loader: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className,
  size = 'md',
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-brand-500 border-t-transparent',
          sizes[size]
        )}
      />
    </div>
  );
};
