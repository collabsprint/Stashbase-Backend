export interface ParsedQuery {
  keywords?: string;
  contentType?: string;
  dateFrom?: string;
}

export async function understandSearchQuery(query: string): Promise<ParsedQuery> {

  const response = await fetch(
    'https://api-inference.huggingface.co/models/google/flan-t5-large',
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `
          You convert natural language search queries into structured search parameters.

          Return ONLY JSON with fields:

          keywords
          contentType (link | note | photo | video | document)
          dateFrom

          Examples:

          video about docker containers
          {"keywords":"docker containers","contentType":"video"}

          that article about postgres indexes I saved last week
          {"keywords":"postgres indexes","contentType":"link","dateFrom":"7 days ago"}

          User query:
          ${query}
                  `
                })
              }
            );

  const data = await response.json() as any;
  const text = data?.generated_text ?? data?.[0]?.generated_text ?? '{}';

  try {
    const start = text.indexOf('{');
    const end   = text.lastIndexOf('}') + 1;
    return JSON.parse(text.slice(start, end));
  } catch {
    return { keywords: query };
  }
}