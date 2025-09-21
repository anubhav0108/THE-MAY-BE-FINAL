
import { z } from 'zod';
import { TimetableEntrySchema, ConflictSchema } from '@/lib/types';

export const GenerateTimetableInputSchema = z.object({
  studentData: z.string().describe('Student data in JSON format, including elective choices and enrolled credits.'),
  facultyData: z.string().describe('Faculty data in JSON format.'),
  courseData: z.string().describe('A list of ALL available courses in JSON format. The AI will filter this based on the `programs` field.'),
  roomData: z.string().describe('Room data in JSON format, including capacity.'),
  constraints: z.string().describe('Constraints in JSON format. This includes faculty workload, availability, and expertise; room/lab availability; and schedules for teaching practice, field work, internships, etc.'),
  programs: z.array(z.string()).optional().describe('An array of specific programs to generate the timetable for (e.g., ["B.Ed.", "FYUP"]). If not provided, schedule courses for all programs.'),
  days: z.array(z.string()).optional().describe('An array of specific days to generate the timetable for (e.g., ["Monday", "Tuesday"]). If not provided, schedule for all 6 days.'),
  existingTimetable: z.string().optional().describe('An optional JSON string of an existing timetable. If provided, the AI should add to or modify this timetable without removing existing entries unless necessary to resolve a conflict for a newly scheduled class.')
});

export const GenerateTimetableOutputSchema = z.object({
  timetable: z.array(TimetableEntrySchema).describe('The generated timetable as an array of schedule entry objects.'),
  conflicts: z.array(ConflictSchema).describe('Any scheduling conflicts detected, as an array of conflict objects.'),
  report: z.string().describe('A report on timetable efficiency and resource utilization, or an explanation for failure.'),
});
