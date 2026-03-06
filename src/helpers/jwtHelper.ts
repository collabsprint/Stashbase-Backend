import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET        = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
const JWT_EXPIRES_IN    = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_IN    = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JwtPayload {
  sub:   string; // userId
  email: string;
  iat?:  number;
  exp?:  number;
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
}

export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_IN } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}