'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { slideInFromLeft } from '@/lib/animations'
import { useSession } from '@/lib/auth'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Trash2,
  Mail,
  Shield,
  Moon,
  Save,
  Smartphone,
  Globe,
  RefreshCw
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    marketingEmails: true,
    securityAlerts: true,
    compactMode: false
  })
  const [themeColor, setThemeColor] = useState('blue')
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    preferences: false
  })

  // ✅ FIX: Use useMemo to prevent infinite loop
  const userName = useMemo(() => session?.user?.name || '', [session?.user?.name])
  const userEmail = useMemo(() => session?.user?.email || '', [session?.user?.email])

  // ✅ FIX: Load user data only once with proper dependencies
  useEffect(() => {
    if (userName || userEmail) {
      setProfileData({
        name: userName,
        email: userEmail
      })
    }
  }, [userName, userEmail])

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!session?.user) return

    setLoading(prev => ({ ...prev, profile: true }))
    try {
      await api.updateUserProfile({
        name: profileData.name,
        email: profileData.email
      })

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
  }

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!session?.user) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setLoading(prev => ({ ...prev, password: true }))
    try {
      await api.updateUserPassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      toast.success('Password updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(prev => ({ ...prev, password: false }))
    }
  }

  // Handle preferences update
  const handlePreferencesUpdate = async () => {
    if (!session?.user) return

    setLoading(prev => ({ ...prev, preferences: true }))
    try {
      await api.updateUserPreferences({
        notifications: preferences.notifications,
        theme: preferences.darkMode ? 'dark' : 'light',
        themeColor: themeColor,
        marketingEmails: preferences.marketingEmails,
        securityAlerts: preferences.securityAlerts,
        compactMode: preferences.compactMode
      })

      toast.success('Preferences updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update preferences')
    } finally {
      setLoading(prev => ({ ...prev, preferences: false }))
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!session?.user || !confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      await api.deleteUserAccount()
      toast.success('Account deleted successfully')
      window.location.href = '/sign-up'
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account')
    }
  }

  // Reset form data
  const resetProfileData = () => {
    setProfileData({
      name: userName,
      email: userEmail
    })
    toast.success('Profile form reset')
  }

  // Reset password form
  const resetPasswordData = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    toast.success('Password form reset')
  }

  // Reset preferences
  const resetPreferences = () => {
    setPreferences({
      notifications: true,
      darkMode: false,
      marketingEmails: true,
      securityAlerts: true,
      compactMode: false
    })
    setThemeColor('blue')
    toast.success('Preferences reset')
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideInFromLeft}
      className="p-4 md:p-6 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      {/* Mobile Tabs - Top */}
      <div className="lg:hidden mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="profile" className="flex flex-col items-center gap-1 p-2">
              <User className="h-4 w-4" />
              <span className="text-xs">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col items-center gap-1 p-2">
              <Bell className="h-4 w-4" />
              <span className="text-xs">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex flex-col items-center gap-1 p-2">
              <Palette className="h-4 w-4" />
              <span className="text-xs">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex flex-col items-center gap-1 p-2">
              <Lock className="h-4 w-4" />
              <span className="text-xs">Security</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex flex-col items-center gap-1 p-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              <span className="text-xs">Danger</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <Button
                  variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                  className="w-full justify-start rounded-none h-12 px-4"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                  {activeTab === 'profile' && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
                
                <Button
                  variant={activeTab === 'notifications' ? 'secondary' : 'ghost'}
                  className="w-full justify-start rounded-none h-12 px-4"
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="mr-3 h-4 w-4" />
                  Notifications
                  {activeTab === 'notifications' && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
                
                <Button
                  variant={activeTab === 'appearance' ? 'secondary' : 'ghost'}
                  className="w-full justify-start rounded-none h-12 px-4"
                  onClick={() => setActiveTab('appearance')}
                >
                  <Palette className="mr-3 h-4 w-4" />
                  Appearance
                  {activeTab === 'appearance' && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
                
                <Button
                  variant={activeTab === 'security' ? 'secondary' : 'ghost'}
                  className="w-full justify-start rounded-none h-12 px-4"
                  onClick={() => setActiveTab('security')}
                >
                  <Lock className="mr-3 h-4 w-4" />
                  Security
                  {activeTab === 'security' && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
                
                <Separator className="my-2" />
                
                <Button
                  variant={activeTab === 'danger' ? 'secondary' : 'ghost'}
                  className="w-full justify-start rounded-none h-12 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setActiveTab('danger')}
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  Danger Zone
                  {activeTab === 'danger' && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-red-600" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Section - Only shows active tab */}
        <div className="flex-1">
          {/* PROFILE SECTION */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <User className="h-6 w-6" />
                        Profile Information
                      </CardTitle>
                      <CardDescription>Update your personal information</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetProfileData}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">Full Name</Label>
                      <AnimatedInput
                        id="name"
                        placeholder="Enter your full name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="text-lg py-6"
                      />
                      <p className="text-sm text-muted-foreground">This is your display name</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Address
                      </Label>
                      <AnimatedInput
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="text-lg py-6"
                        disabled
                      />
                      <p className="text-sm text-muted-foreground">Email cannot be changed once set</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={loading.profile}
                      className="gap-2 px-6 py-6 text-lg"
                      size="lg"
                    >
                      <Save className="h-5 w-5" />
                      {loading.profile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Bell className="h-6 w-6" />
                        Notifications
                      </CardTitle>
                      <CardDescription>Configure how you receive notifications</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPreferences}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <Label htmlFor="email-notifications" className="font-medium text-base">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={preferences.notifications}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notifications: checked }))}
                        className="scale-125"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <Label htmlFor="marketing-emails" className="font-medium text-base">
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive promotional emails and offers</p>
                      </div>
                      <Switch
                        id="marketing-emails"
                        checked={preferences.marketingEmails}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketingEmails: checked }))}
                        className="scale-125"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <Label htmlFor="security-alerts" className="font-medium text-base">
                          Security Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive security and login alerts</p>
                      </div>
                      <Switch
                        id="security-alerts"
                        checked={preferences.securityAlerts}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, securityAlerts: checked }))}
                        className="scale-125"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handlePreferencesUpdate}
                    disabled={loading.preferences}
                    className="gap-2 px-6 py-6 text-lg w-full md:w-auto"
                    size="lg"
                  >
                    <Save className="h-5 w-5" />
                    {loading.preferences ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* APPEARANCE SECTION */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Palette className="h-6 w-6" />
                        Appearance
                      </CardTitle>
                      <CardDescription>Customize how the application looks</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPreferences}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <Label htmlFor="dark-mode" className="font-medium text-base flex items-center gap-2">
                          <Moon className="h-5 w-5" />
                          Dark Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">Use dark theme across the application</p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={preferences.darkMode}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, darkMode: checked }))}
                        className="scale-125"
                      />
                    </div>

                    <div className="space-y-3 p-4 border rounded-lg">
                      <Label className="font-medium text-base">Theme Color</Label>
                      <p className="text-sm text-muted-foreground mb-3">Choose your primary theme color</p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { name: 'Blue', value: 'blue', bg: 'bg-blue-500' },
                          { name: 'Purple', value: 'purple', bg: 'bg-purple-500' },
                          { name: 'Green', value: 'green', bg: 'bg-green-500' },
                          { name: 'Red', value: 'red', bg: 'bg-red-500' },
                          { name: 'Orange', value: 'orange', bg: 'bg-orange-500' },
                          { name: 'Pink', value: 'pink', bg: 'bg-pink-500' }
                        ].map((color) => (
                          <button
                            key={color.value}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary transition-all ${themeColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                            onClick={() => setThemeColor(color.value)}
                          >
                            <div className={`w-10 h-10 rounded-full ${color.bg}`} />
                            <span className="text-sm font-medium">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <Label className="font-medium text-base flex items-center gap-2">
                          <Smartphone className="h-5 w-5" />
                          Compact Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">Use compact layout for smaller screens</p>
                      </div>
                      <Switch
                        checked={preferences.compactMode}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, compactMode: checked }))}
                        className="scale-125"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handlePreferencesUpdate}
                    disabled={loading.preferences}
                    className="gap-2 px-6 py-6 text-lg w-full md:w-auto"
                    size="lg"
                  >
                    <Save className="h-5 w-5" />
                    {loading.preferences ? 'Saving...' : 'Save Appearance Settings'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* SECURITY SECTION */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Lock className="h-6 w-6" />
                        Security
                      </CardTitle>
                      <CardDescription>Manage your password and security settings</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPasswordData}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="current-password" className="font-medium text-base">
                        Current Password
                      </Label>
                      <AnimatedInput
                        id="current-password"
                        type="password"
                        placeholder="Enter your current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="py-6 text-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="new-password" className="font-medium text-base">
                        New Password
                      </Label>
                      <AnimatedInput
                        id="new-password"
                        type="password"
                        placeholder="Enter your new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="py-6 text-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        Password must be at least 8 characters long with uppercase, lowercase, and numbers
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirm-password" className="font-medium text-base">
                        Confirm New Password
                      </Label>
                      <AnimatedInput
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="py-6 text-lg"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={loading.password || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="gap-2 px-6 py-6 text-lg w-full md:w-auto"
                    size="lg"
                  >
                    <Save className="h-5 w-5" />
                    {loading.password ? 'Updating...' : 'Update Password'}
                  </Button>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="font-medium text-base flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline" className="w-full gap-2 py-6">
                        <Lock className="h-5 w-5" />
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-medium text-base flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Active Sessions
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Manage your active login sessions
                      </p>
                      <Button variant="outline" className="w-full gap-2 py-6">
                        View Active Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* DANGER ZONE SECTION */}
          {activeTab === 'danger' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl text-red-600">
                    <Trash2 className="h-6 w-6" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-red-600/80">
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-6 border-2 border-red-200 rounded-xl bg-red-50/50">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-bold text-lg text-red-700">
                            Delete Account
                          </Label>
                          <p className="text-red-600/80">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <ul className="text-red-600/80 list-disc pl-5 space-y-2 mt-3">
                            <li>All your data will be permanently deleted</li>
                            <li>This action cannot be reversed</li>
                            <li>You will lose access to all features</li>
                            <li>Any active subscriptions will be cancelled</li>
                            <li>All your files and content will be removed</li>
                          </ul>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={loading.profile || loading.password || loading.preferences}
                            className="gap-2 px-6 py-6 text-lg flex-1"
                            size="lg"
                          >
                            <Trash2 className="h-5 w-5" />
                            Delete My Account
                          </Button>
                          <Button variant="outline" className="gap-2 px-6 py-6 text-lg flex-1">
                            <Save className="h-5 w-5" />
                            Export All Data
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <Label className="font-medium">Account Recovery</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Set up account recovery options
                      </p>
                      <Button variant="outline" className="w-full gap-2">
                        Set Up Recovery Options
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}