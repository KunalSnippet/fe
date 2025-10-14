import { Link } from "react-router-dom"
import { ArrowLeft, Shield, Heart, Zap, Users, MessageCircle, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function About() {
  const features = [
    {
      icon: MessageCircle,
      title: "Anonymous Expression",
      description: "Share your thoughts, gossip, and reviews without revealing your identity. Create personas and keep it mysterious."
    },
    {
      icon: Coffee,
      title: "Unique Reactions",
      description: "React with Tea ☕, Spicy 🌶️, or Cap 🧢. Express yourself beyond basic likes with our themed reaction system."
    },
    {
      icon: Users,
      title: "Topic Rooms",
      description: "Join themed communities for Movies, Gaming, Celebrity Gossip, Campus Tea, and more. Each room has its own vibe."
    },
    {
      icon: Zap,
      title: "Instant Engagement",
      description: "Posts can have different lifespans - from 24-hour hot takes to permanent reviews. Choose how long your tea lives."
    },
    {
      icon: Shield,
      title: "Safe & Moderated",
      description: "Smart moderation keeps the platform fun and safe. We're built for positive anonymous interactions."
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "Built by tea-spillers, for tea-spillers. Every feature is designed to make anonymous sharing fun and addictive."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            variant="ghost"
            asChild
            className="flex items-center space-x-2"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>

        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <img src="/logo.png" alt="TeaTok Logo" className="hidden dark:block h-24 w-24 md:h-28 md:w-28 animate-float rounded object-contain" />
              <img src="/logo-light.png" alt="TeaTok Logo" className="block dark:hidden h-24 w-24 md:h-28 md:w-28 animate-float rounded object-contain" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold gradient-hero bg-clip-text text-transparent">
                About TeaTok
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The anonymous social playground where you spill gossip, drop reviews, 
                and connect through tea, threads, and hot takes.
              </p>
            </div>
          </section>

          {/* Mission */}
          <section className="animate-slide-in-right">
            <Card className="tea-card gradient-hero text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-white/90 leading-relaxed">
                  TeaTok reimagines social media by putting anonymity first. We believe the best conversations 
                  happen when people can express themselves freely without judgment. Whether you're spilling 
                  celebrity gossip, reviewing the latest blockbuster, or sharing campus drama, TeaTok is your 
                  safe space to be authentic.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Features Grid */}
          <section className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">What Makes TeaTok Special</h2>
              <p className="text-muted-foreground">
                Every feature is designed to make anonymous sharing fun, safe, and addictive.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title} 
                  className="tea-card hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="text-center">
                    <div className="gradient-primary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <Card className="tea-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">How TeaTok Works</CardTitle>
                <CardDescription>Simple, anonymous, and addictive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto text-2xl text-primary-foreground font-bold">
                      1
                    </div>
                    <h3 className="font-semibold">Choose Your Persona</h3>
                    <p className="text-sm text-muted-foreground">
                      Create anonymous aliases and personas. Be whoever you want to be.
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 gradient-accent rounded-full flex items-center justify-center mx-auto text-2xl text-accent-foreground font-bold">
                      2
                    </div>
                    <h3 className="font-semibold">Spill Your Tea</h3>
                    <p className="text-sm text-muted-foreground">
                      Share gossip, reviews, and hot takes in themed rooms. Text or voice - your choice.
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 gradient-warm rounded-full flex items-center justify-center mx-auto text-2xl text-white font-bold">
                      3
                    </div>
                    <h3 className="font-semibold">Watch It Brew</h3>
                    <p className="text-sm text-muted-foreground">
                      Get reactions, replies, and engage with the community. Watch your tea spread!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Values */}
          <section className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
            <Card className="tea-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Our Values</CardTitle>
                <CardDescription>What we believe in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-accent">Authenticity Over Identity</h3>
                    <p className="text-sm text-muted-foreground">
                      Real thoughts and genuine expression matter more than who you are in real life.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-accent">Fun Over Drama</h3>
                    <p className="text-sm text-muted-foreground">
                      We're here to spill tea and have fun, not to spread hate or toxicity.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-accent">Community Over Clout</h3>
                    <p className="text-sm text-muted-foreground">
                      It's not about followers or fame - it's about connecting with people who get your vibe.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-accent">Privacy Over Profit</h3>
                    <p className="text-sm text-muted-foreground">
                      Your anonymity is sacred. We'll never compromise your privacy for business gain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="text-center space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Card className="tea-card gradient-hero text-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Ready to spill some tea?</h2>
                <p className="text-white/90 mb-6">
                  Join the community where your voice matters more than your name.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary" size="lg" className="hover-scale shadow-soft">
                    <Link to="/auth">Join TeaTok</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                    <Link to="/feed">Explore Feed</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}