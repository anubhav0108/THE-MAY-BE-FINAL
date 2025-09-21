'use server';
/**
 * @fileOverview Suggests an optimal faculty member for a given course.
 * 
 * - suggestFaculty - A function that suggests a faculty member.
 * - SuggestFacultyInput - The input type for the suggestFaculty function.
 * - SuggestFacultyOutput - The return type for the suggestFaculty function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SuggestFacultyInputSchema, SuggestFacultyOutputSchema } from './suggest-faculty-schemas';

export type SuggestFacultyInput = z.infer<typeof SuggestFacultyInputSchema>;
export type SuggestFacultyOutput = z.infer<typeof SuggestFacultyOutputSchema>;

const suggestionPrompt = ai.definePrompt({
    name: 'suggestFacultyPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: SuggestFacultyInputSchema },
    output: { schema: SuggestFacultyOutputSchema },
    prompt: `You are an intelligent academic advisor. Your task is to recommend the best faculty member to teach a specific course based on several criteria.

**Input Data:**
- Course: {{course}}
- All Faculty Data: {{facultyData}}
- Current Timetable (for checking availability): {{timetable}}

**Your Goal:**
1.  **Analyze Faculty:** Evaluate all available faculty members against the following criteria for the given course:
    *   **Expertise:** The faculty member's specialization should align with the course subject. This is the most important factor.
    *   **Workload:** Prefer faculty with a lower current workload (fewer hours already assigned in the timetable).
    *   **Student Feedback:** Prefer faculty with higher student feedback scores.
    *   **Availability:** The faculty member must not have another class scheduled at the same time in the provided timetable.

2.  **Recommend One Faculty Member:** Based on your analysis, select the single best candidate.

3.  **Provide Justification:** Give a concise, one-sentence justification for your recommendation, highlighting the key reasons (e.g., "Dr. Smith is the top choice due to his specialization in Algorithms and high student feedback score.").

**Output Format:**
You must return a single JSON object with two keys: \`facultyName\` and \`justification\`.
`,
});

const suggestFacultyFlow = ai.defineFlow(
    {
        name: 'suggestFacultyFlow',
        inputSchema: SuggestFacultyInputSchema,
        outputSchema: SuggestFacultyOutputSchema,
    },
    async (input) => {
        const { output } = await suggestionPrompt(input);
        return output!;
    }
);

export async function suggestFaculty(input: SuggestFacultyInput): Promise<SuggestFacultyOutput> {
    return await suggestFacultyFlow(input);
}
