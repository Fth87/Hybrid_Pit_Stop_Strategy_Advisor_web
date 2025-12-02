import { Compound } from '@/types';

export const getChipStyle = (compound: Compound): string => {
  switch (compound) {
    case 'SOFT':
      return 'text-red-500 border-red-500';
    case 'MEDIUM':
      return 'text-yellow-400 border-yellow-400';
    case 'HARD':
      return 'text-white border-white';
    case 'INTER':
      return 'text-green-500 border-green-500';
    case 'WET':
      return 'text-blue-500 border-blue-500';
    default:
      return '';
  }
};

export const formatTime = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};
