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
          className={`w-full bg-white border-2 border-neutral-900 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500/40 focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-retro-sm transition-all ${
            error ? 'border-primary-600 bg-[#BF3A20]/5' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-mono font-bold text-primary-600">
            * {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
