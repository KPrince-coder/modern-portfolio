import React from 'react';

export type SortableField = 'email' | 'created_at' | 'last_sign_in_at';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortableField;
  direction: SortDirection;
}

interface SortIconProps {
  field: SortableField;
  currentSort: SortConfig;
}

const SortIcon: React.FC<SortIconProps> = ({ field, currentSort }) => {
  if (currentSort.field !== field) return null;
  
  return currentSort.direction === 'asc' ? (
    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
};

export default SortIcon;