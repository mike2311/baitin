import React, { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  onValueChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ children, onValueChange, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };
  return <select {...props} onChange={handleChange}>{children}</select>;
};

interface SelectTriggerProps {
  className?: string;
  children: ReactNode;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return <span>{placeholder}</span>;
};

interface SelectContentProps {
  className?: string;
  children: ReactNode;
}

export const SelectContent: React.FC<SelectContentProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};
