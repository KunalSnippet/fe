import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Ghost, Mail, Lock, ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createUser, loginUser, createAnonymousUser } from "@/lib/api"

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent, type: 'signin' | 'signup' | 'anonymous') => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      let user
      
      if (type === 'anonymous') {
        user = await createAnonymousUser()
        toast({
          title: "Welcome, Anonymous!",
          description: "You're now browsing anonymously. Start spilling some tea!",
        })
      } else if (type === 'signup') {
        if (!formData.name.trim()) {
          toast({
            title: "Error",
            description: "Name is required for signup",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
        user = await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
        toast({
          title: "Welcome to TeaTok!",
          description: "Account created successfully. Ready to spill some tea?",
        })
      } else { // signin
        user = await loginUser({
          email: formData.email,
          password: formData.password
        })
        toast({
          title: "Welcome back!",
          description: "Ready to spill some tea?",
        })
      }
      
      // Store user data and id in localStorage for session management
      localStorage.setItem('user', JSON.stringify(user))
      if (user && (user as any).id) {
        localStorage.setItem('userId', (user as any).id)
      }
      if (user && (user as any).token) {
        localStorage.setItem('authToken', (user as any).token)
      } else {
        localStorage.removeItem('authToken')
      }
      
      // Check if there's a redirect path stored
      const redirectPath = localStorage.getItem('redirectAfterLogin')
      if (redirectPath && redirectPath !== '/auth') {
        localStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath)
      } else {
        navigate('/feed')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex justify-center">
            <div className="relative">
              <img src="/logo.png" alt="TeaTok Logo" className="hidden dark:block h-20 w-20 md:h-24 md:w-24 animate-pulse-glow rounded object-contain" />
              <img src="/logo-light.png" alt="TeaTok Logo" className="block dark:hidden h-20 w-20 md:h-24 md:w-24 animate-pulse-glow rounded object-contain" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              Welcome to TeaTok
            </h1>
            <p className="text-muted-foreground">
              Spill anonymously, connect authentically
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="tea-card">
          <Tabs defaultValue="signin">
            <CardHeader className="space-y-1 pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="signin">
              <form onSubmit={(e) => handleSubmit(e, 'signin')}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="spill@teatime.com"
                        className="pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Your secret brew..."
                        className="pl-10 pr-10"
                        required
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full spill-button" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Brewing..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleSubmit(e, 'signup')}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <div className="relative">
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your display name"
                        className="pl-10"
                        required
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="newbie@teatime.com"
                        className="pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create your secret..."
                        className="pl-10 pr-10"
                        required
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full spill-button" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Brewing..." : "Join TeaTok"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Anonymous Option */}
        <Card className="tea-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-lg">
              <Ghost className="h-5 w-5 text-accent" />
              <span>Go Anonymous</span>
            </CardTitle>
            <CardDescription>
              Explore TeaTok without creating an account
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={(e) => handleSubmit(e as any, 'anonymous')}
              variant="outline" 
              className="w-full neon-border hover-glow"
              disabled={isLoading}
            >
              <Ghost className="h-4 w-4 mr-2" />
              {isLoading ? "Materializing..." : "Browse Anonymously"}
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to TeaTok's{" "}
          <Link to="/about" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/about" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}