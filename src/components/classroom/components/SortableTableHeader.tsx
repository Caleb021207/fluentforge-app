
import React from 'react';
import { TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SortField, SortDirection } from '../types/studentTypes';

interface SortableTableHeaderProps {
  field: SortField;
  label: string;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const SortableTableHeader = ({
  field,
  label,
  currentSortField,
  sortDirection,
  onSort
}: SortableTableHeaderProps) => {
  const SortIcon = () => {
    if (field !== currentSortField) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  return (
    <TableHead 
      className="cursor-pointer"
      onClick={() => onSort(field)}
    >
      {label} <SortIcon />
    </TableHead>
  );
};
