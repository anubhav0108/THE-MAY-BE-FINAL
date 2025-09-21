'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  Wand2, 
  Brain,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import problemStatementData from '@/lib/problem-statement.json';

export default function TimetableAceLanding() {
  useEffect(() => {
    // Force dark mode for the entire website
    document.documentElement.classList.add('dark');
    
    // Smooth scrolling for anchor links
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash) {
        e.preventDefault();
        const element = document.querySelector(target.hash);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    };

    // Add event listeners to all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });

    return () => {
      anchorLinks.forEach(link => {
        link.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Advanced algorithms create conflict-free timetables automatically, considering all constraints and preferences.',
    },
    {
      icon: Calendar,
      title: 'NEP 2020 Compliant',
      description: 'Fully aligned with National Education Policy 2020 requirements for multidisciplinary education structures.',
    },
    {
      icon: Users,
      title: 'Multi-Role Support',
      description: 'Seamless experience for administrators, faculty, and students with role-based access and features.',
    },
    {
      icon: ShieldCheck,
      title: 'Smart Constraints',
      description: 'Handle complex scheduling constraints including faculty availability, room capacity, and program requirements.',
    },
    {
      icon: Wand2,
      title: 'Real-time Simulation',
      description: 'Test different scenarios and constraints before implementing changes to your actual timetable.',
    },
    {
      icon: Clock,
      title: 'Instant Updates',
      description: 'Dynamic editing capabilities with instant conflict detection and resolution suggestions.',
    },
  ];

  const benefits = [
    'Eliminates manual scheduling conflicts',
    'Reduces administrative workload by 80%',
    'Optimizes resource utilization',
    'Supports flexible credit-based programs',
    'Handles complex multidisciplinary structures',
    'Provides exportable formats (PDF, Excel)',
  ];

  return (
    <div className="min-h-screen animated-bg">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 nav-blur"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <h1 className="text-2xl font-bold neon-text">
                Timetable Ace
              </h1>
            </motion.div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group">
                  Features
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group">
                  About
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <Link href="/login">
                  <Button className="glow-button">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20 blur-xl"
          />
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 right-20 w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full opacity-20 blur-xl"
          />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <Badge variant="secondary" className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              NEP 2020 Compliant
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-6"
          >
            <span className="block text-white mb-2">AI-Powered</span>
            <span className="neon-text typing-animation">
              Timetable Generator
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            {problemStatementData.problem_statement.title}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="glow-button text-lg px-8 py-4">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Start Generating
                </Button>
              </motion.div>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="neon-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to create perfect timetables for modern educational institutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                }}
                className="glass-card p-8 neon-hover group cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-4xl mb-4 group-hover:drop-shadow-lg"
                >
                  <feature.icon className="h-12 w-12 text-purple-400" />
                </motion.div>

                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                  {feature.description}
                </p>

                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  className="h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 mt-4 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="neon-text">Why Choose Timetable Ace?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Our AI-powered system revolutionizes timetable generation for educational institutions, 
                making complex scheduling simple and efficient.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-8"
            >
              <Card className="bg-transparent border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">
                    Ready to Transform Your Scheduling?
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Join educational institutions already using Timetable Ace to streamline their operations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="text-3xl font-bold text-purple-400">500+</div>
                      <div className="text-sm text-gray-300">Institutions</div>
                    </div>
                    <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                      <div className="text-3xl font-bold text-cyan-400">50K+</div>
                      <div className="text-sm text-gray-300">Students Served</div>
                    </div>
                  </div>
                  
                  <Link href="/login">
                    <Button className="w-full glow-button">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Get Started Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-t from-slate-900 to-transparent border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold neon-text mb-4">
                Timetable Ace
              </h3>
              <p className="text-gray-300 mb-6">
                AI-Powered Timetable Generation for Modern Education
              </p>
              <div className="flex items-center justify-center space-x-6">
                <span className="text-gray-400 text-sm">Made with</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-red-500 text-lg"
                >
                  ❤️
                </motion.span>
                <span className="text-gray-400 text-sm">for Education</span>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                © 2025 Government of Jammu & Kashmir. All rights reserved.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
