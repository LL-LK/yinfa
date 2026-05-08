import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../logger';

const auditLogPath = path.join(__dirname, '../../../../data/audit.log');

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export function auditLog(operation: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIP(req);
    const openid = req.body?.openid || req.query?.openid || 'anonymous';
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({ timestamp, operation, openid, ip }) + '\n';

    try {
      const dir = path.dirname(auditLogPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(auditLogPath, logEntry);
    } catch {
      logger.error('审计日志写入失败');
    }

    next();
  };
}
