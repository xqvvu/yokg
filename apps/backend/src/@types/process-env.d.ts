declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      PORT?: string;
      DATABASE_URL?: string;
      REDIS_URL?: string;
      NEO4J_URI?: string;
      NEO4J_USERNAME?: string;
      NEO4J_PASSWORD?: string;
      NEO4J_MAX_CONNECTION_POOL_SIZE?: string;
      NEO4J_CONNECTION_TIMEOUT?: string;
      CORS_ALLOWED_ORIGINS?: string;
      BETTER_AUTH_SECRET?: string;
      BETTER_AUTH_URL?: string;
      LOCALE?: string;
      TZ?: string;
    }
  }
}

export {};
