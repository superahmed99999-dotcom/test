import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Globe, User, Shield, Moon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState({
    statusChanges: true,
    newComments: true,
    emailDigest: true
  });

  const updateSettings = trpc.auth.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings saved to your account!");
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    }
  });

  // Initialize from user data
  useEffect(() => {
    if (user) {
      if ((user as any).language) setLanguage((user as any).language);
      if ((user as any).theme) setTheme((user as any).theme);
      if ((user as any).notificationSettings) {
        try {
          const parsed = JSON.parse((user as any).notificationSettings);
          setNotifications(parsed);
        } catch (e) {
          console.error("Failed to parse notification settings", e);
        }
      }
    }
  }, [user]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      language,
      theme,
      notificationSettings: JSON.stringify(notifications)
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500 mt-2">Manage your account preferences and notifications</p>
          </div>
          {authLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing...
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 bg-white shadow-sm font-semibold text-primary">
              <User className="h-5 w-5" /> Account
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
              <Bell className="h-5 w-5" /> Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
              <Globe className="h-5 w-5" /> Appearance
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
              <Shield className="h-5 w-5" /> Privacy & Security
            </Button>
          </div>

          {/* Main Settings Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Language Selection */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Language & Region</CardTitle>
                    <CardDescription>Choose your preferred language for the interface</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Notifications</CardTitle>
                    <CardDescription>Control how you receive updates about your reports</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Issue Status Updates</Label>
                    <p className="text-sm text-slate-500">Receive alerts when your reported issue changes status</p>
                  </div>
                  <Switch 
                    checked={notifications.statusChanges} 
                    onCheckedChange={(val) => setNotifications({...notifications, statusChanges: val})} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Community Comments</Label>
                    <p className="text-sm text-slate-500">Get notified when someone comments on your issue</p>
                  </div>
                  <Switch 
                    checked={notifications.newComments} 
                    onCheckedChange={(val) => setNotifications({...notifications, newComments: val})} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Digest</Label>
                    <p className="text-sm text-slate-500">Weekly summary of civic activities in your area</p>
                  </div>
                  <Switch 
                    checked={notifications.emailDigest} 
                    onCheckedChange={(val) => setNotifications({...notifications, emailDigest: val})} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Theme / Appearance */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Moon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of CivicPulse</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-slate-500">Switch between light and dark interface themes</p>
                  </div>
                  <Switch 
                    checked={theme === "dark"} 
                    onCheckedChange={(val) => setTheme(val ? "dark" : "light")} 
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave} disabled={updateSettings.isPending}>
                {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
