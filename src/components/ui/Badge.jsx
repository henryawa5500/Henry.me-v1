import cn from '../../utils/cn.js'

const Badge = ({ className, children }) => (
  <span
    className={cn(
      'inline-flex min-w-[18px] items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-semibold text-white',
      className,
    )}
  >
    {children}
  </span>
)

export default Badge

