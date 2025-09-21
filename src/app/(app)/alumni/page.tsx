
"use client";

import { mockAlumni } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";

export default function AlumniPage() {
  const { searchTerm } = useContext(DataContext);

  const filteredAlumni = mockAlumni.filter(alumnus => 
    alumnus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alumnus.achievement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Alumni Records</h1>
      <p className="text-muted-foreground">
        A directory of our distinguished alumni and their notable achievements.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Alumni Directory</CardTitle>
          <CardDescription>
            Showing records of passed-out students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Pass-out Year</TableHead>
                <TableHead>Achievement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlumni.map((alumnus) => (
                <TableRow key={alumnus.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {alumnus.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{alumnus.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{alumnus.passOutYear}</TableCell>
                  <TableCell>{alumnus.achievement}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
