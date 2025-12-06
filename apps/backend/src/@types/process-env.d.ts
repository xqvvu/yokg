declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      PORT?: string;
      CORS_ALLOWED_ORIGINS?: string;
      LOCALE?: string;
      TZ?: string;

      // postgres
      POSTGRES_PORT?: string;
      POSTGRES_HOST?: string;
      POSTGRES_DB?: string;
      POSTGRES_USER?: string;
      POSTGRES_PASSWORD?: string;
      DATABASE_URL?: string;

      // redis
      REDIS_PORT?: string;
      REDIS_HOST?: string;
      REDIS_DB?: string;
      REDIS_PASSWORD?: string;
      REDIS_URL?: string;

      // neo4j
      NEO4J_HTTP_PORT?: string;
      NEO4J_BOLT_PORT?: string;
      NEO4J_HOST?: string;
      NEO4J_USER?: string;
      NEO4J_PASSWORD?: string;
      NEO4J_DATABASE?: string;
      NEO4J_MAX_CONNECTION_POOL_SIZE?: string;
      NEO4J_CONNECTION_TIMEOUT?: string;
      NEO4J_URI?: string;

      // s3
      S3_FORCE_PATH_STYLE?: string;
      S3_API_PORT?: string;
      S3_CONSOLE_PORT?: string;
      S3_ACCESS_KEY?: string;
      S3_SECRET_KEY?: string;
      S3_REGION?: string;

      // better-auth
      BETTER_AUTH_SECRET?: string;
      BETTER_AUTH_URL?: string;
    }
  }
}

export {};
