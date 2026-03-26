import React from 'react';
import { BudgetType } from '../../types/job';

interface BudgetDisplayProps {
  type: BudgetType;
  min: number | null;
  max: number | null;
  className?: string;
}

export function BudgetDisplay({ type, min, max, className = '' }: BudgetDisplayProps) {
  const formatMoney = (val: number | null) => {
    if (val == null) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  let content = '';

  if (type === 'negotiable') {
    content = 'Negotiable';
  } else if (type === 'fixed') {
    if (min === max) {
      content = formatMoney(min);
    } else {
      content = `${formatMoney(min)} - ${formatMoney(max)}`;
    }
  } else if (type === 'hourly') {
    if (min === max) {
      content = `${formatMoney(min)} / hr`;
    } else {
      content = `${formatMoney(min)} - ${formatMoney(max)} / hr`;
    }
  }

  return (
    <span className={`font-medium text-gray-900 ${className}`}>
      {content}
    </span>
  );
}
