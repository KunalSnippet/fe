import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Plus, Search, Settings, User, Video, LogOut, MessageCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { logoutUser } from "@/lib/api"
import { useState, useEffect } from "react"
import ChatNotification from "@/components/ChatNotification"

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Load user from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])
  
  const handleLogout = async () => {
    if (!currentUser) return
    
    setIsLoggingOut(true)
    try {
      await logoutUser(currentUser.id)
      
      // Clear user data from localStorage
      localStorage.removeItem('user')
      setCurrentUser(null)
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      
      // Navigate to home page
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoggingOut(false)
    }
  }
  
  const navItems = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Rooms", href: "/rooms", icon: Search },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Video Call", href: "/video-call", icon: Video },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 hover-scale transition-smooth">
          <div className="flex items-center space-x-2">
            {/* Icon logo - dark/light */}
            <img src="/logo.png" alt="TeaTok Logo" className="hidden dark:block h-12 w-12 md:h-14 md:w-14 rounded object-contain" />
            <img src="/logo-light.png" alt="TeaTok Logo" className="block dark:hidden h-12 w-12 md:h-14 md:w-14 rounded object-contain" />
            {/* Wordmark - dark/light (increased size) */}
            <img src="/teatok.png" alt="TeaTok Text" className="hidden dark:block h-10 md:h-12 w-auto object-contain" />
            <img src="/teatok-light.png" alt="TeaTok Text" className="block dark:hidden h-10 md:h-12 w-auto object-contain" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth hover-lift ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.name === 'Chat' ? (
                  <ChatNotification userId={currentUser?.id || ''} />
                ) : (
                  <item.icon className="h-4 w-4" />
                )}
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          {/* User info and logout */}
          {currentUser && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden md:block">
                {currentUser.name || currentUser.alias || 'User'}
              </span>
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                size="sm"
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-1" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          )}
          
          <Button 
            asChild 
            className="spill-button animate-pulse-glow hidden sm:flex"
          >
            <Link to="/create">
              <Plus className="h-4 w-4 mr-2" />
              Spill Tea
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center p-3 rounded-lg transition-smooth ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name === 'Chat' ? (
                  <div className="relative">
                    <MessageCircle className="h-5 w-5 mb-1" />
                    <ChatNotification userId={currentUser?.id || ''} />
                  </div>
                ) : (
                  <item.icon className="h-5 w-5 mb-1" />
                )}
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
          
          {/* Mobile logout button */}
          {currentUser && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex flex-col items-center p-3 rounded-lg transition-smooth text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          )}
          
          <Button 
            asChild 
            size="icon"
            className="gradient-primary text-primary-foreground rounded-full shadow-glow hover-glow"
          >
            <Link to="/create">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}