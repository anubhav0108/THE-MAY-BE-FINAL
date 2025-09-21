
"use client";

import { useState, useContext, useMemo } from 'react';
import { DataContext } from '@/context/data-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Circle, GraduationCap, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Student, Course } from '@/lib/types';


const CourseRequirementCard = ({ title, courses, completedCourses }: { title: string, courses: Course[], completedCourses: Set<string> }) => {
    const completedCount = courses.filter(c => completedCourses.has(c.code)).length;
    const progressPercentage = courses.length > 0 ? (completedCount / courses.length) * 100 : 0;

    return (
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                    <span>{title}</span>
                    <Badge variant={progressPercentage === 100 ? 'default' : 'secondary'}>{completedCount} / {courses.length} Courses</Badge>
                </CardTitle>
                <CardDescription>Required courses for this pathway.</CardDescription>
                <div className="pt-2">
                    <Progress value={progressPercentage} />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {courses.map(course => {
                    const isCompleted = completedCourses.has(course.code);
                    return (
                        <div key={course.id} className={`flex items-center justify-between p-3 rounded-md border ${isCompleted ? 'bg-secondary/50' : 'bg-background'}`}>
                            <div className="flex items-center gap-3">
                                {isCompleted 
                                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    : <Circle className="h-5 w-5 text-muted-foreground" />
                                }
                                <div>
                                    <p className={`font-medium ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>{course.name} ({course.code})</p>
                                    <p className="text-xs text-muted-foreground">{course.credits} Credits</p>
                                </div>
                            </div>
                            <Badge variant="outline">{course.category}</Badge>
                        </div>
                    )
                })}
                 {courses.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No required courses defined for this pathway.</p>}
            </CardContent>
        </Card>
    );
};


export default function AcademicProgressPage() {
    const { students, courses } = useContext(DataContext);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const selectedStudent = useMemo(() => {
        return students.find(s => s.id === selectedStudentId);
    }, [selectedStudentId, students]);

    const { majorCourses, minorCourses, completedCourses } = useMemo(() => {
        if (!selectedStudent) {
            return { majorCourses: [], minorCourses: [], completedCourses: new Set<string>() };
        }

        const majorCourses = courses.filter(c => c.category === 'Major' && c.code.startsWith(selectedStudent.branch.substring(0, 2).toUpperCase()));
        const minorCourses = courses.filter(c => c.category === 'Minor');

        // This is a simplified logic. In a real scenario, you'd check against actual enrollment/grade records.
        // For this demo, we'll assume `electiveChoices` represents completed courses for simplicity.
        const completedCourses = new Set(selectedStudent.electiveChoices);
        
        // Also add major courses based on year.
        majorCourses.forEach(mc => {
             const courseLevel = parseInt(mc.code.match(/\d/)?.[0] || '0', 10);
             if(courseLevel < selectedStudent.year) {
                completedCourses.add(mc.code);
             }
        });

        return { majorCourses, minorCourses, completedCourses };

    }, [selectedStudent, courses]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Academic Progress Tracker</h1>
                    <p className="text-muted-foreground">Monitor student progress towards Major/Minor pathway completion.</p>
                </div>
                <div className="w-full md:w-[300px]">
                    <Select onValueChange={setSelectedStudentId}>
                        <SelectTrigger className="w-full">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select a Student..." />
                        </SelectTrigger>
                        <SelectContent>
                            {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                    {student.name} ({student.id})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!selectedStudent ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center mt-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold tracking-tight">Select a Student</h3>
                    <p className="text-sm text-muted-foreground">Choose a student from the dropdown to view their academic progress.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                             <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-xl">
                                {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{selectedStudent.name}</CardTitle>
                                <div className="text-sm text-muted-foreground space-x-2">
                                    <Badge>{selectedStudent.major}</Badge>
                                    <Badge variant="secondary">{selectedStudent.minor}</Badge>
                                    <Badge variant="outline">Year {selectedStudent.year}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-8">
                        <CourseRequirementCard title="Major Pathway" courses={majorCourses} completedCourses={completedCourses} />
                        <CourseRequirementCard title="Minor Pathway" courses={minorCourses} completedCourses={completedCourses} />
                    </div>
                </div>
            )}
        </div>
    );
}
