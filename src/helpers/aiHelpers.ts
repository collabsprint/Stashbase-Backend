import { logger } from '../utils/logger';

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const EMBEDDING_URL = `https://generativelanguage.googleapis.com/v1beta/models/embedding-004:embedContent?key=${GEMINI_API_KEY}`;


async function geminiGenerate(prompt: string): Promise<string> {
  const response = await fetch(GEMINI_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json() as any;
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(EMBEDDING_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:   'models/text-embedding-004',
      content: { parts: [{ text }] },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini embedding error ${response.status}: ${err}`);
  }

  const data = await response.json() as any;
  return data?.embedding?.values ?? [];
}


export async function generateAITags(text: string): Promise<string[]> {
  try {
    const output = await geminiGenerate(`
    You are a tagging engine. Extract 3-6 concise tags describing the content.

    Rules:
    - single or two words each
    - lowercase
    - no punctuation
    - return a JSON array of strings only, no explanation

    Content:
    ${text.slice(0, 1000)}

    Tags:`);

    const start = output.indexOf('[');
    const end   = output.lastIndexOf(']') + 1;

    if (start === -1) {
      // Gemini sometimes returns comma-separated instead of JSON
      return output.split(',')
        .map((t: string) => t.trim().toLowerCase().replace(/[^\w\s]/g, ''))
        .filter(Boolean)
        .slice(0, 6);
    }

    return JSON.parse(output.slice(start, end));
  } catch (err) {
    logger.warn(`[generateAITags] Failed: ${err}`);
    return [];
  }
}

export interface ParsedQuery {
  keywords?:    string;
  contentType?: string;
  dateFrom?:    string;
}

export async function understandSearchQuery(query: string): Promise<ParsedQuery> {
  try {
    const output = await geminiGenerate(`
        Convert this search query into a JSON object with these optional fields:
        - keywords: the main search terms
        - contentType: one of (link | note | photo | video | document)
        - dateFrom: relative date like "7 days ago" if mentioned

        Return ONLY a valid JSON object, no explanation.

        Examples:
        "videos about docker" → {"keywords":"docker","contentType":"video"}
        "article about postgres I saved last week" → {"keywords":"postgres","contentType":"link","dateFrom":"7 days ago"}

        Query: ${query}

        JSON:`
    );

    const start = output.indexOf('{');
    const end   = output.lastIndexOf('}') + 1;

    if (start === -1) return { keywords: query };
    return JSON.parse(output.slice(start, end));
  } catch (err) {
    logger.warn(`[understandSearchQuery] Failed: ${err}`);
    return { keywords: query }; 
  }
}