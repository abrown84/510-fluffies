import { cn } from '@/lib/utils'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-neutral-700 mb-1',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}
