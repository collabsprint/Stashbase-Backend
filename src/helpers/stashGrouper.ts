import { ContentType, TagName } from '../types';

const tagToType: Record<TagName, ContentType> = {
  [TagName.WEBSITE]: ContentType.LINK,
  [TagName.NOTE]: ContentType.NOTE,
  [TagName.VIDEO]: ContentType.VIDEO,
  [TagName.PHOTO]: ContentType.PHOTO,
  [TagName.DOCUMENT]: ContentType.DOCUMENT,
};

export function groupStashesByType(stashes: any[]): Partial<Record<ContentType, any[]>> {
  const groups: Partial<Record<ContentType, any[]>> = {};

  for (const stash of stashes) {
    let type = stash.contentType as ContentType;

    const tags: Array<{ name: string }> = stash.Tags || stash.tags || [];
    for (const t of tags) {
      const mapped = tagToType[t.name as TagName];
      if (mapped) {
        type = mapped;
        break;
      }
    }

    if (!groups[type]) groups[type] = [];
    groups[type]!.push(stash);
  }

  return groups;
}