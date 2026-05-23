import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'retro' | 'retro-primary' | 'simple';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'retro',
  children,
  className = '',
  ...props
}) => {
  let baseStyle = '';

  if (variant === 'retro') {
    baseStyle = 'btn-retro';
  } else if (variant === 'retro-primary') {
    baseStyle = 'btn-retro-primary';
  } else {
    baseStyle = 'px-4 py-2 text-sm font-medium hover:text-saigon-primary transition-colors duration-150';
  }

  return (
    <button className={`${baseStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
