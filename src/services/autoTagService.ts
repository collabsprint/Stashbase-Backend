import { Tag } from '../models';
import { generateAITags } from '../utils/autoTagger';

export async function autoTagStash(stash: any) {

  const text = [
    stash.title,
    stash.metadata?.description,
    stash.metadata?.extractedText
  ].filter(Boolean).join(" ");

  if (!text) return;

  const tags = await generateAITags(text);

  if (!tags.length) return;

  const tagModels = [];

  for (const tagName of tags) {

    const [tag] = await Tag.findOrCreate({
      where: { name: tagName.toLowerCase() }
    });

    tagModels.push(tag);

  }

  await stash.setTags(tagModels);

}