import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full bg-saigon-neutral-surface border-2 border-saigon-neutral-text px-3 py-2 text-sm text-saigon-neutral-text placeholder:text-saigon-neutral-subText/40 focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-retro-sm transition-all ${
            error ? 'border-saigon-primary bg-[#BF3A20]/5' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-mono font-bold text-saigon-primary">
            * {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
