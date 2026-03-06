import { logger } from '../utils/logger';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-haiku-4-5';

async function claudeGenerate(prompt: string, maxTokens = 256): Promise<string> {
  const response = await fetch(CLAUDE_URL, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json() as any;
  return data?.content?.[0]?.text ?? '';
}

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_URL     = 'https://api.cohere.ai/v1/embed';

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(COHERE_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${COHERE_API_KEY}`,
    },
    body: JSON.stringify({
      model:           'embed-english-light-v3.0',
      texts:           [text],
      input_type:      'search_document',
      truncate:        'END',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cohere embedding error ${response.status}: ${err}`);
  }

  const data = await response.json() as any;
  return data?.embeddings?.[0] ?? [];
}

export async function generateAITags(text: string): Promise<string[]> {
  try {
    const output = await claudeGenerate(`
Extract 3-6 concise tags describing this content.

Rules:
- single or two words each
- lowercase
- no punctuation
- return a JSON array of strings ONLY, no explanation, no markdown

Content:
${text.slice(0, 1000)}

Return only the JSON array:`);

    const start = output.indexOf('[');
    const end   = output.lastIndexOf(']') + 1;

    if (start === -1) {
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
    const output = await claudeGenerate(`
Convert this search query into a JSON object with these optional fields:
- keywords: the main search terms
- contentType: one of (link | note | photo | video | document)
- dateFrom: relative date like "7 days ago" if mentioned

Return ONLY a valid JSON object, no explanation, no markdown.

Examples:
"videos about docker" → {"keywords":"docker","contentType":"video"}
"article about postgres I saved last week" → {"keywords":"postgres","contentType":"link","dateFrom":"7 days ago"}

Query: ${query}

JSON:`);

    const start = output.indexOf('{');
    const end   = output.lastIndexOf('}') + 1;

    if (start === -1) return { keywords: query };
    return JSON.parse(output.slice(start, end));
  } catch (err) {
    logger.warn(`[understandSearchQuery] Failed: ${err}`);
    return { keywords: query };
  }
}