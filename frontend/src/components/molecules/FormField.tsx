import React from 'react';
import Input, { InputProps } from '../atoms/Input';

interface FormFieldProps extends InputProps {
  label: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`mb-4 w-full ${className}`}>
        <label className="block text-xs font-mono font-black uppercase text-neutral-900 mb-1">
          {label}
        </label>
        <Input ref={ref} error={error} {...props} />
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
