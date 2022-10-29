import { Request, Response, NextFunction } from 'express';
import UnauthorizedError from '../express/errors/UnauthorizedError';
import { AuthenticatedRequest, UserTokenPayload } from '../express/types';
import { firebaseAuth } from './FirebaseApp';

function firebaseAuthMiddleware(routes: string[]) {
  return async function (request: Request | AuthenticatedRequest, response: Response, next: NextFunction) {
    try {
      if (routes.includes(request.path)) {
        return next();
      }

      if (!request.headers.authorization) throw new UnauthorizedError();

      const [type, token] = request.headers.authorization.split(' ');

      if (type !== 'Bearer' || !token) throw new UnauthorizedError();

      const decodedToken = await firebaseAuth.verifyIdToken(token);

      const user: UserTokenPayload = {
        id: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role,
      };

      (request as AuthenticatedRequest).user = user;

      next();
    } catch (error: any) {
      if (error.errorInfo && error.errorInfo.code && error.errorInfo.code === 'auth/id-token-expired') {
        return next(new UnauthorizedError());
      }

      next(error);
    }
  };
}

export default firebaseAuthMiddleware;
