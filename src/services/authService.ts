import argon2  from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/index';
import { signAccessToken, signRefreshToken, verifyToken } from '../helpers/jwtHelper';
import { blacklistToken, isBlacklisted }  from '../utils/tokenBlacklist';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../utils/errors';

export async function register(email: string, displayName: string, password: string) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const hashed = await argon2.hash(password);

  const user = await User.create({
    id: uuidv4(),
    email,
    displayName,
    password:    hashed,
    isDeleted:   false,
  });

  const tokens = issueTokens(user);
  return { user: sanitize(user), ...tokens };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ where: { email, isDeleted: false } });

  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await argon2.verify(user.password, password);
  if (!valid)  throw new UnauthorizedError('Invalid email or password');

  const tokens = issueTokens(user);
  return { user: sanitize(user), ...tokens };
}

export async function refresh(refreshToken: string) {
  if (isBlacklisted(refreshToken)) {
    throw new UnauthorizedError('Refresh token has been invalidated. Please log in again.');
  }

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await User.findOne({ where: { id: payload.sub, isDeleted: false } });
  if (!user) throw new UnauthorizedError('User no longer exists');

  blacklistToken(refreshToken, payload.exp!);

  return issueTokens(user);
}

export async function logout(token: string, tokenExp: number) {
  blacklistToken(token, tokenExp);
}

export async function getSignedInUser(userId: string) {
  const user = await User.findOne({ where: { id: userId, isDeleted: false } });
  if (!user) throw new NotFoundError('User', userId);
  return sanitize(user);
}

export async function getAllUsers() {
  const users = await User.findAll({
    where:      { isDeleted: false },
    attributes: { exclude: ['password'] },
  });
  return users;
}

export async function getUserById(userId: string) {
  const user = await User.findOne({
    where:      { id: userId, isDeleted: false },
    attributes: { exclude: ['password'] },
  });
  if (!user) throw new NotFoundError('User', userId);
  return user;
}

function issueTokens(user: User) {
  const payload = { sub: user.id, email: user.email! };
  return {
    accessToken:  signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

function sanitize(user: User) {
  const { password, ...safe } = user.toJSON();
  return safe;
}