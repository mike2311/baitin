import React, { ReactNode } from 'react';

interface TableProps {
  className?: string;
  children: ReactNode;
}

export const Table: React.FC<TableProps> = ({ className, children }) => {
  return <table className={className}>{children}</table>;
};

interface TableHeaderProps {
  className?: string;
  children: ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ className, children }) => {
  return <thead className={className}>{children}</thead>;
};

interface TableBodyProps {
  className?: string;
  children: ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ className, children }) => {
  return <tbody className={className}>{children}</tbody>;
};

interface TableRowProps {
  className?: string;
  children: ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({ className, children }) => {
  return <tr className={className}>{children}</tr>;
};

interface TableHeadProps {
  className?: string;
  children: ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ className, children }) => {
  return <th className={className}>{children}</th>;
};

interface TableCellProps {
  className?: string;
  title?: string;
  children: ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({ className, title, children }) => {
  return <td className={className} title={title}>{children}</td>;
};
