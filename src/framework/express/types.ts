import { Request } from 'express';
import { UserId } from '../domain/types';

export type UserTokenPayload = {
  id: UserId;
  email?: string;
  role?: string;
};

export type AccessTokenPayload = {
  user: UserTokenPayload;
};

export type AuthenticatedRequest = Request & AccessTokenPayload;
