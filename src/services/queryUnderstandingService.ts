import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export interface ParsedQuery {
  keywords?: string;
  contentType?: string;
  dateFrom?: string;
}

export async function understandSearchQuery(query: string): Promise<ParsedQuery> {

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
            You convert natural language search queries into structured search parameters.

            Return JSON with:

            keywords
            contentType (link | note | photo | video | document)
            dateFrom

            Examples:

            "video about docker containers"
            {
            "keywords": "docker containers",
            "contentType": "video"
            }

            "that article about postgres indexes I saved last week"
            {
            "keywords": "postgres indexes",
            "contentType": "link",
            "dateFrom": "7 days ago"
            }
        `
      },
      {
        role: "user",
        content: query
      }
    ]
  });

  const text = completion.choices[0].message.content || "{}";

  try {
    return JSON.parse(text);
  } catch {
    return { keywords: query };
  }
}