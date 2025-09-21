
import { z } from 'zod';
import type { ReactNode, ElementType } from 'react';

export const TimetableEntrySchema = z.object({
  day: z.string(),
  time: z.string(),
  course: z.string(),
  faculty: z.string(),
  room: z.string(),
  courseCode: z.string(),
});
export type TimetableEntry = z.infer<typeof TimetableEntrySchema>;

export const ConflictSchema = z.object({
  type: z.string(),
  description: z.string(),
  involved: z.array(z.string()),
});
export type Conflict = z.infer<typeof ConflictSchema>;


export type TimetableGenerationResult = {
  timetable: TimetableEntry[];
  conflicts: Conflict[];
  report: string;
};

export const StudentSchema = z.object({
  id: z.string(),
  name: z.string(),
  branch: z.string(),
  year: z.number(),
  major: z.string(),
  minor: z.string(),
  electiveChoices: z.array(z.string()),
  enrolledCredits: z.number(),
  preferredTimeSlots: z.optional(z.array(z.string())),
});
export type Student = z.infer<typeof StudentSchema>;

export const FacultySchema = z.object({
  id: z.string(),
  name: z.string(),
  department: z.string(),
  almaMater: z.string(),
  specialization: z.string(),
  workload: z.number(),
  studentFeedback: z.number(),
});
export type Faculty = z.infer<typeof FacultySchema>;

export const CourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  credits: z.number(),
  type: z.enum(['Theory', 'Practical', 'Hybrid']),
  category: z.enum(['Major', 'Minor', 'Skill', 'ValueAdded', 'Common']),
  capacity: z.number(),
  program: z.string().describe('The program this course belongs to, e.g., "B.Ed.", "FYUP", "Computer Science"'),
});
export type Course = z.infer<typeof CourseSchema>;

export const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  type: z.enum(['Lab', 'Lecture']),
});
export type Room = z.infer<typeof RoomSchema>;

export type Alumni = {
  id: string;
  name: string;
  passOutYear: number;
  achievement: string;
};

export type StudentResult = {
  id: string;
  studentName: string;
  studentId: string;
  branch: string;
  semester: number;
  sgpa: number;
  cgpa: number;
};

export type QuizMark = {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  quizNumber: number;
  marks: number;
  totalMarks: number;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  availableCopies: number;
  coverImageId: string;
};

export type Editorial = {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  coverImageId: string;
  excerpt: string;
};

export type Notification = {
  icon: ElementType;
  title: string;
  description: string;
  date: Date;
};

export type AuditLogInput = {
    user: string;
    role: 'admin' | 'faculty' | 'student';
    action: 'TIMETABLE_UPDATE' | 'CONSTRAINT_CHANGE' | 'DATA_IMPORT' | 'USER_LOGIN' | 'ATTENDANCE_MARKED';
    details: string;
}

export type AuditLog = AuditLogInput & {
    id: string;
    timestamp: string;
}
