
"use client";

import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { mockResults } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ResultsPage() {
  const { searchTerm } = useContext(DataContext);
  
  const branches = [...new Set(mockResults.map(r => r.branch))];

  const filteredResults = mockResults.filter(result =>
    (result.studentName && result.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (result.studentId && result.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Grade Management</h1>
      <p className="text-muted-foreground">
        View and manage student academic grades for each branch.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>
            Semester-wise performance of students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={branches[0] || 'all'}>
            <TabsList>
              {branches.map(branch => (
                <TabsTrigger key={branch} value={branch}>{branch}</TabsTrigger>
              ))}
            </TabsList>
            {branches.map(branch => (
              <TabsContent key={branch} value={branch}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>SGPA</TableHead>
                      <TableHead>CGPA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.filter(r => r.branch === branch).map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-mono">{result.studentId}</TableCell>
                        <TableCell className="font-medium">{result.studentName}</TableCell>
                        <TableCell>{result.semester}</TableCell>
                        <TableCell>
                          <Badge variant={result.sgpa > 9 ? "default" : "secondary"}>{result.sgpa.toFixed(2)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.cgpa.toFixed(2)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
