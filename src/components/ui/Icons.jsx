const Icon = ({ children, size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
)

export const HomeIcon = (props) => (
  <Icon {...props}>
    <path d="M3 11.5L12 4l9 7.5" />
    <path d="M5 10.5V20h5v-5h4v5h5v-9.5" />
  </Icon>
)

export const ShopIcon = (props) => (
  <Icon {...props}>
    <path d="M4 7h16l-1.5 13H5.5L4 7z" />
    <path d="M8 7a4 4 0 0 1 8 0" />
  </Icon>
)

export const CartIcon = (props) => (
  <Icon {...props}>
    <path d="M6 6h14l-1.5 9H7.5L6 6z" />
    <path d="M6 6L5 3H3" />
    <circle cx="9" cy="20" r="1" />
    <circle cx="17" cy="20" r="1" />
  </Icon>
)

export const UserIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c2.2-3.5 5-5 8-5s5.8 1.5 8 5" />
  </Icon>
)

export const SearchIcon = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-3.5-3.5" />
  </Icon>
)

export const BellIcon = (props) => (
  <Icon {...props}>
    <path d="M18 16H6c1.5-1.5 2-3 2-6a4 4 0 1 1 8 0c0 3 0.5 4.5 2 6z" />
    <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
  </Icon>
)

export const GridIcon = (props) => (
  <Icon {...props}>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </Icon>
)

export const ArrowLeftIcon = (props) => (
  <Icon {...props}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
)

export const EyeIcon = (props) => (
  <Icon {...props}>
    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const EyeOffIcon = (props) => (
  <Icon {...props}>
    <path d="M4 4l16 16" />
    <path d="M3 12s3.5-6 9-6c2 0 3.7.6 5 1.4" />
    <path d="M21 12s-3.5 6-9 6c-2.1 0-4-0.6-5.5-1.6" />
    <path d="M10 10a3 3 0 0 0 4 4" />
  </Icon>
)

export const GoogleIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.2 3-7.3z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.7 0 5-0.9 6.7-2.5l-3.2-2.5c-.9.6-2 .9-3.5.9-2.6 0-4.8-1.7-5.6-4h-3.3v2.6C4.8 19.7 8.1 22 12 22z"
      fill="#34A853"
    />
    <path
      d="M6.4 13.9a6.1 6.1 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6z"
      fill="#FBBC05"
    />
    <path
      d="M12 6.5c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3.5 14.7 2.5 12 2.5 8.1 2.5 4.8 4.8 3.1 8.5l3.3 2.6c.8-2.3 3-4 5.6-4z"
      fill="#EA4335"
    />
  </svg>
)

export const FacebookIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.1V12h2.1V9.8c0-2.1 1.3-3.3 3.2-3.3.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.3V12h2.2l-.3 2.9h-1.9v7A10 10 0 0 0 22 12z"
      fill="#1877F2"
    />
  </svg>
)

export const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
)

export const MinusIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
  </Icon>
)

export const TrashIcon = (props) => (
  <Icon {...props}>
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M8 7l1 12h6l1-12" />
  </Icon>
)

export const CardIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 14h4" />
  </Icon>
)

export const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="M5 13l4 4L19 7" />
  </Icon>
)

export default Icon

