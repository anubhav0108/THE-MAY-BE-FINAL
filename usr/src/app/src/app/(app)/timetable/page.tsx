
"use client";

import { useState, useContext } from "react";
import Link from "next/link";
import { DataContext } from "@/context/data-context";
import { TimetableGrid } from "@/components/timetable-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Wand2, User } from "lucide-react";
import type { TimetableEntry, Student } from "@/lib/types";

export default function TimetablePage() {
  const { timetableResult, students, courses, userRole } = useContext(DataContext);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [filteredTimetable, setFilteredTimetable] = useState<TimetableEntry[] | null>(null);

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);

    if (studentId === "all") {
      setFilteredTimetable(null);
      return;
    }
    
    if (!timetableResult) return;
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Get all course codes the student is enrolled in.
    const studentCourseCodes = new Set<string>();

    // 1. Add their explicit elective choices
    student.electiveChoices.forEach(code => studentCourseCodes.add(code));
    
    // 2. Add core branch courses based on branch and year
    const branchPrefix = student.branch.substring(0, 2).toUpperCase();
    const studentYear = student.year;

    courses.forEach(course => {
        const courseCode = course.code.toUpperCase();
        // Match branch (e.g., 'CS' for Computer Science)
        if (courseCode.startsWith(branchPrefix)) {
            // Match course level to student year
            // e.g., course code CS301 -> level '3' -> for year 3 students
            const levelMatch = courseCode.match(/[a-zA-Z]+(\d)/);
            if (levelMatch && levelMatch[1]) {
                const courseLevel = parseInt(levelMatch[1], 10);
                if (courseLevel === studentYear) {
                    studentCourseCodes.add(course.code);
                }
            }
        }
        
        // 3. Add common courses for early years (e.g., HS, PH for years 1 & 2)
        if ((course.code.startsWith('HS') || course.code.startsWith('PH')) && studentYear <= 2) {
             studentCourseCodes.add(course.code);
        }
    });

    const personalTimetable = timetableResult.timetable.filter(entry => 
      studentCourseCodes.has(entry.courseCode)
    );

    setFilteredTimetable(personalTimetable);
  };

  const activeTimetable = filteredTimetable ?? timetableResult?.timetable;
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  if (!timetableResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mx-auto bg-secondary p-3 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle className="font-headline text-2xl">No Active Timetable</CardTitle>
            <CardDescription>
                {userRole === 'admin' 
                    ? "No active timetable found. Please generate a new timetable from the dashboard."
                    : "An administrator has not generated a timetable yet. Please check back later."
                }
            </CardDescription>
          </CardHeader>
          {userRole === 'admin' && (
            <CardContent>
                <Link href="/dashboard">
                <Button>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Go to Dashboard
                </Button>
                </Link>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">
              {selectedStudent ? `Timetable for ${selectedStudent.name}` : 'Master Timetable'}
            </h1>
            <p className="text-muted-foreground">
                {selectedStudent 
                    ? `Showing personalized schedule for ${selectedStudent.branch}, Year ${selectedStudent.year}.`
                    : 'Displaying the complete institutional timetable. Use the selector to view a student-specific schedule.'
                }
            </p>
          </div>
          <div className="w-full md:w-[300px]">
            <Select onValueChange={handleStudentChange} defaultValue="all">
              <SelectTrigger className="w-full">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="View by Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">View Master Timetable</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeTimetable && activeTimetable.length > 0 ? (
            <TimetableGrid 
                timetable={activeTimetable}
                conflicts={selectedStudentId === 'all' ? timetableResult.conflicts : []}
                report={selectedStudentId === 'all' ? timetableResult.report : ''}
            />
        ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center mt-8">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold tracking-tight">No Classes Found</h3>
                <p className="text-sm text-muted-foreground">Could not find any scheduled classes for the selected student.</p>
            </div>
        )}
    </div>
  );
}
