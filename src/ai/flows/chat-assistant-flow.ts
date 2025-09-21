
/**
 * @fileOverview Defines the Genkit flow and schema for the AI chat assistant.
 *
 * - chatAssistantFlow - The Genkit flow for the chat assistant.
 * - ChatAssistantInputSchema - The Zod schema for the flow's input.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ChatAssistantInputSchema = z.object({
  query: z.string().describe("The user's question or message."),
  timetable: z.string().describe('The current timetable data in JSON format.'),
  students: z.string().describe('A list of all students in JSON format.'),
  faculty: z.string().describe('A list of all faculty members in JSON format.'),
  courses: z.string().describe('A list of all available courses in JSON format.'),
  rooms: z.string().describe('A list of all available rooms in JSON format.'),
  results: z.string().describe('A list of all student results/grades in JSON format.'),
  quizzes: z.string().describe('A list of all student quiz marks in JSON format.'),
  alumni: z.string().describe('A list of all alumni records in JSON format.'),
  library: z.string().describe('A list of all library books in JSON format.'),
  editorials: z.string().describe('A list of all college editorials in JSON format.'),
  problemStatement: z.string().describe('The problem statement and goals of the Timetable Ace application.'),
  auditLogs: z.string().describe('A list of all system audit logs in JSON format.'),
});

const chatPrompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: ChatAssistantInputSchema },
  prompt: `You are "Timetable Ace Assistant," a friendly and highly capable AI academic assistant for the Timetable Ace application. Your personality is helpful, knowledgeable, and slightly formal. Your answers should be detailed and thorough, but also concise and to the point—avoiding both overly brief and unnecessarily long responses.

Your first and most critical task is to analyze the user's query for any phonetic or keyboard-based misspellings and reinterpret it based on the most likely intended meaning before proceeding. For example, if the user asks "wohare yu" or "tel me abt arav shrma", you must understand this as "who are you" or "tell me about Aarav Sharma".

Once you understand the query's true intent, decide how to answer:
- If the question is a general conversational query (e.g., "who are you?", "what is the capital of France?"), answer it directly from your own knowledge in a natural, conversational way.
- If the question is about the institution, use the provided JSON data below to find the answer. Be thorough and precise. If you use the data, mention it (e.g., "According to the course catalog...").

**Institutional Data:**
- Timetable: {{{timetable}}}
- Students: {{{students}}}
- Faculty: {{{faculty}}}
- Courses: {{{courses}}}
- Rooms: {{{rooms}}}
- Results/Grades: {{{results}}}
- Quiz Marks: {{{quizzes}}}
- Alumni Records: {{{alumni}}}
- Library Books: {{{library}}}
- Editorials: {{{editorials}}}
- Audit Logs: {{{auditLogs}}}
- Project Details: {{{problemStatement}}}
- Current Date for reference: ${new Date().toString()}

User Query: {{{query}}}
`,
});

export const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { text } = await chatPrompt(input);
    return text;
  }
);
