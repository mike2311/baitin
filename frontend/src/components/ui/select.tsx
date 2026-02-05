import React, { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  onValueChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ children, onValueChange, onChange, className, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };
  // Filter out wrapper components - only SelectItem (option) should be direct children of select
  const validChildren = React.Children.toArray(children).reduce((acc: ReactNode[], child: any) => {
    if (React.isValidElement(child)) {
      if (child.type === SelectContent) {
        // Extract SelectItem children from SelectContent
        return [...acc, ...React.Children.toArray(child.props.children)];
      } else if (child.type === SelectItem) {
        return [...acc, child];
      }
      // Skip SelectTrigger and SelectValue
    }
    return acc;
  }, []);
  return <select {...props} className={className} onChange={handleChange}>{validChildren}</select>;
};

interface SelectTriggerProps {
  className?: string;
  children: ReactNode;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = () => {
  // SelectTrigger is just for API compatibility - doesn't render anything
  return null;
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = () => {
  // SelectValue is just for API compatibility - doesn't render anything
  return null;
};

interface SelectContentProps {
  className?: string;
  children: ReactNode;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  // SelectContent doesn't render a DOM element - children are extracted by Select component
  // Use fragment to preserve children without adding DOM nodes
  return <>{children}</>;
};

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};
