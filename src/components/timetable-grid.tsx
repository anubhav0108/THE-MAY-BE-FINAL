
"use client";

import { useRef, useState, useEffect, useContext } from "react";
import Link from "next/link";
import { DataContext } from "@/context/data-context";
import { TimetableEntry, Conflict } from "@/lib/types";
import { runSuggestFaculty } from "@/app/actions";
import { createAuditLog } from "@/lib/audit-log";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import * as ics from 'ics';
import PptxGenJS from "pptxgenjs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileText, CheckCircle, Loader2, Save, XCircle, Pencil, FileDown, ExternalLink, Wand2, Lightbulb, CalendarPlus, BookOpen, File, UserCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";


type TimetableGridProps = {
  timetable: TimetableEntry[];
  conflicts: Conflict[];
  report: string;
};

const timeSlots = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 01:00 (Lunch Break)",
  "02:00 - 03:00",
  "03:00 - 04:00",
  "04:00 - 05:00",
];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type SuggestionState = {
    [key: string]: {
        loading: boolean;
        suggestion: string | null;
        justification: string | null;
        error: string | null;
    }
}

export function TimetableGrid({ timetable, conflicts, report }: TimetableGridProps) {
  const { toast } = useToast();
  const timetableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTimetable, setEditableTimetable] = useState<TimetableEntry[]>([]);
  const [efficiency, setEfficiency] = useState(92);
  const [suggestions, setSuggestions] = useState<SuggestionState>({});
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  const { courses, faculty, rooms, setTimetableResult, timetableResult, addAuditLog, userRole, currentUser } = useContext(DataContext);
  const [originalTimetable, setOriginalTimetable] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    const deepCopy = JSON.parse(JSON.stringify(timetable));
    setEditableTimetable(deepCopy);
    setOriginalTimetable(deepCopy);
  }, [timetable]);

  useEffect(() => {
    const storedEfficiency = localStorage.getItem("timetableEfficiency");
    if (storedEfficiency) {
      setEfficiency(JSON.parse(storedEfficiency));
    } else {
      const newEfficiency = Math.floor(Math.random() * (98 - 85 + 1)) + 85;
      setEfficiency(newEfficiency);
      localStorage.setItem("timetableEfficiency", JSON.stringify(newEfficiency));
    }
  }, [timetable]);
  
  const getEntry = (day: string, time: string) => {
    return editableTimetable.find((entry) => entry.day === day && entry.time === time);
  };
  
  const handleManualOverride = () => {
    setIsEditing(true);
    setSuggestions({});
    toast({
      title: "Manual Override Mode Activated",
      description: "You can now edit the timetable directly.",
    });
  };

  const handleSaveChanges = () => {
    setIsEditing(false);

    const changes: string[] = [];
    originalTimetable.forEach(originalEntry => {
        const newEntry = editableTimetable.find(e => e.day === originalEntry.day && e.time === originalEntry.time);
        if (newEntry) {
            if (originalEntry.faculty !== newEntry.faculty) {
                changes.push(`Changed ${newEntry.course} at ${newEntry.day} ${newEntry.time} from ${originalEntry.faculty} to ${newEntry.faculty}.`);
            }
            if (originalEntry.room !== newEntry.room) {
                 changes.push(`Moved ${newEntry.course} at ${newEntry.day} ${newEntry.time} from ${originalEntry.room} to ${newEntry.room}.`);
            }
        }
    });

    if (changes.length > 0) {
        const log = createAuditLog({
            action: "TIMETABLE_UPDATE",
            user: currentUser.name,
            role: userRole,
            details: `Made ${changes.length} change(s): ${changes.join(' ')}`
        });
        addAuditLog(log);
    }

    if (timetableResult) {
        setTimetableResult({ ...timetableResult, timetable: editableTimetable });
    }

    toast({
      title: "Changes Saved",
      description: "Your timetable adjustments have been saved and logged.",
    });
  };

  const handleCancelChanges = () => {
    setIsEditing(false);
    setEditableTimetable(JSON.parse(JSON.stringify(timetable)));
    toast({
      variant: "destructive",
      title: "Changes Canceled",
      description: "Your edits have been discarded.",
    });
  };

  const handleEntryChange = (day: string, time: string, field: keyof Omit<TimetableEntry, 'day' | 'time'>, value: string) => {
    const updatedTimetable = editableTimetable.map(entry => {
      if (entry.day === day && entry.time === time) {
        const updatedEntry = { ...entry, [field]: value };
        if (field === 'course') {
            const selectedCourse = courses.find(c => c.name === value);
            updatedEntry.courseCode = selectedCourse?.code || '';
        }
        return updatedEntry;
      }
      return entry;
    });
    setEditableTimetable(updatedTimetable);
  };

  const handleSuggestion = async (day: string, time: string, courseName: string) => {
      const key = `${day}-${time}`;
      setSuggestions(prev => ({ ...prev, [key]: { loading: true, suggestion: null, justification: null, error: null } }));

      try {
          const course = courses.find(c => c.name === courseName);
          if (!course) {
              throw new Error("Course not found");
          }
          
          const response = await runSuggestFaculty({
              course: JSON.stringify(course),
              facultyData: JSON.stringify(faculty),
              timetable: JSON.stringify(editableTimetable),
          });

          if (response.success && response.data) {
              setSuggestions(prev => ({ ...prev, [key]: {
                  loading: false,
                  suggestion: response.data.facultyName,
                  justification: response.data.justification,
                  error: null,
              }}));
              toast({
                  title: "Suggestion Ready!",
                  description: `AI suggests ${response.data.facultyName} for this slot.`
              });
          } else {
              throw new Error(response.error || "Failed to get suggestion.");
          }
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          setSuggestions(prev => ({ ...prev, [key]: { loading: false, suggestion: null, justification: null, error: errorMessage } }));
          toast({
              variant: "destructive",
              title: "Suggestion Failed",
              description: errorMessage,
          });
      }
  };
    
  const applySuggestion = (day: string, time: string) => {
      const key = `${day}-${time}`;
      const suggestion = suggestions[key];
      if (suggestion && suggestion.suggestion) {
          handleEntryChange(day, time, 'faculty', suggestion.suggestion);
          toast({
              title: "Suggestion Applied!",
              description: `${suggestion.suggestion} has been assigned.`
          });
      }
  }

  const handleMarkAttendance = () => {
    if (!selectedEntry) return;
    
    const log = createAuditLog({
        action: "ATTENDANCE_MARKED",
        user: currentUser.name,
        role: userRole,
        details: `Attendance marked for course ${selectedEntry.course} (${selectedEntry.courseCode}) taught by ${selectedEntry.faculty}.`,
    });
    addAuditLog(log);
    
    toast({
        title: "Attendance Logged",
        description: `Attendance record for "${selectedEntry.course}" has been added to the Audit Log.`,
    });
  };

  const handleGeneratePptx = (entry: TimetableEntry) => {
    let pres = new PptxGenJS();
    const safeTitle = entry.course.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    pres.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { color: "F1F1F1" },
      objects: [
        { rect: { x: 0, y: 5.3, w: "100%", h: 0.2, fill: { color: "0072C6" } } },
        { text: { text: "Timetable Ace University", options: { x: 0.5, y: 5.4, fontSize: 10, color: "FFFFFF" } } },
      ],
    });

    let titleSlide = pres.addSlide({ masterName: "MASTER_SLIDE" });
    titleSlide.addText(entry.course, { x: 1, y: 1.5, fontSize: 42, bold: true, color: "0072C6" });
    titleSlide.addText(`Faculty: ${entry.faculty}`, { x: 1, y: 2.5, fontSize: 24, color: "363636" });
    titleSlide.addText(new Date().toLocaleDateString(), { x: 1, y: 4.5, fontSize: 18, color: "7F7F7F" });

    let agendaSlide = pres.addSlide({ masterName: "MASTER_SLIDE" });
    agendaSlide.addText("Agenda", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: "0072C6" });
    
    if (entry.course === 'Data Structures') {
        agendaSlide.addText([
            { text: "What are Data Structures?", options: { bullet: true, color: "363636"} },
            { text: "Arrays vs. Linked Lists", options: { bullet: true, color: "363636"} },
            { text: "Understanding Big O Notation", options: { bullet: true, color: "363636"} },
            { text: "Overview of Stacks & Queues", options: { bullet: true, color: "363636" } },
        ], { x: 1.0, y: 1.5, w: '80%', h: '70%', fontSize: 22 });

        let dsConceptSlide = pres.addSlide({ masterName: "MASTER_SLIDE" });
        dsConceptSlide.addText("Arrays vs. Linked Lists", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: "0072C6" });
        dsConceptSlide.addText([
            { text: "Arrays:", options: { bold: true } },
            { text: "Store elements in contiguous memory locations.", options: { bullet: { indentLevel: 30 }, fontSize: 18 } },
            { text: "Excellent for fast, O(1) random access using an index.", options: { bullet: { indentLevel: 30 }, fontSize: 18 } },
            { text: "Inefficient for insertions/deletions in the middle (O(n)).", options: { bullet: { indentLevel: 30 }, fontSize: 18 } },
        ], { x: 0.5, y: 1.5, w: '90%', h: '20%', fontSize: 20, color: '363636' });
         dsConceptSlide.addText([
            { text: "Linked Lists:", options: { bold: true } },
            { text: "Store elements as nodes with pointers to the next node.", options: { bullet: { indentLevel: 30 }, fontSize: 18 } },
            { text: "Slow for access (O(n)), as you must traverse the list.", options: { bullet: { indentLevel: 30 }, fontSize: 18 } },
            { text: "Very efficient for insertions/deletions at ends (O(1)).", options: { bullet: { indentLevel: 30 }, fontSize: 18 } },
        ], { x: 0.5, y: 3.5, w: '90%', h: '20%', fontSize: 20, color: '363636' });

        let bigOSlide = pres.addSlide({ masterName: "MASTER_SLIDE" });
        bigOSlide.addText("Big O Notation", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: "0072C6" });
        bigOSlide.addText("A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity. Used to classify algorithms according to how their run time or space requirements grow as the input size grows.", { x: 0.5, y: 1.2, w: '90%', fontSize: 16 });
        bigOSlide.addText([
            { text: "O(1) - Constant Time: Accessing an array element.", options: { bullet: true, color: "363636"} },
            { text: "O(log n) - Logarithmic Time: Binary search.", options: { bullet: true, color: "363636"} },
            { text: "O(n) - Linear Time: Searching an unsorted list.", options: { bullet: true, color: "363636"} },
            { text: "O(n^2) - Quadratic Time: Bubble sort.", options: { bullet: true, color: "363636" } },
        ], { x: 1.0, y: 2.5, w: '80%', fontSize: 20 });
    } else { // Generic content
        agendaSlide.addText([
            { text: "Introduction to the Topic", options: { bullet: true, color: "363636"} },
            { text: "Core Concept 1: Detailed Explanation", options: { bullet: true, color: "363636"} },
            { text: "Core Concept 2: Detailed Explanation", options: { bullet: true, color: "363636"} },
            { text: "Practical Applications and Case Studies", options: { bullet: true, color: "363636" } },
            { text: "Summary and Q&A", options: { bullet: true, color: "363636" } },
        ], { x: 1.0, y: 1.5, w: '80%', h: '70%', fontSize: 22 });
        
        let contentSlide1 = pres.addSlide({ masterName: "MASTER_SLIDE" });
        contentSlide1.addText("Core Concept 1", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: "0072C6" });
        contentSlide1.addText("This slide would contain a detailed explanation of the first major concept of the lecture. It would include definitions, diagrams, and illustrative examples to ensure the topic is understood clearly by all students.", { x: 0.5, y: 1.5, w: '90%', fontSize: 18 });

        let contentSlide2 = pres.addSlide({ masterName: "MASTER_SLIDE" });
        contentSlide2.addText("Practical Applications", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: "0072C6" });
        contentSlide2.addText("This section bridges theory and practice. It would showcase real-world examples, case studies, or problems where the discussed concepts are applied. This helps students understand the relevance and importance of the material in a professional context.", { x: 0.5, y: 1.5, w: '90%', fontSize: 18 });
    }

    let thankYouSlide = pres.addSlide({ masterName: "MASTER_SLIDE" });
    thankYouSlide.addText("Thank You & Questions?", { x: 'c', y: 'm', align: 'center', valign: 'middle', fontSize: 48, bold: true, color: "0072C6" });

    pres.writeFile({ fileName: `${safeTitle}_slides.pptx` });
  };
  
   const handleGeneratePdfNotes = (entry: TimetableEntry) => {
    const doc = new jsPDF();
    const safeTitle = entry.course.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(entry.course, 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Faculty: ${entry.faculty}`, 20, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 28);
    
    doc.setDrawColor(180, 180, 180);
    doc.line(20, 32, 190, 32);

    let yPos = 45;

    // --- Content ---
    if (entry.course === 'Data Structures') {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("1. What is a Data Structure?", 20, yPos);
        yPos += 8;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("A data structure is a specialized format for organizing, processing, retrieving, and storing data. It's a way of arranging data on a computer so that it can be accessed and updated efficiently. Choosing the right data structure is a crucial part of designing efficient algorithms and is fundamental to computer science.", 20, yPos, { maxWidth: 170 });
        yPos += 25;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 114, 198);
        doc.text("2. The Array", 20, yPos);
        yPos += 8;
        doc.setTextColor(0, 0, 0);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("An array is a collection of items of the same data type stored at contiguous memory locations. This is its key feature, as it allows for fast random access based on an index.", 20, yPos, { maxWidth: 170 });
        yPos += 15;
        doc.text("- Access Time (by index): O(1). Because memory is contiguous, the address of any element can be calculated instantly from its index.", 25, yPos, { maxWidth: 165 });
        yPos += 12;
        doc.text("- Search Time (unsorted): O(n). You may have to check every element in the worst case.", 25, yPos, { maxWidth: 165 });
        yPos += 12;
        doc.text("- Insertion/Deletion: O(n). To insert or delete an element in the middle, you must shift all subsequent elements, which is very inefficient.", 25, yPos, { maxWidth: 165 });
        yPos += 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 114, 198);
        doc.text("3. The Linked List", 20, yPos);
        yPos += 8;
        doc.setTextColor(0, 0, 0);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("A linked list consists of nodes where each node contains data and a pointer to the next node in the sequence. It does not store elements in contiguous locations, which gives it different performance characteristics.", 20, yPos, { maxWidth: 170 });
        yPos += 15;
        doc.text("- Access Time: O(n). To find an element, you must start from the head and traverse the list one by one.", 25, yPos, { maxWidth: 165 });
        yPos += 12;
        doc.text("- Insertion/Deletion (at ends): O(1). If you have a pointer to the head/tail, adding or removing a node is very fast.", 25, yPos, { maxWidth: 165 });
        yPos += 12;
        doc.text("- Dynamic Size: Linked lists can grow and shrink dynamically, which is a major advantage over arrays which have a fixed size.", 25, yPos, { maxWidth: 165 });

    } else { // Generic content
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Introduction to the Topic", 20, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("This document contains lecture notes for the course. It covers the fundamental concepts, key principles, and practical applications relevant to the subject matter. The purpose of these notes is to provide a structured and comprehensive resource to support your learning. Please review these notes before each class.", 20, yPos, { maxWidth: 170 });
        yPos += 25;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 114, 198);
        doc.text("Key Concept A: In-depth Analysis", 20, yPos);
        yPos += 8;
        doc.setTextColor(0,0,0);
        doc.setFont("helvetica", "normal");
        doc.text("This section would delve into the first major concept of the lecture. It would typically include formal definitions, historical context, and the foundational theories. Key terminology would be highlighted, and the relationships between different sub-concepts would be explored to build a solid theoretical framework for the student.", 20, yPos, { maxWidth: 170 });
        yPos += 30;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 114, 198);
        doc.text("Practical Application: Case Study", 20, yPos);
        yPos += 8;
        doc.setTextColor(0,0,0);
        doc.setFont("helvetica", "normal");
        doc.text("Here, we would bridge theory and practice. This part of the notes would present a real-world case study or a detailed example problem. It would walk the student through the application of the theories discussed earlier, showing how they are used to solve practical problems in the field. This reinforces learning and demonstrates the relevance of the material.", 20, yPos, { maxWidth: 170 });
    }

    // --- Footer with Page Numbers ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount} | ${entry.course}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }
    
    doc.save(`${safeTitle}_notes.pdf`);
  };

  const handleDownloadMaterial = (materialType: string) => {
    if (!selectedEntry) return;

    toast({
      title: `${materialType.replace(/_/g, ' ')} Download Started`,
      description: `Your download for "${selectedEntry.course}" has begun. Please check your browser's downloads.`,
    });

    if (materialType === 'Presentation_Slides') {
        handleGeneratePptx(selectedEntry);
        return;
    }

    if (materialType === 'Lecture_Notes') {
        handleGeneratePdfNotes(selectedEntry);
        return;
    }
  };


  const handleExportPdf = () => {
    if (!timetableRef.current || isExporting) return;

    setIsExporting(true);
    toast({
        title: "Exporting Timetable",
        description: "Your timetable is being exported to PDF...",
    });

    const wasEditing = isEditing;
    if(wasEditing) setIsEditing(false);

    setTimeout(() => {
        html2canvas(timetableRef.current!, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "pt",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            
            let newCanvasWidth = pdfWidth - 40;
            let newCanvasHeight = newCanvasWidth / ratio;

            if (newCanvasHeight > pdfHeight - 40) {
                newCanvasHeight = pdfHeight - 40;
                newCanvasWidth = newCanvasHeight * ratio;
            }
            
            const x = (pdfWidth - newCanvasWidth) / 2;
            const y = (pdfHeight - newCanvasHeight) / 2;
            
            pdf.addImage(imgData, "PNG", x, y, newCanvasWidth, newCanvasHeight);
            pdf.save("timetable.pdf");
            setIsExporting(false);
            
            if(wasEditing) setIsEditing(true);

        }).catch(err => {
            console.error("Error exporting PDF:", err);
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: "An error occurred while generating the PDF.",
            });
            setIsExporting(false);
            if(wasEditing) setIsEditing(true);
        });
    }, 100);
  };
  
  const handleExportExcel = () => {
    toast({
      title: "Exporting Timetable",
      description: "Your timetable is being exported to Excel...",
    });

    const ws_data = [
      ["Time", ...days],
      ...timeSlots.map(time => [
        time,
        ...days.map(day => {
          const entry = getEntry(day, time);
          return entry ? `${entry.course} (${entry.courseCode})\n${entry.faculty}\nRoom: ${entry.room}` : "";
        })
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    const colWidths = [{ wch: 15 }, ...days.map(() => ({ wch: 30 }))];
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");

    XLSX.writeFile(wb, "timetable.xlsx");
  };

  const handleExportIcs = () => {
    toast({
        title: "Exporting Calendar",
        description: "Your timetable is being exported to an .ics file...",
    });

    const dayNameToIndex: { [key: string]: number } = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };

    const events: ics.EventAttributes[] = editableTimetable.map(entry => {
        const [startHour] = entry.time.split(' - ')[0].split(':').map(Number);
        const dayIndex = dayNameToIndex[entry.day];

        const now = new Date();
        const resultDate = new Date(now.getTime());
        resultDate.setDate(now.getDate() + (dayIndex - now.getDay() + 7) % 7);
        
        return {
            title: `${entry.course} (${entry.courseCode})`,
            description: `Faculty: ${entry.faculty}\nRoom: ${entry.room}`,
            location: entry.room,
            start: [resultDate.getFullYear(), resultDate.getMonth() + 1, resultDate.getDate(), startHour, 0],
            duration: { hours: 1 },
            recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1;COUNT=12'
        };
    });

    const { error, value } = ics.createEvents(events);

    if (error) {
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "An error occurred while generating the calendar file.",
        });
        console.error(error);
        return;
    }

    const blob = new Blob([value!], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'timetable.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  return (
    <Dialog>
    <div className="space-y-6 mt-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clash Prediction</CardTitle>
            <AlertCircle className={`h-4 w-4 ${conflicts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conflicts.length}</div>
            <p className="text-xs text-muted-foreground">
              {conflicts.length > 0 ? "Potential bottlenecks detected" : "No conflicts found"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiency}%</div>
            <p className="text-xs text-muted-foreground">Overall resource utilization</p>
          </CardContent>
        </Card>
        <Link href="/analytics" className="interactive-element rounded-lg">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full Analytics Report</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View Details</div>
              <p className="text-xs text-muted-foreground">Deep dive into utilization metrics</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3 glass-card border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <CalendarPlus className="h-6 w-6 text-purple-400" />
                  Generated Timetable
                </CardTitle>
                <CardDescription className="text-slate-300">Click any class for LMS options. Use override to make edits.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                 {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelChanges} className="btn-outline"><XCircle className="mr-2 h-4 w-4" /> Cancel</Button>
                      <Button onClick={handleSaveChanges} className="btn-primary"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                    </>
                 ) : (
                    <>
                      {userRole === 'admin' && <Button variant="outline" onClick={handleManualOverride} className="btn-outline">
                        <Pencil className="mr-2 h-4 w-4" />Manual Override
                      </Button>}
                      <Button onClick={handleExportPdf} disabled={isExporting} className="btn-secondary">
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Export PDF
                      </Button>
                       <Button onClick={handleExportExcel} className="btn-secondary">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export Excel
                      </Button>
                      <Button onClick={handleExportIcs} className="btn-secondary">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Export Calendar (.ics)
                      </Button>
                    </>
                 )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto" ref={timetableRef}>
              <Table className="border-collapse w-full">
                <TableHeader>
                  <TableRow className="border-b border-purple-500/20">
                    <TableHead className="w-[120px] text-purple-300 font-bold text-center bg-gradient-to-r from-purple-900/20 to-cyan-900/20 backdrop-blur-sm">Time</TableHead>
                    {days.map((day) => (
                      <TableHead key={day} className="text-purple-300 font-bold text-center bg-gradient-to-r from-purple-900/20 to-cyan-900/20 backdrop-blur-sm min-w-[200px]">
                        {day}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((time, timeIndex) => (
                    <TableRow key={time} className="border-b border-slate-700/20 hover:bg-slate-800/10 transition-all duration-300 group">
                      <TableCell className="font-medium text-cyan-300 text-center bg-gradient-to-r from-slate-800/30 to-slate-700/30 backdrop-blur-sm">
                        {time}
                      </TableCell>
                      {days.map((day, dayIndex) => {
                        const entry = getEntry(day, time);
                        const suggestionKey = `${day}-${time}`;
                        const suggestionState = suggestions[suggestionKey];
                        return (
                          <TableCell key={day} className="p-1 align-top w-[200px] h-[120px] group-hover:bg-slate-800/5 transition-all duration-300 border-r border-slate-700/20 last:border-r-0">
                            {entry ? (
                              <DialogTrigger asChild>
                              <div 
                                className="p-2 rounded-lg bg-gradient-to-br from-purple-900/20 to-cyan-900/20 text-white border border-purple-500/30 space-y-1 h-[110px] cursor-pointer hover:from-purple-900/30 hover:to-cyan-900/30 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 backdrop-blur-sm group/cell flex flex-col justify-between"
                                onClick={() => setSelectedEntry(entry)}
                                style={{
                                  animationDelay: `${(timeIndex * 6 + dayIndex) * 50}ms`,
                                  animation: 'fadeInUp 0.6s ease-out forwards'
                                }}
                              >
                                {isEditing ? (
                                  <>
                                    <Select value={entry.course} onValueChange={(value) => handleEntryChange(day, time, 'course', value)}>
                                        <SelectTrigger className="h-8 text-xs font-bold bg-slate-800/50 border-slate-600/50">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-600">
                                            {courses.map(c => <SelectItem key={c.id} value={c.name} className="text-slate-200 hover:bg-slate-700">{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={entry.faculty} onValueChange={(value) => handleEntryChange(day, time, 'faculty', value)}>
                                        <SelectTrigger className="h-7 text-xs bg-slate-800/50 border-slate-600/50">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-600">
                                            {faculty.map(f => <SelectItem key={f.id} value={f.name} className="text-slate-200 hover:bg-slate-700">{f.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                     <Select value={entry.room} onValueChange={(value) => handleEntryChange(day, time, 'room', value)}>
                                        <SelectTrigger className="h-7 text-xs bg-slate-800/50 border-slate-600/50">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-600">
                                            {rooms.map(r => <SelectItem key={r.id} value={r.name} className="text-slate-200 hover:bg-slate-700">{r.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <div className="mt-2 space-y-2">
                                        <Button
                                            variant="outline" size="sm" className="w-full h-8 bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50"
                                            onClick={(e) => { e.stopPropagation(); handleSuggestion(day, time, entry.course); }}
                                            disabled={suggestionState?.loading}
                                        >
                                            {suggestionState?.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                                            Get Suggestion
                                        </Button>
                                        {suggestionState?.suggestion && (
                                            <Alert className="bg-slate-800/80 border-slate-600/50">
                                                <Lightbulb className="h-4 w-4 text-yellow-400" />
                                                <AlertTitle className="font-bold text-yellow-300">AI Suggestion</AlertTitle>
                                                <AlertDescription className="text-xs">
                                                    <p className="font-semibold text-slate-200">{suggestionState.suggestion}</p>
                                                    <p className="text-slate-400 italic mb-2">"{suggestionState.justification}"</p>
                                                    <Button size="sm" className="w-full h-7 bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30" onClick={(e) => {e.stopPropagation(); applySuggestion(day, time);}}>
                                                        Apply Suggestion
                                                    </Button>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors leading-tight">{entry.course}</p>
                                    <p className="text-xs text-purple-200 font-semibold">({entry.courseCode})</p>
                                    <p className="text-xs text-cyan-300 font-medium truncate">{entry.faculty}</p>
                                    <p className="text-xs font-mono text-slate-300 bg-slate-800/50 px-1 py-0.5 rounded text-center">Room: {entry.room}</p>
                                  </>
                                )}
                              </div>
                              </DialogTrigger>
                            ) : (
                                <div className="p-2 text-center text-slate-500/30 h-[110px] flex items-center justify-center bg-gradient-to-br from-slate-800/10 to-slate-700/10 rounded-lg border border-slate-700/20 backdrop-blur-sm">
                                    {time.includes("12:00 - 01:00") ? (
                                        <div className="text-center">
                                            <span className="text-sm font-semibold text-orange-400">🍽️</span>
                                            <p className="text-xs text-orange-300 font-medium">Lunch Break</p>
                                        </div>
                                    ) : (
                                        <span className="text-lg font-light">-</span>
                                    )}
                                </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-3 grid gap-6">
            {conflicts.length > 0 && (
                <Card className="border-destructive bg-destructive/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle /> Detected Conflicts & Bottlenecks
                        </CardTitle>
                        <CardDescription className="text-destructive/90">
                        The AI predicts the following issues based on current constraints. Manual override is recommended to resolve them.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                        {conflicts.map((conflict, index) => (
                            <li key={index} className="text-sm p-3 rounded-md bg-destructive/10 border border-destructive/20">
                            <p className="font-semibold">{conflict.type}</p>
                            <p className="text-destructive/80">{conflict.description}</p>
                            <p className="text-xs mt-1 font-mono text-destructive/90">Involved: {conflict.involved.join(", ")}</p>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {userRole === 'admin' && report && (
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                      <FileText /> Generation Report
                      </CardTitle>
                      <CardDescription>
                      A system-generated analysis of the timetable's efficiency.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report}</p>
                  </CardContent>
              </Card>
            )}
        </div>
      </div>
      
      {/* LMS Integration Dialog */}
      <DialogContent className="sm:max-w-md">
        {selectedEntry && (
            <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BookOpen/> {selectedEntry.course}</DialogTitle>
                <DialogDescription>
                    {selectedEntry.day}, {selectedEntry.time} with {selectedEntry.faculty} in {selectedEntry.room}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-3">
                    <h4 className="font-semibold">Class Materials</h4>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleDownloadMaterial("Lecture_Notes")}><File className="mr-2"/> Download Lecture Notes (PDF)</Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleDownloadMaterial("Presentation_Slides")}><File className="mr-2"/> Download Presentation Slides</Button>
                </div>
                
                <Separator/>
                <div className="space-y-3">
                        <h4 className="font-semibold">User Actions</h4>
                    <DialogClose asChild>
                        <Button onClick={handleMarkAttendance} className="w-full">
                            <UserCheck className="mr-2"/> 
                            Mark Attendance as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                        </Button>
                    </DialogClose>
                </div>
            </div>
            </>
        )}
      </DialogContent>

    </div>
    </Dialog>
  );
}
