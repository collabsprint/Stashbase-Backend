export async function generateAITags(text: string): Promise<string[]> {

  const response = await fetch(
    "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
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

  const output =
    data?.[0]?.generated_text ||
    "[]";

  try {
    const start = output.indexOf("[");
    const end = output.lastIndexOf("]") + 1;
    return JSON.parse(output.slice(start, end));
  } catch {
    return [];
  }
}