const Star = ({ filled }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={filled ? '#000000' : 'none'}
    stroke="#000000"
    strokeWidth="1.4"
    aria-hidden="true"
  >
    <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3z" />
  </svg>
)

const RatingStars = ({ rating = 4.5, className = '' }) => {
  const fullStars = Math.floor(rating)
  const totalStars = 5

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalStars }).map((_, index) => (
          <Star key={index} filled={index < fullStars} />
        ))}
      </div>
      <span className="text-xs text-muted">{rating.toFixed(1)}</span>
    </div>
  )
}

export default RatingStars
