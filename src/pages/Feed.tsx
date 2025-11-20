import React, { useEffect, useState } from "react"
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock, Flame, Coffee, Flag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge as UiBadge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"
import { getPosts, getPostReactions, addReaction, removeReaction, deletePost as apiDeletePost } from "@/lib/api"
import { CommentsSection } from "@/components/CommentsSection"

interface Post {
  id: string
  authorId?: string
  author: string
  alias: string
  content: string
  timestamp: string
  duration: string
  reactions: {
    tea: number
    spicy: number
    cap: number
    hearts: number
  }
  replies: number
  category: string
  isVoiceNote?: boolean
}

// api imports moved above

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userReactions, setUserReactions] = useState<Record<string, string>>({}) // postId -> reactionType
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({}) // postId -> isOpen

  // Save user reactions to localStorage whenever they change
  const saveUserReactions = (reactions: Record<string, string>) => {
    if (currentUser) {
      localStorage.setItem(`userReactions_${currentUser.id}`, JSON.stringify(reactions))
      console.log('🔵 [FEED] User reactions saved to localStorage:', reactions)
    }
  }

  // Load user from localStorage on component mount (since we're in ProtectedRoute, user should exist)
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)
        console.log('🔵 [FEED] User loaded from localStorage:', user)
        
        // Load user reactions from localStorage
        const savedReactions = localStorage.getItem(`userReactions_${user.id}`)
        if (savedReactions) {
          try {
            const reactions = JSON.parse(savedReactions)
            setUserReactions(reactions)
            console.log('🔵 [FEED] User reactions loaded from localStorage:', reactions)
          } catch (error) {
            console.error('Error parsing user reactions:', error)
            localStorage.removeItem(`userReactions_${user.id}`)
          }
        }
        
        // Load posts after user is loaded
        loadPosts()
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
        // Redirect to auth (this shouldn't happen in ProtectedRoute, but just in case)
        window.location.href = '/auth'
      }
    } else {
      // This shouldn't happen in ProtectedRoute, but just in case
      localStorage.removeItem('authToken')
      window.location.href = '/auth'
    }
  }, [])

  const loadPosts = async () => {
    try {
      console.log('Loading posts from API...')
      const apiPosts = await getPosts()
      console.log('Received posts:', apiPosts.length)
      
      // Map API posts to UI shape
      const uiPosts: Post[] = apiPosts.map((p) => ({
        id: p.id,
        authorId: p.authorId,
        author: p.author.name,
        alias: p.author.alias || "Anon",
        content: p.content,
        timestamp: new Date(p.createdAt).toLocaleString(),
        duration: p.duration,
        reactions: { tea: 0, spicy: 0, cap: 0, hearts: 0 }, // Start with zero reactions
        replies: 0,
        category: p.room.name,
        isVoiceNote: p.isVoiceNote
      }))
      
      setPosts(uiPosts)
      console.log('Posts set:', uiPosts.length)
      
      // Load reactions for each post and user's reactions
      for (const apiPost of apiPosts) {
        try {
          const userId = currentUser?.id
          const reactionData = await getPostReactions(apiPost.id, userId)
          
          // Update post reactions
          setPosts(prevPosts => prevPosts.map(post => 
            post.id === apiPost.id 
              ? { ...post, reactions: reactionData.reactions }
              : post
          ))
          
          // Update user's reactions if they have one on this post
          if (reactionData.userReaction) {
            setUserReactions(prev => {
              const newReactions = {
                ...prev,
                [apiPost.id]: reactionData.userReaction.reactionType
              }
              saveUserReactions(newReactions)
              return newReactions
            })
          }
        } catch (error) {
          console.error('Failed to load reactions for post:', apiPost.id, error)
        }
      }
    } catch (error) {
      console.error('Failed to load posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (postId: string, type: keyof Post['reactions']) => {
    if (!currentUser) {
      console.log('🔴 [FEED] No user logged in, cannot react')
      return
    }

    try {
      const currentReaction = userReactions[postId]
      
      console.log(`🔵 [FEED] Handling reaction: ${type} for post ${postId}`)
      console.log(`🔵 [FEED] Current user reaction: ${currentReaction}`)
      
      // If user already has this reaction, remove it
      if (currentReaction === type) {
        console.log(`🟡 [FEED] Removing existing reaction: ${type}`)
        await removeReaction(postId, type)
        
        // Update local state
        setUserReactions(prev => {
          const newReactions = { ...prev }
          delete newReactions[postId]
          saveUserReactions(newReactions)
          return newReactions
        })
        
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, reactions: { ...post.reactions, [type]: Math.max(0, post.reactions[type] - 1) } }
            : post
        ))
      } else {
        // If user has a different reaction, update it
        if (currentReaction) {
          console.log(`🟡 [FEED] Updating reaction from ${currentReaction} to ${type}`)
        }
        
        // Add new reaction (this will handle updating existing reaction on backend)
        await addReaction(postId, type)
        
        // Update local state
        setUserReactions(prev => {
          const newReactions = { ...prev, [postId]: type }
          saveUserReactions(newReactions)
          return newReactions
        })
        
        // Reload reactions from server to get accurate counts
        try {
          const reactionData = await getPostReactions(postId, currentUser?.id)
          setPosts(prevPosts => prevPosts.map(post => 
            post.id === postId 
              ? { ...post, reactions: reactionData.reactions }
              : post
          ))
        } catch (error) {
          console.error('Failed to reload reactions:', error)
        }
      }
    } catch (error) {
      console.error('Failed to handle reaction:', error)
    }
  }

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'tea': return '☕'
      case 'spicy': return '🌶️'
      case 'cap': return '🧢'
      default: return '❤️'
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      if (!currentUser) return
      const confirmed = window.confirm('Delete this post? This cannot be undone.')
      if (!confirmed) return
      await apiDeletePost(postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Celeb Gossip': return 'gradient-primary'
      case 'Movies': return 'gradient-accent'
      case 'Gaming': return 'gradient-warm'
      default: return 'bg-muted'
    }
  }

  const toggleComments = (postId: string) => {
    setOpenComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 max-w-2xl">
        <div className="space-y-6">
          {/* Feed Header */}
          <div className="text-center py-6 animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">Latest Tea</h1>
            <p className="text-muted-foreground">Fresh gossip, hot takes, and spicy reviews</p>
            {/* Debug Info */}
            <div className="mt-4 p-4 bg-muted rounded-lg text-left text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Posts Count: {posts.length}</p>
              <p>Check browser console for detailed logs</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading posts...</p>
            </div>
          )}

          {/* Posts */}
          {!loading && (
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">☕</div>
                  <h3 className="text-lg font-semibold mb-2">No tea yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to spill some tea in this room!
                  </p>
                </div>
              ) : (
                posts.map((post, index) => (
              <Card 
                key={post.id} 
                className="tea-card animate-slide-in-right"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`${getCategoryColor(post.category)} text-white font-semibold`}>
                          {post.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm">{post.alias}</h3>
                        <p className="text-xs text-muted-foreground">@{post.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UiBadge variant="secondary" className="text-xs">
                        {post.category}
                      </UiBadge>
                      {currentUser && post.authorId && currentUser.id === post.authorId ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => handleDelete(post.id)}
                          aria-label="Delete post"
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-muted-foreground"
                          aria-label="Delete post (disabled)"
                          title="Only the author can delete this post"
                          disabled
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-0">
                  <div className="space-y-3">
                    {post.isVoiceNote && (
                      <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                        <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-accent rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-accent-foreground rounded-full" />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">1:23</span>
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {post.duration === 'permanent' ? (
                          <Flame className="h-3 w-3 text-orange-500" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        <span>{post.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4">
                  <div className="w-full space-y-3">
                    {/* Reactions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {Object.entries(post.reactions).map(([type, count]) => {
                          const isUserReaction = userReactions[post.id] === type
                          return (
                            <Button
                              key={type}
                              variant={isUserReaction ? "default" : "ghost"}
                              size="sm"
                              onClick={() => handleReaction(post.id, type as keyof Post['reactions'])}
                              className={`flex items-center space-x-1 hover-scale transition-smooth p-2 rounded-full ${
                                isUserReaction ? 'bg-primary text-primary-foreground shadow-glow' : ''
                              }`}
                            >
                              <span className="text-base">{getReactionIcon(type)}</span>
                              <span className="text-xs font-medium">{count}</span>
                            </Button>
                          )
                        })}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CommentsSection
                          postId={post.id}
                          currentUser={currentUser}
                          isOpen={openComments[post.id] || false}
                          onToggle={() => toggleComments(post.id)}
                        />
                        <Button variant="ghost" size="sm" className="hover-scale">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover-scale">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
                ))
              )}
            </div>
          )}

          {/* Load More */}
          <div className="text-center py-8">
            <Button variant="outline" className="hover-glow">
              Load More Tea
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}