import React, { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  className?: string;
  children: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant: _variant = 'default', 
  className, 
  children 
}) => {
  return <span className={className}>{children}</span>;
};
