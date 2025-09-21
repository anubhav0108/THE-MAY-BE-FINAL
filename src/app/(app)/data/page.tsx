

"use client";

import { useContext, useState, useEffect } from "react";
import { DataContext } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { Student, Faculty, Course, Room } from "@/lib/types";
import { Badge } from "@/components/ui/badge";


type ItemToDelete = {
    type: string;
    id: string;
} | null;

type ItemToEdit = {
    type: string;
    data: Student | Faculty | Course | Room;
} | null;


export default function DataPage() {
  const { toast } = useToast();
  const { 
    students, setStudents, 
    faculty, setFaculty, 
    courses, setCourses, 
    rooms, setRooms, 
    searchTerm 
  } = useContext(DataContext);
  
  const [dialogOpen, setDialogOpen] = useState({ student: false, faculty: false, course: false, room: false });
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete>(null);
  const [itemToEdit, setItemToEdit] = useState<ItemToEdit>(null);
  const [programFilter, setProgramFilter] = useState<string>("all");

  const [formData, setFormData] = useState<any>({});

  const availablePrograms = ["all", ...Array.from(new Set(students.map(s => s.branch)))];

  useEffect(() => {
    if (itemToEdit) {
        const dataToEdit: any = { ...itemToEdit.data };
        
        // Convert array fields to comma-separated strings for the form input
        if ('electiveChoices' in dataToEdit && Array.isArray(dataToEdit.electiveChoices)) {
            dataToEdit.electiveChoices = dataToEdit.electiveChoices.join(', ');
        }
        if ('preferredTimeSlots' in dataToEdit && Array.isArray(dataToEdit.preferredTimeSlots)) {
            dataToEdit.preferredTimeSlots = dataToEdit.preferredTimeSlots.join(', ');
        }
        
        setFormData(dataToEdit);
    } else {
        setFormData({});
    }
  }, [itemToEdit]);

  const handleDialogOpen = (type: 'student' | 'faculty' | 'course' | 'room', open: boolean) => {
    setDialogOpen(prev => ({ ...prev, [type]: open }));
    if (!open) {
      setFormData({}); // Clear form data when any dialog closes
    }
  };

  const handleEditOpen = (open: boolean) => {
    if (!open) {
        setItemToEdit(null);
    }
  }

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = (type: 'student' | 'faculty' | 'course' | 'room') => {
    // Basic validation
    if (Object.values(formData).some(val => val === '')) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all fields." });
      return;
    }
    
    const id = formData.id;
    let message = "";
    let isEdit = !!itemToEdit;
    const entityName = formData.name;

    switch(type) {
      case 'student':
        const studentData: Student = { 
            ...formData, 
            year: parseInt(formData.year, 10),
            enrolledCredits: parseInt(formData.enrolledCredits, 10),
            electiveChoices: formData.electiveChoices.split(',').map((s: string) => s.trim()).filter(Boolean),
            preferredTimeSlots: formData.preferredTimeSlots?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        };
        if (isEdit) {
            setStudents(students.map(s => s.id === id ? studentData : s));
            message = "Student Updated";
        } else {
            setStudents([{...studentData, id: `S${(students.length + 1).toString().padStart(3,'0')}`}, ...students]);
            message = "Student Added";
        }
        break;
      case 'faculty':
         const facultyData: Faculty = { ...formData };
        if (isEdit) {
            setFaculty(faculty.map(f => f.id === id ? facultyData : f));
            message = "Faculty Updated";
        } else {
            setFaculty([{...facultyData, id: `F${(faculty.length + 1).toString().padStart(2,'0')}`}, ...faculty]);
            message = "Faculty Added";
        }
        break;
      case 'course':
        const courseData: Course = { ...formData, id: formData.code, credits: parseInt(formData.credits, 10), capacity: parseInt(formData.capacity, 10) };
        if (isEdit) {
            setCourses(courses.map(c => c.id === id ? courseData : c));
            message = "Course Updated";
        } else {
            setCourses([courseData, ...courses]);
            message = "Course Added";
        }
        break;
      case 'room':
        const roomData: Room = { ...formData, capacity: parseInt(formData.capacity, 10) };
        if (isEdit) {
            setRooms(rooms.map(r => r.id === id ? roomData : r));
            message = "Room Updated";
        } else {
            setRooms([{...roomData, id: `R${(rooms.length + 1).toString().padStart(3,'0')}`}, ...rooms]);
            message = "Room Added";
        }
        break;
    }

    toast({ title: message, description: `${entityName} has been successfully saved.` });
    
    if (isEdit) {
      handleEditOpen(false);
    } else {
      handleDialogOpen(type, false);
    }
  };
  
  const handleDelete = () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    
    switch(type.toLowerCase()) {
        case 'student': setStudents(students.filter(s => s.id !== id)); break;
        case 'faculty': setFaculty(faculty.filter(f => f.id !== id)); break;
        case 'course': setCourses(courses.filter(c => c.id !== id)); break;
        case 'room': setRooms(rooms.filter(r => r.id !== id)); break;
    }

    toast({ title: `${type} Deleted`, description: `${type} with ID: ${id} has been deleted.` });
    setItemToDelete(null);
  };
  
  const applyFilters = (data: any[], keys: string[]) => {
    return data.filter(item => {
      const searchMatch = keys.some(key =>
        item[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const programMatch = programFilter === 'all' || (item.branch && item.branch === programFilter) || (item.department && item.department === programFilter);
      
      if (item.branch || item.department) { // Student or Faculty
        return searchMatch && programMatch;
      }
      // For Course and Room, program filter is not directly applicable, so we only filter by search
      return searchMatch;
    });
  };

  const filteredStudents = applyFilters(students, ['name', 'id', 'branch']);
  const filteredFaculty = applyFilters(faculty, ['name', 'department', 'almaMater', 'specialization']);
  const filteredCourses = applyFilters(courses, ['name', 'code']);
  const filteredRooms = applyFilters(rooms, ['name', 'type']);
  
  const getEnrolledCount = (courseCode: string) => {
    return students.filter(student => student.electiveChoices.includes(courseCode)).length;
  }

  const renderHeader = (title: string, description: string, onAdd: () => void, addLabel: string, showProgramFilter: boolean) => (
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
             {showProgramFilter && <div className="w-[200px]">
                <Select value={programFilter} onValueChange={setProgramFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Program..." />
                    </SelectTrigger>
                    <SelectContent>
                        {availablePrograms.map(prog => (
                            <SelectItem key={prog} value={prog}>{prog === 'all' ? 'All Programs' : prog}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>}
            <DialogTrigger asChild onClick={onAdd}>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> {addLabel}</Button>
            </DialogTrigger>
          </div>
        </div>
      </CardHeader>
  )

  const renderStudentForm = (isEdit: boolean) => (
      <>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Add New'} Student</DialogTitle>
          <DialogDescription>Fill in the details for the student.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isEdit && <div className="space-y-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input id="student-id" value={formData.id || ''} disabled />
          </div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="student-name">Name</Label>
                <Input id="student-name" placeholder="e.g., Neha Sharma" value={formData.name || ''} onChange={(e) => handleFormChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="student-branch">Branch</Label>
                <Input id="student-branch" placeholder="e.g., Computer Science" value={formData.branch || ''} onChange={(e) => handleFormChange('branch', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="student-year">Year</Label>
                <Input id="student-year" type="number" placeholder="e.g., 2" value={formData.year || ''} onChange={(e) => handleFormChange('year', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="student-credits">Enrolled Credits</Label>
                <Input id="student-credits" type="number" placeholder="e.g., 21" value={formData.enrolledCredits || ''} onChange={(e) => handleFormChange('enrolledCredits', e.target.value)} />
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="student-electives">Elective Choices (comma-separated)</Label>
            <Input id="student-electives" placeholder="e.g., CS302, PH100" value={formData.electiveChoices || ''} onChange={(e) => handleFormChange('electiveChoices', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-preferences">Preferred Slots (comma-separated)</Label>
            <Input id="student-preferences" placeholder="e.g., 09:00 - 10:00, 10:00 - 11:00" value={formData.preferredTimeSlots || ''} onChange={(e) => handleFormChange('preferredTimeSlots', e.target.value)} />
          </div>
        </div>
      </>
    );

  const renderFacultyForm = (isEdit: boolean) => (
      <>
      <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Add New'} Faculty</DialogTitle>
          <DialogDescription>Fill in the details for the new faculty member.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
          {isEdit && <div className="space-y-2">
              <Label htmlFor="faculty-id">Faculty ID</Label>
              <Input id="faculty-id" value={formData.id || ''} disabled />
          </div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="faculty-name">Name</Label>
                <Input id="faculty-name" placeholder="e.g., Dr. Ramesh Singh" value={formData.name || ''} onChange={(e) => handleFormChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="faculty-department">Department</Label>
                <Input id="faculty-department" placeholder="e.g., Mathematics" value={formData.department || ''} onChange={(e) => handleFormChange('department', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="faculty-almaMater">Alma Mater</Label>
                <Input id="faculty-almaMater" placeholder="e.g., IIT Delhi" value={formData.almaMater || ''} onChange={(e) => handleFormChange('almaMater', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="faculty-specialization">Specialization</Label>
                <Input id="faculty-specialization" placeholder="e.g., Algorithms, AI" value={formData.specialization || ''} onChange={(e) => handleFormChange('specialization', e.target.value)} />
            </div>
          </div>
      </div>
      </>
  );

  const renderCourseForm = (isEdit: boolean) => (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit' : 'Add New'} Course</DialogTitle>
        <DialogDescription>Fill in the details for the new course.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {isEdit && <div className="space-y-2">
          <Label htmlFor="course-id">Course ID</Label>
          <Input id="course-id" value={formData.id || ''} disabled />
        </div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="course-code">Course Code</Label>
            <Input id="course-code" placeholder="e.g., MA201" value={formData.code || ''} onChange={(e) => handleFormChange('code', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-name">Name</Label>
            <Input id="course-name" placeholder="e.g., Advanced Calculus" value={formData.name || ''} onChange={(e) => handleFormChange('name', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="course-credits">Credits</Label>
            <Input id="course-credits" type="number" placeholder="e.g., 3" value={formData.credits || ''} onChange={(e) => handleFormChange('credits', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="course-type">Type</Label>
                <Select value={formData.type || ''} onValueChange={(value) => handleFormChange('type', value)}>
                    <SelectTrigger id="course-type"><SelectValue placeholder="Select a type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Theory">Theory</SelectItem>
                        <SelectItem value="Practical">Practical</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="course-capacity">Capacity</Label>
            <Input id="course-capacity" type="number" placeholder="e.g., 60" value={formData.capacity || ''} onChange={(e) => handleFormChange('capacity', e.target.value)} />
        </div>
      </div>
    </>
  );
  
  const renderRoomForm = (isEdit: boolean) => (
      <>
      <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Add New'} Room</DialogTitle>
          <DialogDescription>Fill in the details for the new room.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
          {isEdit && <div className="space-y-2">
              <Label htmlFor="room-id">Room ID</Label>
              <Input id="room-id" value={formData.id || ''} disabled/>
          </div>}
          <div className="space-y-2">
              <Label htmlFor="room-name">Name</Label>
              <Input id="room-name" placeholder="e.g., Seminar Hall 2" value={formData.name || ''} onChange={(e) => handleFormChange('name', e.target.value)} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="room-capacity">Capacity</Label>
              <Input id="room-capacity" type="number" placeholder="e.g., 80" value={formData.capacity || ''} onChange={(e) => handleFormChange('capacity', e.target.value)} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="room-type">Type</Label>
              <Select value={formData.type || ''} onValueChange={(value) => handleFormChange('type', value)}>
                  <SelectTrigger id="room-type"><SelectValue placeholder="Select a type" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Lecture">Lecture</SelectItem>
                      <SelectItem value="Lab">Lab</SelectItem>
                  </SelectContent>
              </Select>
          </div>
      </div>
      </>
  );

  return (
    <AlertDialog>
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Data Management</h1>
      <p className="text-muted-foreground">
        Manage your institutional data using the interactive tables below.
      </p>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="students" className="w-full">
            <div className="p-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
              </TabsList>
            </div>

            {/* Students Tab */}
            <TabsContent value="students">
              <Dialog open={dialogOpen.student} onOpenChange={(open) => handleDialogOpen('student', open)}>
                {renderHeader(
                  "Student Records", 
                  "A list of all students currently enrolled.",
                  () => handleDialogOpen('student', true),
                  "Add Student",
                  true
                )}
                <DialogContent className="sm:max-w-md">
                    {renderStudentForm(false)}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={() => handleSave('student')}>Save</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Electives</TableHead>
                    <TableHead>Preferred Slots</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.id}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.branch}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.electiveChoices.map((choice: string) => (
                            <Badge key={choice} variant="secondary">{choice}</Badge>
                          ))}
                        </div>
                      </TableCell>
                       <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.preferredTimeSlots?.map((choice: string) => (
                            <Badge key={choice} variant="outline">{choice}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                         <Button variant="ghost" size="icon" onClick={() => setItemToEdit({type: 'student', data: student})}><Edit className="h-4 w-4" /></Button>
                         <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'Student', id: student.id})}><Trash2 className="h-4 w-4" /></Button>
                         </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            {/* Faculty Tab */}
            <TabsContent value="faculty">
              <Dialog open={dialogOpen.faculty} onOpenChange={(open) => handleDialogOpen('faculty', open)}>
                {renderHeader(
                  "Faculty Records", 
                  "A list of all faculty members.",
                  () => handleDialogOpen('faculty', true),
                  "Add Faculty",
                  true
                )}
                 <DialogContent>
                    {renderFacultyForm(false)}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={() => handleSave('faculty')}>Save</Button>
                    </DialogFooter>
                </DialogContent>
               </Dialog>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Alma Mater</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculty.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono">{f.id}</TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.department}</TableCell>
                      <TableCell>{f.almaMater}</TableCell>
                      <TableCell>{f.specialization}</TableCell>
                       <TableCell className="text-right space-x-2">
                         <Button variant="ghost" size="icon" onClick={() => setItemToEdit({type: 'faculty', data: f})}><Edit className="h-4 w-4" /></Button>
                         <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'Faculty', id: f.id})}><Trash2 className="h-4 w-4" /></Button>
                         </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses">
               <Dialog open={dialogOpen.course} onOpenChange={(open) => handleDialogOpen('course', open)}>
                {renderHeader(
                  "Course Records", 
                  "A list of all available courses.",
                  () => handleDialogOpen('course', true),
                  "Add Course",
                  false
                )}
                <DialogContent>
                    {renderCourseForm(false)}
                      <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={() => handleSave('course')}>Save</Button>
                    </DialogFooter>
                </DialogContent>
               </Dialog>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Enrolled/Capacity</TableHead>
                    <TableHead className="w-[200px]">Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => {
                    const enrolled = getEnrolledCount(course.code);
                    const availability = (enrolled / course.capacity) * 100;
                    return (
                        <TableRow key={course.id}>
                            <TableCell className="font-mono">{course.code}</TableCell>
                            <TableCell className="font-medium">{course.name}</TableCell>
                            <TableCell><Badge variant="outline">{course.type}</Badge></TableCell>
                            <TableCell className="font-mono">{`${enrolled} / ${course.capacity}`}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                <Progress value={availability} className="h-2" />
                                <span className="text-xs text-muted-foreground">{course.capacity - enrolled} left</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => setItemToEdit({type: 'course', data: course})}><Edit className="h-4 w-4" /></Button>
                                <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'Course', id: course.id})}><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                            </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Rooms Tab */}
            <TabsContent value="rooms">
              <Dialog open={dialogOpen.room} onOpenChange={(open) => handleDialogOpen('room', open)}>
                {renderHeader(
                  "Room Records",
                  "A list of all available rooms.",
                  () => handleDialogOpen('room', true),
                  "Add Room",
                  false
                )}
                <DialogContent>
                    {renderRoomForm(false)}
                      <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={() => handleSave('room')}>Save</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-mono">{room.id}</TableCell>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell className="text-right space-x-2">
                         <Button variant="ghost" size="icon" onClick={() => setItemToEdit({type: 'room', data: room})}><Edit className="h-4 w-4" /></Button>
                         <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'Room', id: room.id})}><Trash2 className="h-4 w-4" /></Button>
                         </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Universal Edit Dialog */}
      <Dialog open={!!itemToEdit} onOpenChange={handleEditOpen}>
        <DialogContent className="sm:max-w-md">
            {itemToEdit?.type === 'student' && renderStudentForm(true)}
            {itemToEdit?.type === 'faculty' && renderFacultyForm(true)}
            {itemToEdit?.type === 'course' && renderCourseForm(true)}
            {itemToEdit?.type === 'room' && renderRoomForm(true)}
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => handleSave(itemToEdit!.type.toLowerCase() as any)}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Universal Delete Confirmation */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type.toLowerCase()} record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </div>
    </AlertDialog>
  );
}
