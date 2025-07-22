import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;
        
        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              'transition-colors',
              isFilled 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground',
              !readonly && 'cursor-pointer hover:text-yellow-400'
            )}
            onClick={() => !readonly && onChange?.(starValue)}
          />
        );
      })}
    </div>
  );
};