// jwt.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Middleware logic, e.g., checking JWT in the request

    // Call next() to pass control to the next middleware or route handler
    next();
  }
}
