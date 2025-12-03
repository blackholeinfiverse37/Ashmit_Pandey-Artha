import { cacheGet, cacheSet } from '../config/redis.js';
import logger from '../config/logger.js';
import crypto from 'crypto';

/**
 * Cache middleware for GET requests
 */
export const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get cached data
      const cachedData = await cacheGet(key);

      if (cachedData) {
        logger.info(`Cache hit: ${key}`);
        return res.json(cachedData);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the response
        cacheSet(key, data, duration).catch((err) => {
          logger.error('Cache set error:', err);
        });

        // Send the response
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation helper
 */
export const invalidateCache = (pattern) => {
  // This would be implemented with Redis SCAN command
  // For now, we'll implement pattern-based invalidation in the service layer
  logger.info(`Cache invalidation requested for pattern: ${pattern}`);
};