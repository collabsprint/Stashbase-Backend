import axios from "axios";

export async function generateEmbedding(text: string): Promise<number[]> {

  const response = await axios.post(
    "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
    { inputs: text },
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      },
    }
  );

  return response.data[0];
}