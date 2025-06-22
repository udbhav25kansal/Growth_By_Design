import { InputHTMLAttributes } from 'react';
import { cn } from '@/frontend/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * FormInput - A reusable input component for forms with label and error handling
 * Used in forms throughout the app for consistent input styling
 */
export default function FormInput({
  label,
  error,
  className = '',
  ...props
}: FormInputProps) {
  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500';
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input className={cn(baseClasses, errorClasses, className)} {...props} />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 