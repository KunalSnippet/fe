import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Users, Clock, TrendingUp, MessageCircle, Share2, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge as UiBadge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"
import { getRoom, getPosts, getPostReactions, addReaction, removeReaction, deletePost as apiDeletePost, ApiPost, ApiRoom } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Post extends ApiPost {
  reactions: {
    tea: number
    spicy: number
    cap: number
    hearts: number
  }
  replies: number
  userReaction?: string
}

export default function RoomDetail() {
  const { roomId } = useParams<{ roomId: string }>()
  const [room, setRoom] = useState<ApiRoom | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userReactions, setUserReactions] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)
        
        // Load user reactions
        const savedReactions = localStorage.getItem(`userReactions_${user.id}`)
        if (savedReactions) {
          setUserReactions(JSON.parse(savedReactions))
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Load room and posts
  useEffect(() => {
    const loadRoomData = async () => {
      if (!roomId) return
      
      try {
        setLoading(true)
        const [roomData, postsData] = await Promise.all([
          getRoom(roomId),
          getPosts(roomId)
        ])
        
        setRoom(roomData)
        
        // Load reactions for each post
        const postsWithReactions = await Promise.all(
          postsData.map(async (post) => {
            try {
              const reactionData = await getPostReactions(post.id, currentUser?.id)
              return {
                ...post,
                reactions: reactionData.reactions,
                replies: 0, // TODO: Implement replies count
                userReaction: reactionData.userReaction?.reactionType
              }
            } catch (error) {
              console.error('Error loading reactions for post:', post.id, error)
              return {
                ...post,
                reactions: { tea: 0, spicy: 0, cap: 0, hearts: 0 },
                replies: 0,
                userReaction: undefined
              }
            }
          })
        )
        
        setPosts(postsWithReactions)
      } catch (error) {
        console.error('Failed to load room data:', error)
        toast({
          title: "Error",
          description: "Failed to load room data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadRoomData()
  }, [roomId, currentUser?.id, toast])

  const handleReaction = async (postId: string, reactionType: 'tea' | 'spicy' | 'cap' | 'hearts') => {
    if (!currentUser) return

    const currentReaction = userReactions[postId]
    
    try {
      if (currentReaction === reactionType) {
        // Remove reaction
        await removeReaction(postId, reactionType)
        setUserReactions(prev => {
          const newReactions = { ...prev }
          delete newReactions[postId]
          return newReactions
        })
      } else {
        // Add new reaction (remove old one if exists)
        if (currentReaction) {
          await removeReaction(postId, currentReaction as any)
        }
        await addReaction(postId, reactionType)
        setUserReactions(prev => ({
          ...prev,
          [postId]: reactionType
        }))
      }

      // Refresh reactions for this post
      const reactionData = await getPostReactions(postId, currentUser.id)
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              reactions: reactionData.reactions,
              userReaction: reactionData.userReaction?.reactionType
            }
          : post
      ))

    } catch (error) {
      console.error('Error handling reaction:', error)
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      })
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return

    try {
      await apiDeletePost(postId)
      setPosts(prev => prev.filter(post => post.id !== postId))
      toast({
        title: "Success",
        description: "Post deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting post:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete post",
        variant: "destructive"
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const formatLastActivity = (dateString: string | null) => {
    if (!dateString) return 'No activity'
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <Navbar />
        <main className="container mx-auto px-4 pt-20 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading room...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <Navbar />
        <main className="container mx-auto px-4 pt-20 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Room not found</h1>
            <p className="text-muted-foreground mb-6">The room you're looking for doesn't exist.</p>
            <Link to="/rooms">
              <Button className="spill-button">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Rooms
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 max-w-4xl">
        <div className="space-y-6">
          {/* Back Button */}
          <Link to="/rooms">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rooms
            </Button>
          </Link>

          {/* Room Header */}
          <Card className="tea-card animate-fade-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 ${room.gradient} rounded-xl flex items-center justify-center text-4xl shadow-glow`}>
                    {room.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{room.name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {room.description}
                    </CardDescription>
                  </div>
                </div>
                {room.isTrending && (
                  <UiBadge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </UiBadge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-accent">{posts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-tea-orange">{room.recentPostCount}</div>
                  <div className="text-sm text-muted-foreground">Posts Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="tea-card text-center py-12">
                <CardContent>
                  <div className="text-4xl mb-4">☕</div>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to spill some tea in this room!
                  </p>
                  <Link to="/create">
                    <Button className="spill-button">
                      Create First Post
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              posts.map((post, index) => (
                <Card 
                  key={post.id} 
                  className="tea-card animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="gradient-primary text-white text-sm font-bold">
                            {post.author.alias ? post.author.alias.charAt(0) : post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-sm">
                            {post.author.alias || post.author.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UiBadge variant="secondary">{post.category}</UiBadge>
                        {post.authorId === currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    
                    {/* Reactions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'tea')}
                          className={`flex items-center space-x-1 ${
                            userReactions[post.id] === 'tea' ? 'text-tea-orange' : 'text-muted-foreground'
                          }`}
                        >
                          <span>☕</span>
                          <span>{post.reactions.tea}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'spicy')}
                          className={`flex items-center space-x-1 ${
                            userReactions[post.id] === 'spicy' ? 'text-red-500' : 'text-muted-foreground'
                          }`}
                        >
                          <span>🌶️</span>
                          <span>{post.reactions.spicy}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'cap')}
                          className={`flex items-center space-x-1 ${
                            userReactions[post.id] === 'cap' ? 'text-yellow-500' : 'text-muted-foreground'
                          }`}
                        >
                          <span>🧢</span>
                          <span>{post.reactions.cap}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'hearts')}
                          className={`flex items-center space-x-1 ${
                            userReactions[post.id] === 'hearts' ? 'text-pink-500' : 'text-muted-foreground'
                          }`}
                        >
                          <span>❤️</span>
                          <span>{post.reactions.hearts}</span>
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.replies}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
