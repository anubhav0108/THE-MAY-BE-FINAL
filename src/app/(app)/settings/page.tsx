"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function SettingsPage() {
    const { toast } = useToast();

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated.",
        });
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your application preferences and settings.
                    </p>
                </div>
                <Button size="lg" onClick={handleSaveChanges}>
                    <Save className="mr-2 h-5 w-5" />
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                        Configure how you want to receive notifications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="notifications">Enable Notifications</Label>
                            <Switch id="notifications" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
