export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  },
  aiEngine: {
    url: process.env.AI_ENGINE_URL,
    apiKey: process.env.AI_ENGINE_API_KEY,
    timeoutMs: parseInt(process.env.AI_ENGINE_TIMEOUT_MS || '30000', 10),
    maxRetries: parseInt(process.env.AI_ENGINE_MAX_RETRIES || '3', 10),
    apiVersion: process.env.AI_ENGINE_API_VERSION || 'v1',
  },
});
