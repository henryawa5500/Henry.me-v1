import cn from '../../utils/cn.js'

const BottomSheet = ({ open, onClose, children, className }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close sheet"
      />
      <div
        className={cn(
          'relative w-full rounded-t-2xl bg-white p-6 pb-10 shadow-2xl animate-slideUp',
          className,
        )}
      >
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-border" />
        {children}
      </div>
    </div>
  )
}

export default BottomSheet

