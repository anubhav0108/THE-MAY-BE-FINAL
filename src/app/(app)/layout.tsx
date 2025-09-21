"use client";
import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { AppSidebarNav } from "@/components/layout/sidebar-nav";
import { AppHeader } from "@/components/layout/app-header";
import { Chatbot } from "@/components/chatbot";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookUser, Briefcase, DraftingCompass, BellRing, CircleDollarSign, CalendarCheck, Lightbulb, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataContext, DataProvider, Notification } from "@/context/data-context";
import { ClientOnly } from '@/components/client-only';
import { useEffect, useState, useContext, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseTemplate {
  icons: any[];
  titles: string[];
}

interface InternshipTemplate extends BaseTemplate {
  companies: string[];
  roles: string[];
}

interface WorkshopTemplate extends BaseTemplate {
  topics: string[];
}

interface AnnouncementTemplate extends BaseTemplate {
  events: string[];
}

interface DeadlineTemplate extends BaseTemplate {
  tasks: string[];
}

interface NotificationTemplates {
  internships: InternshipTemplate;
  workshops: WorkshopTemplate;
  announcements: AnnouncementTemplate;
  deadlines: DeadlineTemplate;
}

const notificationTemplates: NotificationTemplates = {
  internships: {
    icons: [Briefcase, Award],
    titles: ["New Internship Opportunity", "Hiring Alert: Summer Interns", "Exclusive Internship Role"],
    companies: ["Innovate Inc.", "QuantumLeap", "CodeGenius", "Future Systems", "DataWise"],
    roles: ["Software Engineer Intern", "Data Analyst Intern", "UX/UI Design Intern", "Project Manager Intern"],
  },
  workshops: {
    icons: [DraftingCompass, Lightbulb],
    titles: ["Skill-Up Workshop", "Expert Session", "Hands-On Workshop"],
    topics: ["Advanced React Patterns", "Machine Learning Basics", "Public Speaking", "UI Component Design", "Ethical Hacking"],
  },
  announcements: {
    icons: [BellRing, CalendarCheck],
    titles: ["Campus Announcement", "Upcoming Event", "Mark Your Calendar"],
    events: ["Tech Fest 'Innovate 2025'", "Annual Sports Meet", "Cultural Night 'Spectrum'", "Alumni Homecoming"],
  },
  deadlines: {
    icons: [CircleDollarSign, CalendarCheck],
    titles: ["Fee Payment Reminder", "Submission Deadline", "Important Deadline"],
    tasks: ["Semester Fee Payment", "Project Synopsis Submission", "Scholarship Application"],
  }
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomNotification(): Notification {
  const categories = Object.keys(notificationTemplates) as Array<keyof NotificationTemplates>;
  const randomCategory = getRandomElement(categories);
  const template = notificationTemplates[randomCategory];
  
  const icon = getRandomElement(template.icons);
  const title = getRandomElement(template.titles);
  const notificationDate = new Date();
  notificationDate.setDate(notificationDate.getDate() + Math.floor(Math.random() * 30));
  const formattedDate = notificationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  let description = "";

  switch(randomCategory) {
    case 'internships': {
      const internTemplate = template as InternshipTemplate;
      const company = getRandomElement(internTemplate.companies);
      const role = getRandomElement(internTemplate.roles);
      description = `New positions for ${role} are open at ${company}. Apply by ${formattedDate}!`;
      break;
    }
    case 'workshops': {
      const workshopTemplate = template as WorkshopTemplate;
      const topic = getRandomElement(workshopTemplate.topics);
      description = `Join the workshop on ${topic} this coming week. Limited seats available.`;
      break;
    }
    case 'announcements': {
      const announceTemplate = template as AnnouncementTemplate;
      const event = getRandomElement(announceTemplate.events);
      description = `${event} is scheduled for next month. Registrations open soon.`;
      break;
    }
    case 'deadlines': {
      const deadlineTemplate = template as DeadlineTemplate;
      const task = getRandomElement(deadlineTemplate.tasks);
      description = `The deadline for ${task} is ${formattedDate}. Please complete it on time.`;
      break;
    }
  }

  return { icon, title, description, date: new Date() };
}

function NotificationHandler() {
  const { toast } = useToast();
  const { setNotificationHistory } = useContext(DataContext);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const interval = setInterval(() => {
      const randomNotification = generateRandomNotification();

      toast({
        title: randomNotification.title,
        description: (
          <div className="flex items-center gap-2">
            <randomNotification.icon className="h-5 w-5 text-primary" />
            <span>{randomNotification.description}</span>
          </div>
        ),
      });
      
      setNotificationHistory(prevHistory => [randomNotification, ...prevHistory].slice(0, 5));

    }, 20000);

    return () => clearInterval(interval);
  }, [hasMounted, toast, setNotificationHistory]);

  return null;
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { currentUser, initializeUserSession } = useContext(DataContext);
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const { theme } = useTheme();

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    // This effect now correctly handles the auth flow on initial load.
    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem('isAuthenticated') === 'true';
            if (!authStatus) {
                router.replace('/login');
            } else {
                initializeUserSession();
                setIsCheckingAuth(false);
            }
        };
        checkAuth();
    }, [router, initializeUserSession]);

    
    if (isCheckingAuth) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <SidebarProvider>
              <div className="flex h-screen w-full">
                <Sidebar
                  variant="inset"
                  className="group"
                >
                  <div className="flex h-full flex-col shadow-sm">
                    <SidebarHeader className="p-4 flex items-center gap-2 border-b border-slate-700/50">
                      <Button variant="ghost" size="icon" className="text-purple-400 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30">
                        <BookUser className="h-6 w-6" />
                      </Button>
                      <div className="group-data-[collapsible=icon]:hidden">
                        <h1 className="font-headline text-lg font-semibold text-white">Timetable Ace</h1>
                      </div>
                    </SidebarHeader>
                    <SidebarContent className="p-2">
                      <AppSidebarNav />
                    </SidebarContent>
                    <SidebarFooter className="p-4 border-t border-slate-700/50">
                       <div className="flex items-center gap-3">
                         <Avatar className="h-8 w-8 border border-purple-500/30">
                            <AvatarFallback className="bg-purple-500/20 text-purple-300">{getInitials(currentUser.name)}</AvatarFallback>
                         </Avatar>
                         <div className="group-data-[collapsible=icon]:hidden">
                            <p className="text-sm font-medium leading-none text-white">{currentUser.name}</p>
                            <p className="text-xs text-slate-400">{currentUser.email}</p>
                         </div>
                       </div>
                    </SidebarFooter>
                  </div>
                </Sidebar>
                <div className="flex flex-col flex-1 min-w-0">
                  <AppHeader />
                  <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="relative z-10">
                      {children}
                    </div>
                  </main>
                  <Chatbot />
                </div>
              </div>
            </SidebarProvider>
    );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnly>
      <DataProvider>
        <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
            <NotificationHandler />
            <AppLayoutContent>{children}</AppLayoutContent>
            <Toaster />
        </ThemeProvider>
      </DataProvider>
    </ClientOnly>
  );
}
