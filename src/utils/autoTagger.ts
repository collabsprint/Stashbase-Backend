import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function generateAITags(text: string): Promise<string[]> {

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
            You are a tagging engine.

            Extract 3-6 concise tags describing the content.

            Rules:
            - single or two words
            - lowercase
            - no punctuation
            - return JSON array only
          `
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.2
  });

  const content = response.choices[0].message.content || "[]";

  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}