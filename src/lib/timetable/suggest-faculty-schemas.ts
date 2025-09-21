
import { z } from 'zod';

export const SuggestFacultyInputSchema = z.object({
  course: z.string().describe('The course for which to suggest a faculty member, in JSON format.'),
  facultyData: z.string().describe('A list of all available faculty members, in JSON format.'),
  timetable: z.string().describe('The current state of the timetable, to check for availability, in JSON format.'),
});

export const SuggestFacultyOutputSchema = z.object({
  facultyName: z.string().describe('The name of the suggested faculty member.'),
  justification: z.string().describe('A brief explanation for why this faculty member was suggested, considering expertise, workload, and student feedback.'),
});
