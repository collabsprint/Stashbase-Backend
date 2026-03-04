export async function generateAITags(text: string): Promise<string[]> {

  const response = await fetch(
    "https://api-inference.huggingface.co/models/google/flan-t5-large",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `
            You are a tagging engine.

            Extract 3-6 concise tags describing the content.

            Rules:
            - single or two words
            - lowercase
            - no punctuation
            - return JSON array only

            Content:
            ${text}
                    `
                })
                }
            );

  const data = await response.json() as any;

  const output = data?.generated_text ?? data?.[0]?.generated_text ?? '[]';

  try {
    const start = output.indexOf('[');
    const end   = output.lastIndexOf(']') + 1;
    if (start === -1) {
      return output.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean).slice(0, 6);
    }
    return JSON.parse(output.slice(start, end));
  } catch {
    return [];
  }
}