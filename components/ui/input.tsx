import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full px-6 py-4 backdrop-blur-xl rounded-xl text-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2',
  {
    variants: {
      variant: {
        default:
          'bg-white/10 border border-white/20 focus:border-emerald-500 focus:ring-emerald-500/50',
        search:
          'pl-12 bg-white/10 border border-white/20 focus:border-emerald-500 focus:ring-emerald-500/50',
        error:
          'bg-white/10 border border-red-500/50 focus:border-red-500 focus:ring-red-500/50',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-4 text-base',
        lg: 'px-8 py-5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          className={cn(
            inputVariants({ variant: error ? 'error' : variant, size, className })
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? 'input-error' : undefined}
          {...props}
        />
        {error && (
          <p id="input-error" className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
