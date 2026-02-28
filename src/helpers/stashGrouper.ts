import { ContentType } from '../types';

export function groupStashesByType(stashes: any[]): Partial<Record<ContentType, any[]>> {
  const groups: Partial<Record<ContentType, any[]>> = {};

  for (const stash of stashes) {
    const type = stash.contentType as ContentType;
    if (!groups[type]) groups[type] = [];
    groups[type]!.push(stash);
  }

  return groups;
}