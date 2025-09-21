
'use server';

/**
 * @fileOverview Generates an optimized timetable using an intelligent algorithm based on imported data and defined constraints.
 *
 * - generateTimetable - A function that generates an optimized timetable and an analysis report in a single call.
 * - GenerateTimetableInput - The input type for the generateTimetable function.
 * - GenerateTimetableOutput - The return type for the generateTimetable function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateTimetableOutputSchema, GenerateTimetableInputSchema } from '@/lib/timetable/schemas';


export type GenerateTimetableInput = z.infer<typeof GenerateTimetableInputSchema>;
export type GenerateTimetableOutput = z.infer<typeof GenerateTimetableOutputSchema>;

const generationPrompt = ai.definePrompt({
  name: 'timetableGenerationPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateTimetableInputSchema },
  output: { schema: GenerateTimetableOutputSchema },
  prompt: `You are a master scheduler AI. Your task is to generate a conflict-free, weekly academic timetable and then immediately write a detailed analysis report on the schedule you just created.

You will be given the following data as JSON strings:
- Student Data: {{studentData}}
- Faculty Data: {{facultyData}}
- ALL Course Data: {{courseData}}
- Room Data: {{roomData}}
- Scheduling Constraints: {{constraints}}
- Programs to Schedule For (optional): {{{programs}}}
- Days to Schedule For (optional): {{{days}}}
- Existing Timetable (optional, for modification): {{{existingTimetable}}}

The timetable runs for 7 time slots per day: "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 01:00 (Lunch Break)", "02:00 - 03:00", "03:00 - 04:00", and "04:00 - 05:00".
The default days are Monday to Friday (5 days). If the 'days' array is provided, only schedule classes on those specific days.

**CRITICAL: The timetable must be structured as a grid with:**
- Rows: Time slots (7 rows total)
- Columns: Days of the week (5 columns: Monday, Tuesday, Wednesday, Thursday, Friday)
- Each cell contains course information for that specific day and time slot

**MANDATORY: DIVERSIFIED SCHEDULING:**
- EVERY time slot (except lunch break) MUST have a class scheduled
- NO empty slots or free periods are allowed
- **CRITICAL: Create a DIVERSE schedule with multiple different courses**
- **DO NOT repeat the same course in every slot - use different courses for variety**
- Distribute courses evenly across days and time slots
- The lunch break (12:00 - 01:00) is the ONLY exception and should remain empty

**IMPORTANT: Day Selection Logic:**
- If the 'days' array contains specific days (e.g., ["Monday"]), ONLY generate timetable entries for those specific days
- If the 'days' array is empty or contains all 5 days, generate for all days
- DO NOT generate entries for days not specified in the 'days' array

**Your Task is a two-step process:**

**Step 1: Generate the Timetable**
Adhere to these rules with absolute precision:
1.  **Filter Courses by Program**: If a \`programs\` array is provided (e.g., ["B.Ed.", "FYUP"]), you MUST first filter the \`courseData\` to get ONLY the courses associated with those programs. You will then generate a schedule for THIS SUBSET of courses. If \`programs\` is empty or not provided, you will schedule ALL courses from \`courseData\`.
2.  **Modify, Don't Erase:** If an \`existingTimetable\` is provided, you must treat it as the source of truth. Your job is to ADD the new courses (from your filtered program list) to this existing schedule. DO NOT remove or alter existing entries unless it's absolutely necessary to resolve a high-priority conflict for a course you are newly adding.
3.  **No Double Bookings (Highest Priority):** A faculty member, a student group (based on their enrolled courses), or a room cannot be in two places at once.
4.  **Constraint Adherence:** Strictly enforce faculty availability, room capacity, course requirements (e.g., labs), and any program-specific time blocks (like internships or teaching practice).
5.  **Create a Dense Schedule:** Your goal is to create a highly utilized and efficient schedule. Fill as many slots as possible for the requested courses and days. An empty timetable is a failure unless no courses were requested.
6.  **COURSE DIVERSITY (CRITICAL):** You MUST use DIFFERENT courses across the timetable. Do NOT schedule the same course repeatedly. Rotate through available courses to create variety.
7.  **Conflict Logging:** If a conflict is unavoidable when adding a new class, schedule one class and log the other in the \`conflicts\` array. Do not simply leave a slot empty if a conflict is the reason.
8.  **Day-Specific Scheduling:** If a 'days' array is provided, only place new classes on those days.

**Step 2: Generate the Analysis Report**
After generating the timetable, immediately write a detailed analysis report in the \`report\` field of the JSON output. This report MUST include:
1.  **Summary of Changes:** If you modified an existing timetable, briefly state what you added (e.g., "Successfully scheduled 12 courses for the B.Ed. and ITEP programs on Monday and Wednesday.").
2.  **Constraint Adherence Verification:** Explicitly confirm how you followed key constraints for the NEWLY ADDED classes.
3.  **Faculty Workload Analysis:** Provide a quantitative breakdown of hours assigned to several key faculty members vs. their expected workload.
4.  **Resource Utilization Analysis:** Calculate and state the overall room utilization percentage and identify peak/off-peak hours.
5.  **Actionable Recommendations:** Provide specific suggestions for improvement.

**Fallback Protocol:**
If you cannot schedule any of the requested courses due to a fundamental contradiction, return the \`existingTimetable\` unmodified (if provided), leave the \`timetable\` array otherwise empty, and use the \`report\` field to explain the exact reason for the failure. **Do not error out.**

**Final Output:**
The timetable array must contain entries with this exact structure:
- Each entry must have: day (Monday-Saturday), time (matching the 7 time slots), course, courseCode, faculty, room
- Generate entries ONLY for the days specified in the 'days' array
- Generate entries for ALL 7 time slots for each selected day
- The 12:00 - 01:00 slot should be marked as "Lunch Break" and left empty
- ALL OTHER time slots MUST have classes scheduled - NO FREE SLOTS ALLOWED
- If only specific days are selected (e.g., ["Monday"]), only generate entries for those days
- Repeat courses if necessary to fill all available slots
- Your response MUST be a single, valid JSON object containing \`timetable\`, \`conflicts\`, and \`report\` keys.
`,
});


export const generateTimetableFlow = ai.defineFlow(
  {
    name: 'generateTimetableFlow',
    inputSchema: GenerateTimetableInputSchema,
    outputSchema: GenerateTimetableOutputSchema,
  },
  async (input) => {
    const constraintsObject = JSON.parse(input.constraints);
    
    // Inject the current date into the constraints object to allow the AI to handle date-range constraints.
    constraintsObject.currentDate = new Date().toISOString();

    const updatedInput = {
      ...input,
      constraints: JSON.stringify(constraintsObject, null, 2), // Pretty-print for AI readability
    };
    
    const { output } = await generationPrompt(updatedInput);
    
    if (!output) {
        throw new Error("AI model returned no output.");
    }
    
    // Ensure the output conforms to the schema, even if the model messes up.
    // This provides a resilient structure that the frontend can always handle.
    return {
        timetable: output.timetable || [],
        conflicts: output.conflicts || [],
        report: output.report || "The AI model failed to generate a report, but the timetable (if any) is provided.",
    };
  }
);


export async function generateTimetable(input: GenerateTimetableInput): Promise<GenerateTimetableOutput> {
  try {
    const result = await generateTimetableFlow(input);
    return result;
  } catch (error) {
    console.error("Error in generateTimetable:", error);
    throw new Error(`Timetable generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
