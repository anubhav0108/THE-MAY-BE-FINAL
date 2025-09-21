
"use client";

import { useContext, useMemo } from "react";
import { DataContext } from "@/context/data-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Users, DoorOpen, Clock, FileText, Gauge, GraduationCap, ShieldCheck, BarChart2, Wand2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Student, Course, TimetableEntry } from "@/lib/types";

const timeSlots = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 01:00",
  "02:00 - 03:00",
  "03:00 - 04:00",
  "04:00 - 05:00",
];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(221, 83%, 65%)",
  "hsl(180, 83%, 65%)",
  "hsl(60, 83%, 65%)"
];

// Helper to get all courses for a student
const getStudentCourses = (student: Student, allCourses: Course[]): Set<string> => {
    const studentCourseCodes = new Set<string>();

    student.electiveChoices.forEach(code => studentCourseCodes.add(code));
    
    const branchPrefix = student.branch.substring(0, 2).toUpperCase();
    
    allCourses.forEach(course => {
        const courseCode = course.code.toUpperCase();
        if (courseCode.startsWith(branchPrefix)) {
            const levelMatch = courseCode.match(/[a-zA-Z]+(\d)/);
            if (levelMatch && levelMatch[1]) {
                const courseLevel = parseInt(levelMatch[1], 10);
                if (courseLevel === student.year) {
                    studentCourseCodes.add(course.code);
                }
            }
        }
        if ((course.code.startsWith('HS') || course.code.startsWith('PH')) && student.year <= 2) {
             studentCourseCodes.add(course.code);
        }
    });

    return studentCourseCodes;
};


