import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { viewHelpers } from './view-helpers';

// Membuat helper (timeAgo, icon, dst.) tersedia di semua view EJS
@Injectable()
export class ViewHelpersMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction) {
    Object.assign(res.locals, viewHelpers);
    next();
  }
}
