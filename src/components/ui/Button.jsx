import cn from '../../utils/cn.js'

const variants = {
  primary: 'bg-primary text-white hover:bg-black/90 shadow-sm',
  outline: 'border border-border text-primary hover:border-primary hover:bg-black/5',
  ghost: 'text-primary hover:bg-black/5',
}

const sizes = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-sm',
  xl: 'h-12 px-6 text-base',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  className,
  ...props
}) => (
  <button
    type="button"
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all active:scale-[0.98] focus-ring',
      variants[variant],
      sizes[size],
      full && 'w-full',
      props.disabled && 'opacity-40 pointer-events-none',
      className,
    )}
    {...props}
  >
    {children}
  </button>
)

export default Button
