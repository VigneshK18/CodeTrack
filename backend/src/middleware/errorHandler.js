import { HttpError } from '../utils/http.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, ...(err.details ? { errors: err.details } : {}) });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }

  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'This record already exists' });
  }

  console.error('[error]', err);
  res.status(500).json({ message: 'Something went wrong on the server' });
}
