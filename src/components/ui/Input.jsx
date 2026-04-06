import cn from '../../utils/cn.js'

const Input = ({ label, className, type = 'text', ...props }) => (
  <label className="block w-full text-sm font-medium text-primary">
    {label && <span className="mb-2 block">{label}</span>}
    <input
      type={type}
      className={cn(
        'h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-primary placeholder:text-muted transition focus-ring',
        className,
      )}
      {...props}
    />
  </label>
)

export default Input
