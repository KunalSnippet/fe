import { useState, useEffect } from "react"
import { Edit2, Award, Clock, MessageCircle, TrendingUp, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/layout/navbar"
import { getUserStats, getUserPosts, getUserBadges, ApiPost, ApiBadge } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Remove the old Badge interface since we're using ApiBadge from api.ts

interface PostHistory {
  id: string
  content: string
  category: string
  timestamp: string
  reactions: number
  replies: number
  status: "active" | "expired"
}

// Remove static badges - will load dynamic badges from API

const recentPosts: PostHistory[] = [
  {
    id: "1",
    content: "That new superhero movie everyone's hyping... it's mid at best. The plot holes are bigger than the hero's ego.",
    category: "Movies",
    timestamp: "2h ago",
    reactions: 234,
    replies: 45,
    status: "active"
  },
  {
    id: "2",
    content: "Y'all the drama between those two TikTok stars is getting MESSY 🍿",
    category: "Celeb Gossip", 
    timestamp: "1d ago",
    reactions: 567,
    replies: 89,
    status: "active"
  },
  {
    id: "3",
    content: "Anyone else think that new battle royale is actually fire? Best mechanics in years.",
    category: "Gaming",
    timestamp: "3d ago",
    reactions: 156,
    replies: 23,
    status: "expired"
  }
]

export default function Profile() {
  const [currentAlias, setCurrentAlias] = useState("The Campus Oracle")
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [userPosts, setUserPosts] = useState<ApiPost[]>([])
  const [userBadges, setUserBadges] = useState<ApiBadge[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)
        setCurrentAlias(user.alias || user.name)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  // Load user stats and posts
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return
      
      try {
        setLoading(true)
        const [stats, posts, badges] = await Promise.all([
          getUserStats(currentUser.id),
          getUserPosts(currentUser.id),
          getUserBadges(currentUser.id)
        ])
        
        setUserStats(stats)
        setUserPosts(posts)
        setUserBadges(badges)
      } catch (error) {
        console.error('Failed to load user data:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [currentUser, toast])

  const stats = userStats || {
    totalPosts: 0,
    totalReactions: 0,
    topCategory: "General",
    memberSince: "Unknown",
    streak: 0,
    averageReactions: 0
  }

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "gradient-primary"
      case "rare": return "gradient-accent" 
      case "common": return "gradient-warm"
      default: return "bg-muted"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 max-w-4xl">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="tea-card animate-fade-in">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                    {currentAlias.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={currentAlias}
                        onChange={(e) => setCurrentAlias(e.target.value)}
                        className="text-2xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary text-center"
                      />
                      <Button
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="spill-button"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold">{currentAlias}</h1>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="h-8 w-8 hover-scale"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4" />
                      <span>Anonymous ID: #{currentUser?.anonymousId || 'T3A7OK'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Since {stats.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-in-right">
            <Card className="tea-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{stats.totalPosts}</div>
                <div className="text-sm text-muted-foreground">Posts Spilled</div>
              </CardContent>
            </Card>
            
            <Card className="tea-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-accent">{stats.totalReactions.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Reactions</div>
              </CardContent>
            </Card>
            
            <Card className="tea-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-tea-orange">{stats.streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </CardContent>
            </Card>
            
            <Card className="tea-card text-center">
              <CardContent className="p-4">
                <div className="text-sm font-bold text-tea-pink">{stats.topCategory}</div>
                <div className="text-sm text-muted-foreground">Top Category</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="badges" className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="posts">My Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading badges...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {userBadges.map((badge, index) => (
                    <Card 
                      key={badge.id} 
                      className={`tea-card ${badge.earned ? 'shadow-glow' : badge.meetsRequirements ? 'border-accent/50' : 'opacity-60'}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${getBadgeRarityColor(badge.rarity)} rounded-full flex items-center justify-center text-2xl shadow-glow`}>
                            {badge.icon}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <span>{badge.name}</span>
                              {badge.earned && <Award className="h-4 w-4 text-accent" />}
                            </CardTitle>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getBadgeRarityColor(badge.rarity)} text-white border-0`}
                            >
                              {badge.rarity}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{badge.description}</CardDescription>
                        {badge.earned ? (
                          <div className="mt-3 text-xs text-accent">
                            Earned on {new Date(badge.earnedAt!).toLocaleDateString()}
                          </div>
                        ) : badge.meetsRequirements ? (
                          <div className="mt-3 text-xs text-accent">
                            Ready to earn! Check your activity.
                          </div>
                        ) : (
                          <div className="mt-3 text-xs text-muted-foreground">
                            Requirements: {badge.requirements.postsRequired > 0 && `${badge.requirements.postsRequired} posts`}
                            {badge.requirements.reactionsRequired > 0 && `, ${badge.requirements.reactionsRequired} reactions`}
                            {badge.requirements.daysActive > 0 && `, ${badge.requirements.daysActive} days active`}
                            {badge.requirements.category && `, ${badge.requirements.category} posts`}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading posts...</p>
                </div>
              ) : userPosts.length === 0 ? (
                <Card className="tea-card text-center py-12">
                  <CardContent>
                    <div className="text-4xl mb-4">☕</div>
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start spilling some tea to see your posts here!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                userPosts.map((post, index) => (
                  <Card 
                    key={post.id} 
                    className="tea-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{post.category}</Badge>
                          <Badge variant="default" className="bg-accent text-accent-foreground">
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <p className="text-sm leading-relaxed">{post.content}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-accent">
                            <TrendingUp className="h-4 w-4" />
                            <span>0</span>
                          </div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            <span>0</span>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="hover-scale">
                          View Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}