
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Load environment variables from .env.local
import { config } from 'dotenv';
import path from 'path';

// Load .env.local file
config({ path: path.resolve(process.cwd(), '.env.local') });

// Also try loading from .env
config();

// Get API key with fallback
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyBa2O5W3Ls-j8d24mdihqniTdGlLZJ7z8U';

console.log('API Key loaded:', apiKey ? 'Yes' : 'No');
console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'None');

export const ai = genkit({
  plugins: [googleAI({ apiKey })],
});
