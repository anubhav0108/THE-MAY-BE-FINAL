"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Moon, Sun, LogOut } from "lucide-react";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";

export function AppHeader() {
  const { setTheme, theme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const { searchTerm, setSearchTerm, notificationHistory, setNotificationHistory, currentUser, setIsAuthenticated, setTimetableResult } = useContext(DataContext);
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTimetableResult(null); // Clear timetable from React state on logout
    
    // Selectively remove user-specific items instead of clearing everything
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };
  
  const handleSettings = () => {
    router.push('/settings');
  };

  const handleSupport = () => {
    router.push('/support');
  };

  const handleNotificationOpen = (open: boolean) => {
    // When the dropdown is closed, clear the notifications.
    if (!open) {
      // Use a timeout to allow the fade-out animation to complete before clearing.
      setTimeout(() => setNotificationHistory([]), 200);
    }
  }

  return (
    <header 
      className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b backdrop-blur-sm px-4 sm:px-6"
      style={{
        background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9))',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.5)'
      }}
    >
      <SidebarTrigger className="sm:hidden text-slate-300 hover:text-white" />
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 pl-8 md:w-[200px] lg:w-[320px] focus:border-purple-500/50 focus:ring-purple-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <DropdownMenu onOpenChange={handleNotificationOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full relative text-slate-300 hover:text-white hover:bg-slate-800/50">
            <Bell className="h-5 w-5" />
            {notificationHistory.length > 0 && (
                <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-purple-500 ring-2 ring-slate-900" />
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[350px] bg-slate-800/95 border-slate-700/50 backdrop-blur-sm">
          <DropdownMenuLabel className="text-white">Recent Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700/50" />
          {notificationHistory.length > 0 ? (
            notificationHistory.map((notification, index) => (
              <DropdownMenuItem key={index} className="flex items-start gap-3 cursor-pointer notification-item text-slate-300 hover:text-white hover:bg-slate-700/50">
                <notification.icon className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{notification.title}</p>
                  <p className="text-xs text-slate-400">{notification.description}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-4 text-sm text-slate-400 text-center">No new notifications</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full border-slate-700/50 hover:border-purple-500/50">
            <Avatar>
              <AvatarFallback className="bg-purple-500/20 text-purple-300 border border-purple-500/30">{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800/95 border-slate-700/50 backdrop-blur-sm">
          <DropdownMenuLabel className="text-white">{currentUser.name}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700/50" />
          <DropdownMenuItem onClick={handleSettings} className="text-slate-300 hover:text-white hover:bg-slate-700/50">Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleSupport} className="text-slate-300 hover:text-white hover:bg-slate-700/50">Support</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700/50" />
          <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
