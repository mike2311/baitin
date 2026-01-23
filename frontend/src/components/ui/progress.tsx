import React from 'react';

interface ProgressProps {
  value?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value = 0, className }) => {
  return <div className={className} style={{ width: `${value}%` }} />;
};
