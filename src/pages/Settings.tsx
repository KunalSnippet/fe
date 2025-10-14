import { useState } from "react"
import { Moon, Sun, Bell, Shield, Clock, Trash2, Download, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { Navbar } from "@/components/layout/navbar"
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
  const [notifications, setNotifications] = useState({
    reactions: true,
    replies: true,
    mentions: false,
    trending: true,
    digest: false
  })
  
  const [privacy, setPrivacy] = useState({
    showActivity: false,
    allowDMs: false,
    dataCollection: true
  })
  
  const [defaultDuration, setDefaultDuration] = useState("24h")
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "This feature will permanently delete your anonymous profile. Contact support if you need assistance.",
      variant: "destructive",
    })
  }

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Your anonymous data export will be ready in a few minutes. We'll notify you when it's ready.",
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 max-w-2xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Customize your anonymous TeaTok experience
            </p>
          </div>

          {/* Appearance */}
          <Card className="tea-card animate-slide-in-right">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>
                Customize how TeaTok looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground">Choose your preferred theme</div>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="tea-card animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Control what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Reactions on my posts</div>
                    <div className="text-sm text-muted-foreground">Get notified when someone reacts to your tea</div>
                  </div>
                  <Switch 
                    checked={notifications.reactions}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reactions: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Replies to my posts</div>
                    <div className="text-sm text-muted-foreground">When someone responds to your spilled tea</div>
                  </div>
                  <Switch 
                    checked={notifications.replies}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, replies: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Trending posts</div>
                    <div className="text-sm text-muted-foreground">Hot tea from rooms you follow</div>
                  </div>
                  <Switch 
                    checked={notifications.trending}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, trending: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Daily digest</div>
                    <div className="text-sm text-muted-foreground">Summary of the hottest tea each day</div>
                  </div>
                  <Switch 
                    checked={notifications.digest}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, digest: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Safety */}
          <Card className="tea-card animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Safety</span>
              </CardTitle>
              <CardDescription>
                Control your anonymity and safety settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Show activity status</div>
                    <div className="text-sm text-muted-foreground">Let others see when you're active</div>
                  </div>
                  <Switch 
                    checked={privacy.showActivity}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showActivity: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Anonymous data collection</div>
                    <div className="text-sm text-muted-foreground">Help improve TeaTok with anonymous usage data</div>
                  </div>
                  <Switch 
                    checked={privacy.dataCollection}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataCollection: checked }))}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-3">Content Preferences</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Default post duration</label>
                    <Select value={defaultDuration} onValueChange={setDefaultDuration}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Account */}
          <Card className="tea-card animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Data & Account</span>
              </CardTitle>
              <CardDescription>
                Manage your data and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-start space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium text-destructive">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your anonymous profile and all associated data. This action cannot be undone.
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteAccount}
                        className="hover-scale"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="tea-card animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
            <CardContent className="p-6 text-center space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">TeaTok v1.0.0</h3>
                <p className="text-sm text-muted-foreground">
                  The anonymous social playground where you spill, sip, and connect.
                </p>
              </div>
              
              <div className="flex justify-center space-x-4 text-sm">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Button 
              onClick={handleSave}
              className="spill-button px-12 py-3 text-lg"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}