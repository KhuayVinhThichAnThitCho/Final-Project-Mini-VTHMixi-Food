import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`w-full bg-white border-2 border-neutral-900 px-3 py-2 ${
              isPassword ? 'pr-10' : ''
            } text-sm text-neutral-900 placeholder:text-neutral-500/40 focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-retro-sm transition-all ${
              error ? 'border-primary-600 bg-[#BF3A20]/5' : ''
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
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
