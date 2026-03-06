import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
  const { email, displayName, password } = req.body;
  const result = await authService.register(email, displayName, password);
  res.status(201).json({ success: true, data: result });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
};

export const logout = async (req: Request, res: Response) => {
  const token    = (req as any).token    as string;
  const tokenExp = (req as any).tokenExp as number;
  await authService.logout(token, tokenExp);
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getSignedInUser = async (req: Request, res: Response) => {
  const user = await authService.getSignedInUser(req.userId!);
  res.json({ success: true, data: user });
};

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await authService.getAllUsers();
  res.json({ success: true, data: users });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.params.id as string);
  res.json({ success: true, data: user });
};