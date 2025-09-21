
"use client";

import { mockQuizMarks } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";

export default function QuizzesPage() {
  const { searchTerm } = useContext(DataContext);
  
  const filteredQuizzes = mockQuizMarks.filter(quiz => 
    quiz.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Quiz Marks</h1>
      <p className="text-muted-foreground">
        A dedicated section to view quiz marks for all students.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Consolidated Quiz Scores</CardTitle>
          <CardDescription>
            Performance of students in internal quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Quiz No.</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="w-[200px]">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.studentName}</TableCell>
                  <TableCell>{quiz.course}</TableCell>
                  <TableCell>{quiz.quizNumber}</TableCell>
                  <TableCell className="font-mono">{`${quiz.marks}/${quiz.totalMarks}`}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={(quiz.marks / quiz.totalMarks) * 100} className="h-2" />
                      <span className="text-xs text-muted-foreground">{Math.round((quiz.marks / quiz.totalMarks) * 100)}%</span>
                    </div>
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
