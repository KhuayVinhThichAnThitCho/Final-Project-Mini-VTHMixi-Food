import React from 'react';

export interface BadgeStampProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'info';
  className?: string;
}

export const BadgeStamp: React.FC<BadgeStampProps> = ({
  text,
  variant = 'primary',
  className = '',
}) => {
  let colorStyle = '';

  switch (variant) {
    case 'primary':
      colorStyle = 'border-saigon-primary text-saigon-primary bg-saigon-primary/5';
      break;
    case 'secondary':
      colorStyle = 'border-saigon-secondary text-saigon-secondary bg-saigon-secondary/5';
      break;
    case 'success':
      colorStyle = 'border-emerald-700 text-emerald-700 bg-emerald-50';
      break;
    case 'info':
      colorStyle = 'border-sky-700 text-sky-700 bg-sky-50';
      break;
  }

  return (
    <span
      className={`inline-block font-serif font-extrabold italic text-xs px-2.5 py-0.5 border-2 border-dashed uppercase tracking-wider rotate-[-1.5deg] ${colorStyle} ${className}`}
    >
      ★ {text}
    </span>
  );
};

export default BadgeStamp;