export default function AnalyticsPage() {
  const { faculty, rooms, timetableResult, students, courses } = useContext(DataContext);

  const analyticsData = useMemo(() => {
    if (!timetableResult) {
      return {
        scheduledHours: 0,
        totalRoomHours: rooms.length * timeSlots.length * days.length,
        assignedFaculty: new Set(),
        usedRooms: new Set(),
        peakHours: 'N/A',
        facultyLoadData: [],
        heatmapData: [],
        studentCreditLoadData: [],
      };
    }

    const scheduledHours = timetableResult.timetable.length;
    const totalRoomHours = rooms.length * timeSlots.length * days.length;
    const assignedFaculty = new Set(timetableResult.timetable.map(t => t.faculty));
    const usedRooms = new Set(timetableResult.timetable.map(t => t.room));

    const hourCounts: { [key: string]: number } = {};
    for (const slot of timetableResult.timetable) {
      hourCounts[slot.time] = (hourCounts[slot.time] || 0) + 1;
    }
    const peakHours = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const facultyLoadData = faculty.map(f => {
      const assignedHours = timetableResult.timetable.filter(t => t.faculty === f.name).length;
      const isOverloaded = assignedHours > f.workload;
      return {
        name: f.name.split(' ').slice(1).join(' '),
        assignedHours,
        expectedWorkload: f.workload,
        fill: isOverloaded ? "hsl(var(--destructive))" : "hsl(var(--chart-2))"
      };
    });

    const heatmapData = days.map(day => {
      const dayData: { day: string;[key: string]: any } = { day };
      rooms.forEach(room => {
        const hours = timetableResult.timetable.filter(t => t.room === room.name && t.day === day).length;
        dayData[room.name] = hours;
      });
      return dayData;
    });

    const studentCreditLoadData = students.map(student => {
      const studentCourseCodes = getStudentCourses(student, courses);
      const scheduledCourses = new Set<string>();
      timetableResult.timetable.forEach(entry => {
        if (studentCourseCodes.has(entry.courseCode)) {
          scheduledCourses.add(entry.courseCode);
        }
      });
      
      let assignedCredits = 0;
      scheduledCourses.forEach(courseCode => {
        const course = courses.find(c => c.code === courseCode);
        if (course) {
          assignedCredits += course.credits;
        }
      });

      let status: 'Compliant' | 'Under-loaded' | 'Over-loaded' = 'Compliant';
      if (assignedCredits < 18) status = 'Under-loaded';
      if (assignedCredits > 24) status = 'Over-loaded';

      return {
        id: student.id,
        name: student.name,
        branch: student.branch,
        enrolledCredits: student.enrolledCredits,
        assignedCredits,
        status,
      };
    });

    return {
      scheduledHours,
      totalRoomHours,
      assignedFaculty,
      usedRooms,
      peakHours,
      facultyLoadData,
      heatmapData,
      studentCreditLoadData,
    };
  }, [timetableResult, students, faculty, courses, rooms]);

  const {
    scheduledHours,
    totalRoomHours,
    assignedFaculty,
    usedRooms,
    peakHours,
    facultyLoadData,
    heatmapData,
    studentCreditLoadData,
  } = analyticsData;

  const roomUtilizationPercentage = totalRoomHours > 0 ? (scheduledHours / totalRoomHours) * 100 : 0;
  const facultyLoadPercentage = faculty.length > 0 ? (assignedFaculty.size / faculty.length) * 100 : 0;
  const roomUsagePercentage = rooms.length > 0 ? (usedRooms.size / rooms.length) * 100 : 0;
  
  const avgHoursPerStudent = students.length > 0 ? (scheduledHours / students.length) : 0;
  const avgDailyHours = avgHoursPerStudent / days.length;
  
  const compliantStudents = studentCreditLoadData.filter(s => s.status === 'Compliant').length;
  const cbcsCompliancePercentage = students.length > 0 ? (compliantStudents / students.length) * 100 : 0;
  
  if (!timetableResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mx-auto bg-secondary p-3 rounded-full mb-4">
              <BarChart2 className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle className="font-headline text-2xl">Analytics & Reports</CardTitle>
            <CardDescription>Generate a timetable from the dashboard to view analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>
                <Wand2 className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Analytics & Reports</h1>
      <p className="text-muted-foreground">
        Gain insights into timetable efficiency and resource allocation.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        <Card className="interactive-element">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Overall Utilization</h3>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomUtilizationPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{scheduledHours} of {totalRoomHours} hours</p>
          </CardContent>
        </Card>
        <Card className="interactive-element">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Faculty Load</h3>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facultyLoadPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{assignedFaculty.size} of {faculty.length} assigned</p>
          </CardContent>
        </Card>
        <Card className="interactive-element">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Room Usage</h3>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomUsagePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{usedRooms.size} of {rooms.length} utilized</p>
          </CardContent>
        </Card>
        <Card className="interactive-element">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">CBCS Compliance</h3>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cbcsCompliancePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{compliantStudents} of {students.length} students compliant</p>
          </CardContent>
        </Card>
        <Card className="interactive-element">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Student Workload</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyHours.toFixed(1)} hrs</div>
            <p className="text-xs text-muted-foreground">Avg. daily class hours</p>
          </CardContent>
        </Card>
        <Card className="interactive-element">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Peak Hours</h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakHours}</div>
            <p className="text-xs text-muted-foreground">Most concurrent classes</p>
          </CardContent>
        </Card>
      </div>

       <Card className="interactive-element">
        <CardHeader>
          <CardTitle>Faculty Workload Distribution</CardTitle>
          <CardDescription>
            Assigned weekly class hours vs. expected workload for each faculty member. Overloaded faculty are highlighted in red.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
           <ResponsiveContainer width="100%" height={350}>
            <BarChart data={facultyLoadData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="#888888" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: 'var(--radius)' 
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend iconSize={10} />
              <Bar dataKey="expectedWorkload" name="Expected" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="assignedHours" name="Assigned" stackId="a" radius={[4, 4, 0, 0]}>
                {facultyLoadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 interactive-element">
            <CardHeader>
                <CardTitle>Resource Utilization Heatmap</CardTitle>
                <CardDescription>
                Daily booked hours for each room and lab across the week.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={heatmapData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                            dataKey="day"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            fontSize={12}
                            />
                            <YAxis fontSize={12} allowDecimals={false} />
                            <Tooltip
                                cursor={false}
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--background))', 
                                    border: '1px solid hsl(var(--border))', 
                                    borderRadius: 'var(--radius)' 
                                }}
                            />
                            <Legend iconSize={10} />
                            {rooms.map((room, index) => (
                                <Bar key={room.id} dataKey={room.name} name={room.name} stackId="a" fill={chartColors[index % chartColors.length]} radius={4} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <Accordion type="single" collapsible className="w-full mt-4">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Table className="h-4 w-4" />
                                <span>View Raw Data</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <pre className="text-xs p-4 bg-muted/50 rounded-md overflow-x-auto">
                                {JSON.stringify(heatmapData, null, 2)}
                            </pre>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2 interactive-element">
            <CardHeader>
                <CardTitle>Generation Report</CardTitle>
                <CardDescription>View the detailed report from the AI generator.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-4/5">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">The full generation report is available on the Reports page.</p>
                <Link href="/reports">
                    <Button>View Report <ExternalLink className="ml-2 h-4 w-4" /></Button>
                </Link>
            </CardContent>
        </Card>
      </div>
      
       <Card className="interactive-element">
        <CardHeader>
          <CardTitle>Student Credit Load Analysis (CBCS)</CardTitle>
          <CardDescription>
            Analysis of assigned credits for each student based on the generated timetable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Target Credits</TableHead>
                <TableHead>Assigned Credits</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentCreditLoadData.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name} ({student.id})</TableCell>
                  <TableCell>{student.branch}</TableCell>
                  <TableCell>{student.enrolledCredits}</TableCell>
                  <TableCell>{student.assignedCredits}</TableCell>
                  <TableCell>
                    <Badge variant={
                        student.status === 'Compliant' ? 'default' : 
                        student.status === 'Over-loaded' ? 'destructive' : 'secondary'
                    }>
                        {student.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    