'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/context/data-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ClientOnly } from '@/components/client-only';
import type { UserRole } from '@/context/data-context';
import problemStatementData from '@/lib/problem-statement.json';
import LiveClock from '@/components/live-clock';
import { motion } from 'framer-motion';
import { ThemeProvider } from 'next-themes';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setIsAuthenticated, setUserRole, setCurrentUser } = useContext(DataContext);
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please enter your name.',
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please enter a valid email address.',
      });
      return;
    }
    
    if (password.length < 1) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Password cannot be empty.',
        });
        return;
    }

    toast({
      title: 'Login Successful',
      description: `Welcome, ${name}! Redirecting to dashboard...`,
    });
    
    setCurrentUser({
      name,
      email,
    });
    setUserRole(activeRole);
    setIsAuthenticated(true);
    
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', activeRole);
    localStorage.setItem('currentUser', JSON.stringify({ name, email }));
    
    router.push('/dashboard');
  };

  return (
    <ClientOnly>
      <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
        <div className="min-h-screen w-full font-body text-white animated-bg">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-10 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 30, 0], rotate: [360, 180, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-10 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 right-20 w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full opacity-10 blur-3xl"
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen p-4">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2 lg:w-2/5 space-y-8 md:pr-12 text-center md:text-left"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h1 className="text-5xl lg:text-7xl font-bold font-headline tracking-tighter neon-text">
                      Timetable Ace
                    </h1>
                  </motion.div>
                  
                    <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-slate-300 text-lg leading-relaxed"
                  >
                    {problemStatementData.problem_statement.title}
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="pt-4"
                  >
                    <LiveClock />
                  </motion.div>

                  {/* Feature highlights */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="space-y-3 pt-6"
                  >
                    <div className="flex items-center space-x-3 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>AI-Powered Timetable Generation</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                      <span>NEP 2020 Compliant</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                      <span>Multi-Role Access Control</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full md:w-1/2 lg:w-2/5 mt-8 md:mt-0"
              >
                <Card className="glass-card border-purple-500/30 shadow-2xl">
                  <CardHeader className="text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <CardTitle className="text-3xl font-bold neon-text mb-2">Welcome Back</CardTitle>
                      <CardDescription className="text-slate-400 text-lg">
                        Sign in to access your personalized dashboard
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="space-y-3"
                      >
                        <Label className="text-white font-semibold">Select Your Role</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            type="button" 
                            variant={activeRole === 'admin' ? 'default' : 'outline'} 
                            onClick={() => setActiveRole('admin')}
                            className={`transition-all duration-300 ${
                              activeRole === 'admin' 
                                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/25' 
                                : 'border-purple-500/50 text-purple-300 hover:bg-purple-500/10'
                            }`}
                          >
                            Admin
                          </Button>
                          <Button 
                            type="button" 
                            variant={activeRole === 'faculty' ? 'default' : 'outline'} 
                            onClick={() => setActiveRole('faculty')}
                            className={`transition-all duration-300 ${
                              activeRole === 'faculty' 
                                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/25' 
                                : 'border-purple-500/50 text-purple-300 hover:bg-purple-500/10'
                            }`}
                          >
                            Faculty
                          </Button>
                          <Button 
                            type="button" 
                            variant={activeRole === 'student' ? 'default' : 'outline'} 
                            onClick={() => setActiveRole('student')}
                            className={`transition-all duration-300 ${
                              activeRole === 'student' 
                                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/25' 
                                : 'border-purple-500/50 text-purple-300 hover:bg-purple-500/10'
                            }`}
                          >
                            Student
                          </Button>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="name" className="text-white font-semibold">Full Name</Label>
                        <Input 
                          id="name" 
                          type="text" 
                          placeholder="e.g., Amritanshu Kumar" 
                          required 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          autoComplete="name" 
                          className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="email" className="text-white font-semibold">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Enter your institutional email" 
                          required 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          autoComplete="username" 
                          className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="password" className="text-white font-semibold">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="Enter your password" 
                          required 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          autoComplete="current-password" 
                          className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember-me" className="border-purple-500 data-[state=checked]:bg-purple-500"/>
                          <Label htmlFor="remember-me" className="text-sm font-normal text-slate-300">Remember me</Label>
                        </div>
                        <Link href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300">Forgot Password?</Link>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.1 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full text-lg py-6 font-bold glow-button"
                        >
                          <Lock className="mr-2 h-5 w-5"/>
                          Secure Sign In
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
          </div>

          <motion.footer 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="fixed bottom-4 left-0 right-0 text-center text-xs text-slate-400 z-10"
          >
            <p className="mb-1">© 2025 Government of Jammu & Kashmir. All rights reserved.</p>
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3 text-purple-400"/> 
              <span className="text-purple-300">NEP 2020 Compliant Academic Scheduler</span>
            </p>
          </motion.footer>
        </div>
      </ThemeProvider>
    </ClientOnly>
  );
}
