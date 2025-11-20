import { useEffect, useState, type ReactNode } from "react"
import { useNavigate, useLocation } from "react-router-dom"

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user')
        const storedToken = localStorage.getItem('authToken')
        if (userData) {
          const user = JSON.parse(userData)
          const token = storedToken || user?.token
          if (user && user.id && token) {
            console.log('🔵 [AUTH] User authenticated:', user.name || user.alias)
            setIsAuthenticated(true)
          } else {
            console.log('🔴 [AUTH] Invalid user data, redirecting to login')
            localStorage.removeItem('user')
            localStorage.removeItem('authToken')
            // Store the current path to redirect back after login
            localStorage.setItem('redirectAfterLogin', location.pathname)
            navigate('/auth')
          }
        } else {
          console.log('🔴 [AUTH] No user data found, redirecting to login')
          // Store the current path to redirect back after login
          localStorage.setItem('redirectAfterLogin', location.pathname)
          localStorage.removeItem('authToken')
          navigate('/auth')
        }
      } catch (error) {
        console.error('🔴 [AUTH] Error checking authentication:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
        // Store the current path to redirect back after login
        localStorage.setItem('redirectAfterLogin', location.pathname)
        navigate('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [navigate, location.pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to /auth
  }

  return <>{children}</>
}
