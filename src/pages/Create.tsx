import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createPost, getRooms } from "@/lib/api"
import { ArrowLeft, Mic, Image, Clock, Globe, Calendar, Hash, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

// Categories will be loaded from the API

const durations = [
  { label: "24 Hours", value: "24h", description: "Perfect for hot takes" },
  { label: "7 Days", value: "7d", description: "Standard gossip duration" },
  { label: "Permanent", value: "permanent", description: "Forever in the archives" },
]

export default function Create() {
  const [content, setContent] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("24h")
  const [isRecording, setIsRecording] = useState(false)
  const [postType, setPostType] = useState<"text" | "voice">("text")
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Load current user and rooms on component mount
  React.useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        if (parsed?.id) {
          setCurrentUser(parsed)
        } else {
          navigate('/auth')
        }
      } catch (error) {
        console.error('Failed to parse user data:', error)
        navigate('/auth')
      }
    } else {
      navigate('/auth')
    }
  }, [navigate])

  React.useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await getRooms()
        setRooms(roomsData)
      } catch (error) {
        console.error('Failed to load rooms:', error)
        toast({
          title: "Error",
          description: "Failed to load rooms. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadRooms()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !selectedRoom) {
      toast({
        title: "Missing Information",
        description: "Please add content and select a room to spill your tea!",
        variant: "destructive",
      })
      return
    }

    try {
      // Find the selected room
      const selectedRoomData = rooms.find(room => room.id === selectedRoom)
      if (!selectedRoomData) {
        throw new Error("Selected room not found")
      }

      // Create the post
      await createPost({
        title: `${selectedRoomData.name} - ${postType === 'voice' ? 'Voice Note' : 'Text Post'}`,
        content: content.trim(),
        roomId: selectedRoom,
        category: selectedRoomData.name,
        duration: selectedDuration,
        isVoiceNote: postType === 'voice'
      })

      toast({
        title: "Tea Spilled! ☕",
        description: "Your anonymous post is now live. Time to watch the reactions roll in!",
      })
      
      navigate('/feed')
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Spill your tea! Tap again when you're done.",
      })
    } else {
      setContent("Voice note recorded (1:23)")
      toast({
        title: "Recording Saved",
        description: "Your voice note is ready to be spilled!",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            Spill the Tea
          </h1>
          <div /> {/* Spacer */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <Card className="tea-card animate-slide-in-right">
            <CardHeader>
              <CardTitle className="text-lg">What's brewing?</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={postType} onValueChange={(value) => setPostType(value as "text" | "voice")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>Text Post</span>
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center space-x-2">
                    <Mic className="h-4 w-4" />
                    <span>Voice Note</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4">
                  <Textarea
                    placeholder="Spill your tea here... What's the latest gossip, hot take, or review you're dying to share anonymously?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>Be spicy, but stay respectful ✨</span>
                    <span>{content.length}/500</span>
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="mt-4">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
                    <Button
                      type="button"
                      onClick={toggleRecording}
                      className={`w-20 h-20 rounded-full ${
                        isRecording 
                          ? "bg-destructive hover:bg-destructive/90 animate-pulse-glow" 
                          : "gradient-primary hover-glow"
                      } transition-smooth`}
                    >
                      <Mic className={`h-8 w-8 ${isRecording ? "text-white" : "text-primary-foreground"}`} />
                    </Button>
                    <p className="mt-4 text-center text-muted-foreground">
                      {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
                    </p>
                    {content.includes("Voice note") && (
                      <div className="mt-4 p-3 bg-muted rounded-lg flex items-center space-x-2">
                        <div className="w-6 h-6 gradient-accent rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                        <span className="text-sm">Voice note ready (1:23)</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Room Selection */}
          <Card className="tea-card animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Choose Your Room</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading rooms...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {rooms.map((room) => (
                    <Button
                      key={room.id}
                      type="button"
                      variant={selectedRoom === room.id ? "default" : "outline"}
                      className={`h-auto p-4 justify-start ${
                        selectedRoom === room.id 
                          ? `${room.gradient} text-white shadow-glow` 
                          : "hover-lift"
                      }`}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{room.icon}</span>
                        <span className="font-medium">{room.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Duration Selection */}
          <Card className="tea-card animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>How Long Should This Live?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {durations.map((duration) => (
                  <Button
                    key={duration.value}
                    type="button"
                    variant={selectedDuration === duration.value ? "default" : "outline"}
                    className={`w-full justify-between h-auto py-4 ${
                      selectedDuration === duration.value 
                        ? "gradient-accent text-white shadow-glow" 
                        : "hover-lift"
                    }`}
                    onClick={() => setSelectedDuration(duration.value)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{duration.label}</div>
                      <div className="text-sm opacity-80">{duration.description}</div>
                    </div>
                    {duration.value === 'permanent' && <Globe className="h-5 w-5" />}
                    {duration.value !== 'permanent' && <Calendar className="h-5 w-5" />}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button 
              type="submit" 
              size="lg"
              className="spill-button px-12 py-4 text-lg font-semibold animate-bounce-subtle"
              disabled={!content.trim() || !selectedRoom}
            >
              <Coffee className="h-5 w-5 mr-3" />
              Spill This Tea
            </Button>
          </div>
        </form>

        {/* Tips */}
        <Card className="tea-card mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-accent">Pro Tips for Better Tea ☕</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Be specific but protect identities - no real names!</li>
              <li>• Spicy takes get more engagement than mild ones</li>
              <li>• Voice notes feel more authentic and personal</li>
              <li>• Campus Tea and Celeb Gossip rooms are most active</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}