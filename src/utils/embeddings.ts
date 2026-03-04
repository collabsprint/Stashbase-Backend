import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || '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',
  baseURL: "https://api.groq.com/openai/v1"
});

export async function generateEmbedding(text: string): Promise<number[]> {

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}