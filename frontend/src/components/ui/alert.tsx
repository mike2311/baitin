import React, { ReactNode } from 'react';

interface AlertProps {
  className?: string;
  children: ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

interface AlertDescriptionProps {
  className?: string;
  children: ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ className, children }) => {
  return <p className={className}>{children}</p>;
};
