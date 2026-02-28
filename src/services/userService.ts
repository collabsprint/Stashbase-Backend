import { User } from '../models/index';
import { logger } from '../utils/logger';

interface LogtoClaims {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function syncUserFromClaims(claims: LogtoClaims): Promise<User> {
  const [user, created] = await User.findOrCreate({
    where: { id: claims.sub },
    defaults: {
      id: claims.sub,
      email: claims.email ?? null,
      displayName: claims.name ?? null,
    },
  });

  if (!created) {
    await user.update({
      email: claims.email ?? user.email,
      displayName: claims.name ?? user.displayName,
    });
  }

  if (created) logger.info({ userId: claims.sub }, '[userSync] new user provisioned');
  return user;
}