import cn from '../../utils/cn.js'

const Modal = ({ open, onClose, children, className }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
      />
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal

