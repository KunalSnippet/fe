import { useTheme } from "next-themes"

interface TeaTokIconLogoProps {
  className?: string
}

export function TeaTokIconLogo({ className = "h-8 w-8" }: TeaTokIconLogoProps) {
  const { theme } = useTheme()
  
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tea cup base */}
      <circle 
        cx="50" 
        cy="55" 
        r="35" 
        fill={theme === 'dark' ? 'url(#cup-gradient-dark)' : 'url(#cup-gradient-light)'} 
      />
      
      {/* Tea surface */}
      <ellipse 
        cx="50" 
        cy="45" 
        rx="25" 
        ry="8" 
        fill={theme === 'dark' ? 'url(#tea-gradient-dark)' : 'url(#tea-gradient-light)'} 
      />
      
      {/* Handle */}
      <path 
        d="M75 50 Q85 50 85 60 Q85 70 75 70" 
        stroke={theme === 'dark' ? '#A855F7' : '#7C3AED'} 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Steam */}
      <path 
        d="M45 25 Q47 20 45 15 Q43 10 45 5" 
        stroke={theme === 'dark' ? '#60A5FA' : '#3B82F6'} 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round" 
        opacity="0.7"
      />
      <path 
        d="M55 25 Q57 20 55 15 Q53 10 55 5" 
        stroke={theme === 'dark' ? '#F472B6' : '#EC4899'} 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round" 
        opacity="0.7"
      />
      
      <defs>
        <linearGradient id="cup-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="cup-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
        <linearGradient id="tea-gradient-dark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="tea-gradient-light" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  )
}