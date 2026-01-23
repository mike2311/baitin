import React from 'react';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Separator: React.FC<SeparatorProps> = ({ 
  className, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  orientation: _orientation = 'horizontal' 
}) => {
  return <div className={className} />;
};
