import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bell, Moon, Sun, Volume2, Globe, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  // Settings State
  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      paymentAlerts: true,
      staffActions: true,
      soundEnabled: true,
    },
    display: {
      theme: 'light',
      language: 'en',
      compactMode: false,
    },
    preferences: {
      autoRefresh: true,
      refreshInterval: '30',
      showTips: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);

    try {
      // TODO: Implement API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been saved successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Customize your experience and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Updates */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order-updates" className="text-sm font-medium">
                  Order Updates
                </Label>
                <p className="text-muted-foreground text-xs">
                  Get notified about new and updated orders
                </p>
              </div>
              <Switch
                id="order-updates"
                checked={settings.notifications.orderUpdates}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, orderUpdates: checked },
                  })
                }
              />
            </div>

            <Separator />

            {/* Payment Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-alerts" className="text-sm font-medium">
                  Payment Alerts
                </Label>
                <p className="text-muted-foreground text-xs">
                  Receive alerts for payment transactions
                </p>
              </div>
              <Switch
                id="payment-alerts"
                checked={settings.notifications.paymentAlerts}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, paymentAlerts: checked },
                  })
                }
              />
            </div>

            <Separator />

            {/* Staff Actions */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="staff-actions" className="text-sm font-medium">
                  Staff Actions
                </Label>
                <p className="text-muted-foreground text-xs">
                  Notifications for staff call and bill requests
                </p>
              </div>
              <Switch
                id="staff-actions"
                checked={settings.notifications.staffActions}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, staffActions: checked },
                  })
                }
              />
            </div>

            <Separator />

            {/* Sound Enabled */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled" className="text-sm font-medium">
                  <Volume2 className="mr-1 inline-block h-4 w-4" />
                  Sound Notifications
                </Label>
                <p className="text-muted-foreground text-xs">Play sound for notifications</p>
              </div>
              <Switch
                id="sound-enabled"
                checked={settings.notifications.soundEnabled}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, soundEnabled: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Display
            </CardTitle>
            <CardDescription>Customize the appearance of your interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme" className="flex items-center gap-2">
                {settings.display.theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                Theme
              </Label>
              <Select
                value={settings.display.theme}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, theme: value },
                  })
                }
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">Choose your preferred color theme</p>
            </div>

            <Separator />

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </Label>
              <Select
                value={settings.display.language}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, language: value },
                  })
                }
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">Select your preferred language</p>
            </div>

            <Separator />

            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode" className="text-sm font-medium">
                  Compact Mode
                </Label>
                <p className="text-muted-foreground text-xs">
                  Use a more condensed layout to see more content
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={settings.display.compactMode}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, compactMode: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Configure your workspace preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Auto Refresh */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh" className="text-sm font-medium">
                    Auto Refresh
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Automatically refresh data in real-time
                  </p>
                </div>
                <Switch
                  id="auto-refresh"
                  checked={settings.preferences.autoRefresh}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, autoRefresh: checked },
                    })
                  }
                />
              </div>

              {/* Refresh Interval */}
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval</Label>
                <Select
                  value={settings.preferences.refreshInterval}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, refreshInterval: value },
                    })
                  }
                  disabled={!settings.preferences.autoRefresh}
                >
                  <SelectTrigger id="refresh-interval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  How often to refresh data automatically
                </p>
              </div>

              {/* Show Tips */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-tips" className="text-sm font-medium">
                    Show Tips
                  </Label>
                  <p className="text-muted-foreground text-xs">Display helpful tips and guides</p>
                </div>
                <Switch
                  id="show-tips"
                  checked={settings.preferences.showTips}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, showTips: checked },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
