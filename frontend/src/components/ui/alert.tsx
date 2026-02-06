import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AlertProps {
  className?: string;
  children: ReactNode;
  variant?: 'default' | 'destructive';
}

export const Alert: React.FC<AlertProps> = ({ className, children, variant = 'default' }) => {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variant === 'destructive' && 'border-red-500 bg-red-50 text-red-900',
        variant === 'default' && 'border-gray-200 bg-gray-50',
        className,
      )}
    >
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  className?: string;
  children: ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ className, children }) => {
  return <p className={className}>{children}</p>;
};
