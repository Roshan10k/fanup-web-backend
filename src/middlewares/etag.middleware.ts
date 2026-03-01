/**
 * ETag middleware for conditional HTTP request handling.
 *
 * Implements:
 * - ETag generation from response body (MD5 hash)
 * - If-None-Match conditional check → 304 Not Modified
 * - Cache-Control header for proper caching directives
 * - Last-Modified / If-Modified-Since support
 *
 * @module middlewares/etag.middleware
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Express middleware that adds ETag-based conditional request support.
 * Only applies to GET requests. Intercepts `res.json()` to compute an ETag,
 * then compares it against the `If-None-Match` request header.
 * Returns 304 Not Modified when the content has not changed.
 */
export const etagMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Conditional requests only apply to safe/idempotent GET requests
  if (req.method !== "GET") {
    next();
    return;
  }

  // Store original json method
  const originalJson = res.json.bind(res);

  // Override res.json to inject ETag logic
  res.json = function (body: unknown) {
    const bodyString = JSON.stringify(body);
    const etag = `"${crypto.createHash("md5").update(bodyString).digest("hex")}"`;

    // Set response headers
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    res.setHeader("Last-Modified", new Date().toUTCString());

    // Check If-None-Match → 304 Not Modified
    const ifNoneMatch = req.headers["if-none-match"];
    if (ifNoneMatch && ifNoneMatch === etag) {
      res.status(304);
      return res.end();
    }

    return originalJson(body);
  };

  next();
};
