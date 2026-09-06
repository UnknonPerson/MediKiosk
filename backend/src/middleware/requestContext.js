import { randomUUID } from 'node:crypto';

export default function requestContext(req, res, next) {
  req.requestId = req.get('x-request-id') || randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}
