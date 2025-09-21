
"use client";

import { useState, useContext } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { runGenerateTimetable } from "@/app/actions";
import { DataContext } from "@/context/data-context";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TimetableGrid } from "@/components/timetable-grid";
import { Loader2, Wand2, Users, GraduationCap, BookOpen, DoorOpen, ExternalLink, Beaker, AlertCircle, Clock, Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Student } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


const MultiSelect = ({ title, options, selected, onSelectedChange }: { title: string, options: {value: string, label: string}[], selected: string[], onSelectedChange: (value: string[]) => void }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (currentValue: string) => {
      const newSelected = selected.includes(currentValue)
        ? selected.filter(item => item !== currentValue)
        : [...selected, currentValue];
      onSelectedChange(newSelected);
    };
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="truncate">
                        {selected.length > 0 ? `${selected.length} ${title.toLowerCase()} selected` : `All ${title.toLowerCase()}`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
                    <CommandEmpty>No ${title.toLowerCase()} found.</CommandEmpty>
                    <CommandGroup>
                        {options.map((option) => (
                            <CommandItem
                                key={option.value}
                                onSelect={() => handleSelect(option.value)}
                                className="cursor-pointer"
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selected.includes(option.value) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { students, faculty, courses, rooms, timetableResult, setTimetableResult, constraints, scenario, userRole } = useContext(DataContext);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const availablePrograms = [...new Set(courses.map(c => c.program).filter(Boolean))];

  const dataSummary = [
    { title: "Students", count: students.length, icon: Users, link: "/data" },
    { title: "Faculty", count: faculty.length, icon: GraduationCap, link: "/data" },
    { title: "Courses", count: courses.length, icon: BookOpen, link: "/data" },
    { title: "Rooms", count: rooms.length, icon: DoorOpen, link: "/data" },
  ]
  
  const { facultyOnLeave, unavailableRooms, studentPopularity, facultyWorkload } = scenario;
  const isSimulationActive = facultyOnLeave.length > 0 || unavailableRooms.length > 0 || studentPopularity.courseId || facultyWorkload.facultyId;

  // Check if program-specific constraints are active
  const { teachingPractice, fieldWork } = constraints.programSpecific;
  const isProgramConstraintActive = 
    (teachingPractice.program && teachingPractice.day) ||
    (fieldWork.program && fieldWork.startDate && fieldWork.endDate);


  const getSimulationDescription = () => {
    const parts = [];
    if (facultyOnLeave.length > 0) parts.push(`Faculty on leave: ${facultyOnLeave.length}`);
    if (unavailableRooms.length > 0) parts.push(`Unavailable rooms: ${unavailableRooms.length}`);
    if (studentPopularity.courseId) {
        const course = courses.find(c => c.id === studentPopularity.courseId);
        if (course) parts.push(`Forecast: ${course.code} demand +${studentPopularity.increase}%`);
    }
    if (facultyWorkload.facultyId) {
        const fac = faculty.find(f => f.name === facultyWorkload.facultyId);
        if (fac) parts.push(`Forecast: ${fac.name.split(' ')[1]} load to ${facultyWorkload.newWorkload} hrs`);
    }
    return parts.join('. ');
  }

  const getProgramConstraintDescription = () => {
    const parts = [];
    if (teachingPractice.program && teachingPractice.day) {
      parts.push(`Teaching Practice (${teachingPractice.program}) is scheduled every ${teachingPractice.day} from ${teachingPractice.startTime} to ${teachingPractice.endTime}.`);
    }
    if (fieldWork.program && fieldWork.startDate && fieldWork.endDate) {
      parts.push(`${fieldWork.activityType} for ${fieldWork.program} is scheduled from ${format(new Date(fieldWork.startDate), "LLL dd")} to ${format(new Date(fieldWork.endDate), "LLL dd, y")}.`);
    }
    return parts.join(' ');
  }

  async function onGenerate() {
    setIsLoading(true);

    // --- Apply scenario simulations for this generation ---
    let simulatedFaculty = faculty.filter(f => !facultyOnLeave.includes(f.id));
    let simulatedRooms = rooms.filter(r => !unavailableRooms.includes(r.id));
    let simulatedStudents = JSON.parse(JSON.stringify(students)); // Deep copy

    // Forecast: Faculty Workload Change
    if (facultyWorkload.facultyId) {
        simulatedFaculty = simulatedFaculty.map(f =>
            f.name === facultyWorkload.facultyId ? { ...f, workload: facultyWorkload.newWorkload } : f
        );
    }
    
    // Forecast: Elective Popularity
    if (studentPopularity.courseId && studentPopularity.increase > 0) {
        const courseToBoost = courses.find(c => c.id === studentPopularity.courseId);
        if (courseToBoost) {
            const increaseCount = Math.floor(students.length * (studentPopularity.increase / 100));
            const studentsToModify = simulatedStudents
                .filter((s: Student) => !s.electiveChoices.includes(courseToBoost.code))
                .slice(0, increaseCount);

            studentsToModify.forEach((s: Student) => {
                if (s.electiveChoices.length > 0) {
                    s.electiveChoices.pop(); // Simple logic: replace last elective
                }
                s.electiveChoices.push(courseToBoost.code);
            });
        }
    }
    // --- End of Simulation Logic ---

    const daysToGenerate = selectedDays.length > 0 ? selectedDays : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    
    console.log("Selected days:", selectedDays);
    console.log("Days to generate for:", daysToGenerate);
    
    const input = {
      studentData: JSON.stringify(simulatedStudents),
      facultyData: JSON.stringify(simulatedFaculty),
      courseData: JSON.stringify(courses),
      roomData: JSON.stringify(simulatedRooms),
      constraints: JSON.stringify(constraints),
      programs: selectedPrograms,
      days: daysToGenerate,
      existingTimetable: timetableResult?.timetable ? JSON.stringify(timetableResult.timetable) : undefined
    };

    try {
      const response = await runGenerateTimetable(input);
      if (response.success && response.data) {
        setTimetableResult({
          timetable: response.data.timetable,
          conflicts: response.data.conflicts,
          report: response.data.report,
        });
        toast({
          title: "Timetable Generated Successfully",
          description: isSimulationActive 
            ? "Generated with temporary simulation settings." 
            : "The system has created a new timetable schedule.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Timetable Generation Failed",
          description: response.error || "An unknown error occurred.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Timetable Generation Failed",
        description:
          "An unexpected error occurred while running the generation.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-60 h-60 bg-pink-500/5 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Card className="backdrop-blur-xl bg-slate-900/80 border-slate-700/50 shadow-2xl shadow-purple-500/10 relative overflow-hidden">
            {/* Animated border */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
              >
                <CardTitle className="font-headline text-4xl flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="h-10 w-10 text-purple-400 drop-shadow-lg" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Smart Timetable Generator
                  </span>
                </CardTitle>
                <CardDescription className="text-xl text-slate-300 leading-relaxed">
                  Harness the power of AI to create perfectly optimized timetables that adapt to your institutional needs and constraints.
                </CardDescription>
              </motion.div>
            </CardHeader>
          <CardContent className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {dataSummary.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40, rotateX: -15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.5 + index * 0.15,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.08,
                    rotateY: 8,
                    z: 50
                  }}
                  className="group"
                >
                  <Card className="backdrop-blur-xl bg-slate-800/60 border-slate-600/30 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer relative overflow-hidden group-hover:border-purple-400/50">
                    {/* Animated gradient overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
                          animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeInOut"
                          }}
                          style={{
                            left: `${20 + i * 30}%`,
                            top: `${30 + i * 20}%`,
                          }}
                        />
                      ))}
                    </div>

                    <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3">
                      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-purple-300 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <motion.div
                        whileHover={{ 
                          scale: 1.3, 
                          rotate: 15,
                          filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <item.icon className="h-6 w-6 text-purple-400 group-hover:text-cyan-400 transition-colors duration-300" />
                      </motion.div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <motion.div 
                        className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2"
                        animate={{ 
                          backgroundPosition: ["0%", "100%", "0%"]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {item.count}
                      </motion.div>
                      <p className="text-sm text-slate-400 mb-6 group-hover:text-slate-300 transition-colors duration-300">
                        records available
                      </p>
                      {userRole === 'admin' && (
                        <Link href={item.link}>
                          <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                          >
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-purple-500/20 hover:border-purple-400/50 hover:text-purple-300 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20"
                            >
                              <span className="flex items-center justify-center gap-2">
                                Manage 
                                <motion.div
                                  animate={{ x: [0, 3, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  <ExternalLink className="h-3 w-3"/>
                                </motion.div>
                              </span>
                            </Button>
                          </motion.div>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          
            {isSimulationActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Alert variant="default" className="border-purple-500/50 bg-purple-500/10 glass-card">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Beaker className="h-5 w-5 text-purple-400" />
                  </motion.div>
                  <AlertTitle className="text-purple-300 font-bold">Simulation Mode Active</AlertTitle>
                  <AlertDescription className="text-purple-200/80">
                    {getSimulationDescription()}
                    <Link href="/constraints" className="ml-2 font-semibold underline text-purple-300 hover:text-purple-200 transition-colors">Edit Scenarios</Link>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {isProgramConstraintActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Alert variant="default" className="border-cyan-500/50 bg-cyan-500/10 glass-card">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="h-5 w-5 text-cyan-400" />
                  </motion.div>
                  <AlertTitle className="text-cyan-300 font-bold">Program Constraint Active</AlertTitle>
                  <AlertDescription className="text-cyan-200/80">
                    {getProgramConstraintDescription()}
                    <Link href="/constraints" className="ml-2 font-semibold underline text-cyan-300 hover:text-cyan-200 transition-colors">Edit Constraints</Link>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          
            {userRole === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 100 }}
                className="backdrop-blur-xl bg-slate-800/60 border-slate-600/30 shadow-2xl shadow-purple-500/10 p-8 rounded-2xl relative overflow-hidden"
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20"
                    animate={{
                      backgroundPosition: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex flex-col items-center justify-center gap-6 text-center md:flex-row md:justify-between md:text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.7, type: "spring" }}
                    >
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-3">
                        Ready to Generate?
                      </h3>
                      <p className="text-slate-300 leading-relaxed max-w-md">
                        Select specific programs to generate for, or leave blank to generate for all programs. 
                        <span className="text-purple-300 font-semibold"> Timetable will be generated for Monday to Friday (5 days).</span>
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 30, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 200 }}
                    >
                      <motion.div
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={onGenerate} 
                          disabled={isLoading} 
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 hover:from-purple-500 hover:via-cyan-500 hover:to-pink-500 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
                        >
                          {/* Animated background */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                            animate={{
                              x: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          
                          <span className="relative z-10 flex items-center gap-3">
                            {isLoading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Loader2 className="h-6 w-6" />
                              </motion.div>
                            ) : (
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                  rotate: [0, 10, -10, 0]
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                {isSimulationActive ? <Beaker className="h-6 w-6" /> : <Wand2 className="h-6 w-6" />}
                              </motion.div>
                            )}
                            <span className="text-lg">
                              {isSimulationActive ? 'Run Simulation' : 'Generate Timetable'}
                            </span>
                          </span>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="max-w-md mx-auto md:mx-0"
                  >
                    <MultiSelect
                      title="Programs"
                      options={availablePrograms.map(p => ({value: p, label: p}))}
                      selected={selectedPrograms}
                      onSelectedChange={setSelectedPrograms}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center justify-center backdrop-blur-xl bg-slate-900/80 border-slate-700/50 shadow-2xl shadow-purple-500/20 p-16 text-center rounded-3xl relative overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-pink-500/10" />
          
          {/* Floating orbs */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-20 h-20 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-full blur-xl"
                animate={{
                  x: [0, 100, -100, 0],
                  y: [0, -50, 50, 0],
                  scale: [1, 1.5, 0.5, 1],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="mb-8"
            >
              <Loader2 className="h-20 w-20 text-purple-400 drop-shadow-2xl" />
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-4"
            >
              Generating Timetable...
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-slate-300 text-lg mb-8 max-w-md"
            >
              The AI is analyzing constraints and scheduling classes. This may take a moment.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex justify-center space-x-3"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                    y: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                  className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 shadow-lg"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {timetableResult && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <TimetableGrid 
            timetable={timetableResult.timetable}
            conflicts={timetableResult.conflicts}
            report={timetableResult.report}
          />
        </motion.div>
      )}
      </div>
    </div>
  );
}