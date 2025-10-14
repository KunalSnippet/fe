import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, MessageCircle, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect } from "react"

export default function Landing() {
  const navigate = useNavigate()

  // Only redirect to feed if user is on the root path and authenticated
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData && window.location.pathname === '/') {
      try {
        const user = JSON.parse(userData)
        if (user && user.id) {
          console.log('🔵 [LANDING] User already authenticated, redirecting to feed')
          navigate('/feed')
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [navigate])
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {/* Icon logo - dark/light */}
          <img src="/logo.png" alt="TeaTok Logo" className="hidden dark:block h-12 w-12 md:h-14 md:w-14 animate-float rounded object-contain" />
          <img src="/logo-light.png" alt="TeaTok Logo" className="block dark:hidden h-12 w-12 md:h-14 md:w-14 animate-float rounded object-contain" />
          {/* Wordmark - dark/light */}
          <img src="/teatok.png" alt="TeaTok" className="hidden dark:block h-8 md:h-9 w-auto object-contain" />
          <img src="/teatok-light.png" alt="TeaTok" className="block dark:hidden h-8 md:h-9 w-auto object-contain" />
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center mb-8">
            {/* Wordmark large - dark/light */}
            <img src="/teatok.png" alt="TeaTok" className="hidden dark:block h-32 md:h-40 animate-float object-contain" />
            <img src="/teatok-light.png" alt="TeaTok" className="block dark:hidden h-32 md:h-40 animate-float object-contain" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-hero bg-clip-text text-transparent">
              Spill it. Sip it. TeaTok it.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            The anonymous social playground where you spill gossip, drop reviews, 
            and connect through tea, threads, and hot takes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="spill-button text-lg px-8 py-4 animate-bounce-subtle"
            >
              <Link to="/auth">
                Join Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 neon-border hover-glow"
            >
              <Link to="/feed">
                Explore Tea
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="tea-card animate-slide-in-right text-center">
              <div className="gradient-primary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Anonymous Vibes</h3>
              <p className="text-muted-foreground">
                Share your hottest takes without revealing your identity. 
                Create personas and keep it mysterious.
              </p>
            </div>
            
            <div className="tea-card animate-slide-in-right text-center" style={{ animationDelay: '0.2s' }}>
              <div className="gradient-accent w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant Reactions</h3>
              <p className="text-muted-foreground">
                React with Tea ☕, Spicy 🌶️, or Cap 🧢. 
                Express yourself beyond basic likes and hearts.
              </p>
            </div>
            
            <div className="tea-card animate-slide-in-right text-center" style={{ animationDelay: '0.4s' }}>
              <div className="gradient-warm w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Safe & Playful</h3>
              <p className="text-muted-foreground">
                Built for fun, not drama. Smart moderation keeps 
                the tea hot but the vibes positive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero py-20 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to spill some tea?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands already sharing gossip, reviews, and anonymous connections.
          </p>
          <Button 
            asChild 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-4 hover-scale shadow-soft"
          >
            <Link to="/auth">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <img src="/logo.png" alt="TeaTok Logo" className="hidden dark:inline-block h-8 w-8 rounded object-contain" />
          <img src="/logo-light.png" alt="TeaTok Logo" className="inline-block dark:hidden h-8 w-8 rounded object-contain" />
          <span className="font-semibold">TeaTok</span>
        </div>
        <div className="flex justify-center space-x-6 text-sm">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/settings" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/settings" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  )
}