import { Request, Response, NextFunction } from 'express'
import logger from '../logger'

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: `${duration}ms`
    }

    if (res.statusCode >= 400) {
      logger.warn(logData, 'request completed with error')
    } else {
      logger.info(logData, 'request completed')
    }
  })

  next()
}
