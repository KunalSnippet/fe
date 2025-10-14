import { useTheme } from "next-themes"

interface TeaTokTextLogoProps {
  className?: string
}

export function TeaTokTextLogo({ className = "h-8" }: TeaTokTextLogoProps) {
  const { theme } = useTheme()
  
  return (
    <svg 
      className={className}
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <text 
        x="10" 
        y="35" 
        fontSize="28" 
        fontWeight="bold" 
        fontFamily="system-ui, -apple-system, sans-serif"
        fill={theme === 'dark' ? 'url(#gradient-dark)' : 'url(#gradient-light)'}
      >
        TeaTok
      </text>
      <text 
        x="10" 
        y="52" 
        fontSize="10" 
        fontFamily="system-ui, -apple-system, sans-serif"
        fill={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
      >
        spill the tea
      </text>
      <defs>
        <linearGradient id="gradient-dark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="gradient-light" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
      </defs>
    </svg>
  )
}