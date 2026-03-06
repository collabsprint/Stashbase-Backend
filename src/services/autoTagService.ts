import { generateAITags } from '../helpers/aiHelpers';
import { logger } from '../utils/logger';

export async function autoTagStash(stash: any) {
  const text = [
    stash.title,
    stash.metadata?.description,
    stash.metadata?.extractedText,
    stash.metadata?.content,
  ].filter(Boolean).join(' ');

  logger.info(`[autotag] stash=${stash.id} text="${text.slice(0, 100)}"`);

  if (!text) {
    logger.warn(`[autotag] No text to tag for stash ${stash.id}`);
    return;
  }

  const tags = await generateAITags(text);

  logger.info(`[autotag] stash=${stash.id} generated tags=${JSON.stringify(tags)}`);
  
  if (!tags.length) {
    logger.warn(`[autotag] No tags generated for stash ${stash.id}`);
    return;
  }

  await stash.update({
    metadata: { ...stash.metadata, aiTags: tags },
  });

  logger.info(`[autotag] stash=${stash.id} saved aiTags successfully`);
}