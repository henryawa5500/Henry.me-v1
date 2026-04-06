import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

const slides = [
  {
    title: 'Shirts delivery is now easier',
    subtitle: 'Now, managing shirt deliveries has become simpler than ever',
    image: '/onboarding/onboarding-1.png',
  },
  {
    title: 'Package tracking is safer',
    subtitle: 'Tracking your package ensures a safer delivery experience',
    image: '/onboarding/onboarding-2.png',
  },
  {
    title: 'Use credits for making orders',
    subtitle: 'Consider using credits to make exclusive orders',
    image: '/onboarding/onboarding-3.png',
  },
]

const Onboarding = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)
  const navigate = useNavigate()

  const handleContinue = () => {
    if (activeIndex === slides.length - 1) {
      navigate('/signup')
      return
    }
    setActiveIndex((prev) => prev + 1)
  }

  const slide = slides[activeIndex]

  return (
    <div className="page-transition min-h-screen bg-white px-4 py-10 sm:bg-surface sm:px-6">
      <div
        className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-md sm:p-8"
        onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
        onTouchEnd={(event) => {
          if (touchStartX === null) return
          const diff = touchStartX - event.changedTouches[0].clientX
          if (diff > 40 && activeIndex < slides.length - 1) {
            setActiveIndex((prev) => prev + 1)
          }
          if (diff < -40 && activeIndex > 0) {
            setActiveIndex((prev) => prev - 1)
          }
          setTouchStartX(null)
        }}
      >
        <div className="flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#F6F6F6]">
          {slide.image ? (
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xs text-muted">Image placeholder</span>
          )}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary">{slide.title}</h2>
          <p className="mt-2 text-sm text-muted">{slide.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex ? 'bg-black' : 'bg-border'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button full onClick={handleContinue}>
            Continue
          </Button>
          <Button full variant="outline" onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
        <p className="text-center text-[11px] text-muted">
          By continuing, you agree to HenryME terms and conditions.
        </p>
      </div>
    </div>
  )
}

export default Onboarding
