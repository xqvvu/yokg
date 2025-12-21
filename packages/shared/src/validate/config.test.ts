import { ConfigSchema } from "@graph-mind/shared/validate/config";
import { clone, omit } from "es-toolkit";
import { beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("ConfigSchema", () => {
  const validProcessEnv = {
    // server
    NODE_ENV: "development",
    PORT: "10001",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:3001",
    LOCALE: "en-US",
    TZ: "America/Los_Angeles",

    // postgres
    POSTGRES_PORT: "5432",
    POSTGRES_HOST: "localhost",
    POSTGRES_DB: "graph-mind",
    POSTGRES_USER: "postgres",
    POSTGRES_PASSWORD: "mypassword",
    DATABASE_URL: "postgres://postgres:mypassword@localhost:5432/graph-mind",

    // redis
    REDIS_PORT: "6379",
    REDIS_HOST: "localhost",
    REDIS_DB: "0",
    REDIS_PASSWORD: "mypassword",
    REDIS_URL: "redis://:mypassword@localhost:6379/0",

    // neo4j
    NEO4J_HTTP_PORT: "7474",
    NEO4J_BOLT_PORT: "7687",
    NEO4J_HOST: "localhost",
    NEO4J_USER: "neo4j",
    NEO4J_PASSWORD: "mypassword",
    NEO4J_DATABASE: "graph-mind",
    NEO4J_MAX_CONNECTION_POOL_SIZE: "50",
    NEO4J_CONNECTION_TIMEOUT: "30000",
    NEO4J_URI: "neo4j://localhost:7687",

    // s3
    S3_VENDOR: "rustfs",
    S3_FORCE_PATH_STYLE: "true",

    // rustfs
    RUSTFS_API_PORT: "9000",
    RUSTFS_CONSOLE_PORT: "9001",
    RUSTFS_ACCESS_KEY: "rustfsadmin",
    RUSTFS_SECRET_KEY: "mypassword",

    // better-auth
    BETTER_AUTH_SECRET: "a7081891386aea621b1c766c07f2186b573fbe5f8497c5243801565683d039d9",
    BETTER_AUTH_URL: "http://localhost:10001",
  };

  let error: unknown;
  let processEnv: Partial<typeof validProcessEnv>;

  beforeEach(() => {
    error = undefined;
    processEnv = clone(validProcessEnv);
  });

  describe("Default values", () => {
    it("should apply default PORT when missing", () => {
      processEnv = omit(processEnv, ["PORT"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.PORT).toBe(10001);
    });

    it("should apply default LOCALE when missing", () => {
      processEnv = omit(processEnv, ["LOCALE"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.LOCALE).toBe("zh-CN");
    });

    it("should apply default TZ when missing", () => {
      processEnv = omit(processEnv, ["TZ"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.TZ).toBe("Asia/Shanghai");
    });

    it("should apply default CORS_ALLOWED_ORIGINS when missing", () => {
      processEnv = omit(processEnv, ["CORS_ALLOWED_ORIGINS"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual([]);
    });
  });

  describe("CORS_ALLOWED_ORIGINS transformation", () => {
    it("should transform comma-separated origins to array", () => {
      processEnv.CORS_ALLOWED_ORIGINS = "http://localhost:3000,https://example.com";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual(["http://localhost:3000", "https://example.com"]);
    });

    it("should handle origins with spaces", () => {
      processEnv.CORS_ALLOWED_ORIGINS = " http://localhost:3000 , https://example.com ";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual(["http://localhost:3000", "https://example.com"]);
    });

    it("should handle empty entries in comma-separated list", () => {
      processEnv.CORS_ALLOWED_ORIGINS = "http://localhost:3000,,https://example.com,";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual(["http://localhost:3000", "https://example.com"]);
    });

    it("should allow wildcard origin", () => {
      processEnv.CORS_ALLOWED_ORIGINS = "*";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual(["*"]);
    });

    it("should allow mixed wildcard and URLs", () => {
      processEnv.CORS_ALLOWED_ORIGINS = "*,http://localhost:3000";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual(["*", "http://localhost:3000"]);
    });

    it("should throw error for invalid URL format", () => {
      processEnv.CORS_ALLOWED_ORIGINS = "not-a-valid-url";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should throw error when any URL in list is invalid", () => {
      processEnv.CORS_ALLOWED_ORIGINS = "http://localhost:3000,invalid-url";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("DATABASE_URL validation", () => {
    it("should accept valid postgresql URL", () => {
      processEnv.DATABASE_URL = "postgresql://user:password@localhost:5432/dbname";
      const result = ConfigSchema.parse(processEnv);
      expect(result.DATABASE_URL).toBe(processEnv.DATABASE_URL);
    });

    it("should accept valid postgres URL", () => {
      processEnv.DATABASE_URL = "postgres://user:password@localhost:5432/dbname";
      const result = ConfigSchema.parse(processEnv);
      expect(result.DATABASE_URL).toBe(processEnv.DATABASE_URL);
    });

    it("should accept postgres URL with complex parameters", () => {
      processEnv.DATABASE_URL =
        "postgresql://user:password@localhost:5432/dbname?sslmode=require&connection_limit=20";
      const result = ConfigSchema.parse(processEnv);
      expect(result.DATABASE_URL).toBe(processEnv.DATABASE_URL);
    });

    it("should reject missing DATABASE_URL", () => {
      processEnv = omit(processEnv, ["DATABASE_URL"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject empty DATABASE_URL", () => {
      processEnv.DATABASE_URL = "";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject mysql URL", () => {
      processEnv.DATABASE_URL = "mysql://user:password@localhost:3306/dbname";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject mongodb URL", () => {
      processEnv.DATABASE_URL = "mongodb://localhost:27017/dbname";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("REDIS_URL validation", () => {
    it("should accept valid redis URL", () => {
      processEnv.REDIS_URL = "redis://localhost:6379";
      const result = ConfigSchema.parse(processEnv);
      expect(result.REDIS_URL).toBe(processEnv.REDIS_URL);
    });

    it("should accept valid rediss URL", () => {
      processEnv.REDIS_URL = "rediss://localhost:6379";
      const result = ConfigSchema.parse(processEnv);
      expect(result.REDIS_URL).toBe(processEnv.REDIS_URL);
    });

    it("should accept redis URL with password", () => {
      processEnv.REDIS_URL = "redis://:password@localhost:6379";
      const result = ConfigSchema.parse(processEnv);
      expect(result.REDIS_URL).toBe(processEnv.REDIS_URL);
    });

    it("should accept redis URL with database", () => {
      processEnv.REDIS_URL = "redis://localhost:6379/1";
      const result = ConfigSchema.parse(processEnv);
      expect(result.REDIS_URL).toBe(processEnv.REDIS_URL);
    });

    it("should reject missing REDIS_URL", () => {
      processEnv = omit(processEnv, ["REDIS_URL"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject empty REDIS_URL", () => {
      processEnv.REDIS_URL = "";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject invalid Redis URL format", () => {
      processEnv.REDIS_URL = "http://localhost:6379";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("BETTER_AUTH_URL validation", () => {
    it("should accept HTTP URL", () => {
      processEnv.BETTER_AUTH_URL = "http://localhost:3000";
      const result = ConfigSchema.parse(processEnv);
      expect(result.BETTER_AUTH_URL).toBe(processEnv.BETTER_AUTH_URL);
    });

    it("should accept HTTPS URL", () => {
      processEnv.BETTER_AUTH_URL = "https://example.com";
      const result = ConfigSchema.parse(processEnv);
      expect(result.BETTER_AUTH_URL).toBe(processEnv.BETTER_AUTH_URL);
    });

    it("should accept URL with path", () => {
      processEnv.BETTER_AUTH_URL = "https://example.com/auth";
      const result = ConfigSchema.parse(processEnv);
      expect(result.BETTER_AUTH_URL).toBe(processEnv.BETTER_AUTH_URL);
    });

    it("should reject missing BETTER_AUTH_URL", () => {
      processEnv = omit(processEnv, ["BETTER_AUTH_URL"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject non-URL string", () => {
      processEnv.BETTER_AUTH_URL = "not-a-url";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("BETTER_AUTH_SECRET validation", () => {
    it("should reject missing BETTER_AUTH_SECRET", () => {
      processEnv = omit(processEnv, ["BETTER_AUTH_SECRET"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject empty secret", () => {
      processEnv.BETTER_AUTH_SECRET = "";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should accept valid secret", () => {
      processEnv.BETTER_AUTH_SECRET = "valid-secret-key-here";
      const result = ConfigSchema.parse(processEnv);
      expect(result.BETTER_AUTH_SECRET).toBe(processEnv.BETTER_AUTH_SECRET);
    });
  });

  describe("PORT boundary values", () => {
    it("should accept minimum valid port (1024)", () => {
      processEnv.PORT = "1024";
      const result = ConfigSchema.parse(processEnv);
      expect(result.PORT).toBe(1024);
    });

    it("should accept maximum valid port (65535)", () => {
      processEnv.PORT = "65535";
      const result = ConfigSchema.parse(processEnv);
      expect(result.PORT).toBe(65535);
    });

    it("should accept default port when explicitly set to default value", () => {
      processEnv.PORT = "10001";
      const result = ConfigSchema.parse(processEnv);
      expect(result.PORT).toBe(10001);
    });

    it("should reject port when not a number", () => {
      processEnv.PORT = "Not a Number";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject port when not an integer", () => {
      processEnv.PORT = "1024.5";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject port less than 1024", () => {
      processEnv.PORT = "1023";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject port greater than 65535", () => {
      processEnv.PORT = "65536";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject port 0", () => {
      processEnv.PORT = "0";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject negative port", () => {
      processEnv.PORT = "-1";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("NODE_ENV validation", () => {
    it("should accept any NODE_ENV value", () => {
      const validNodeEnvValues = ["development", "production", "test", "staging", "custom"];
      for (const nodeEnvValue of validNodeEnvValues) {
        processEnv.NODE_ENV = nodeEnvValue;
        const result = ConfigSchema.parse(processEnv);
        expect(result.NODE_ENV).toBe(nodeEnvValue);
      }
    });

    it("should accept empty NODE_ENV", () => {
      processEnv.NODE_ENV = "";
      const result = ConfigSchema.parse(processEnv);
      expect(result.NODE_ENV).toBe("");
    });
  });

  describe("PostgreSQL validation", () => {
    it("should apply default POSTGRES_PORT when missing", () => {
      processEnv = omit(processEnv, ["POSTGRES_PORT"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.POSTGRES_PORT).toBe(5432);
    });

    it("should apply default POSTGRES_HOST when missing", () => {
      processEnv = omit(processEnv, ["POSTGRES_HOST"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.POSTGRES_HOST).toBe("localhost");
    });

    it("should apply default POSTGRES_DB when missing", () => {
      processEnv = omit(processEnv, ["POSTGRES_DB"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.POSTGRES_DB).toBe("graph-mind");
    });

    it("should apply default POSTGRES_USER when missing", () => {
      processEnv = omit(processEnv, ["POSTGRES_USER"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.POSTGRES_USER).toBe("postgres");
    });

    it("should reject missing POSTGRES_PASSWORD", () => {
      processEnv = omit(processEnv, ["POSTGRES_PASSWORD"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject empty POSTGRES_PASSWORD", () => {
      processEnv.POSTGRES_PASSWORD = "";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("Redis validation", () => {
    it("should apply default REDIS_PORT when missing", () => {
      processEnv = omit(processEnv, ["REDIS_PORT"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.REDIS_PORT).toBe(6379);
    });

    it("should apply default REDIS_HOST when missing", () => {
      processEnv = omit(processEnv, ["REDIS_HOST"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.REDIS_HOST).toBe("localhost");
    });

    it("should apply default REDIS_DB when missing", () => {
      processEnv = omit(processEnv, ["REDIS_DB"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.REDIS_DB).toBe(0);
    });

    it("should reject missing REDIS_PASSWORD", () => {
      processEnv = omit(processEnv, ["REDIS_PASSWORD"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject empty REDIS_PASSWORD", () => {
      processEnv.REDIS_PASSWORD = "";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("Neo4j validation", () => {
    it("should apply default NEO4J_HTTP_PORT when missing", () => {
      processEnv = omit(processEnv, ["NEO4J_HTTP_PORT"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.NEO4J_HTTP_PORT).toBe(7474);
    });

    it("should apply default NEO4J_BOLT_PORT when missing", () => {
      processEnv = omit(processEnv, ["NEO4J_BOLT_PORT"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.NEO4J_BOLT_PORT).toBe(7687);
    });

    it("should apply default NEO4J_HOST when missing", () => {
      processEnv = omit(processEnv, ["NEO4J_HOST"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.NEO4J_HOST).toBe("localhost");
    });

    it("should apply default NEO4J_USER when missing", () => {
      processEnv = omit(processEnv, ["NEO4J_USER"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.NEO4J_USER).toBe("neo4j");
    });

    it("should apply default NEO4J_DATABASE when missing", () => {
      processEnv = omit(processEnv, ["NEO4J_DATABASE"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.NEO4J_DATABASE).toBe("graph-mind");
    });

    it("should apply default NEO4J_MAX_CONNECTION_POOL_SIZE when missing", () => {
      processEnv = omit(processEnv, ["NEO4J_MAX_CONNECTION_POOL_SIZE"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.NEO4J_MAX_CONNECTION_POOL_SIZE).toBe(50);
    });

    it("should apply default NEO4J_CONNECTION_TIMEOUT when missing", () => {
      processEnv = omit(processEnv, ["NEO4J_CONNECTION_TIMEOUT"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.NEO4J_CONNECTION_TIMEOUT).toBe(30000);
    });

    it("should reject missing NEO4J_PASSWORD", () => {
      processEnv = omit(processEnv, ["NEO4J_PASSWORD"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject empty NEO4J_PASSWORD", () => {
      processEnv.NEO4J_PASSWORD = "";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should accept valid neo4j URI", () => {
      processEnv.NEO4J_URI = "neo4j://localhost:7687";
      const result = ConfigSchema.parse(processEnv);
      expect(result.NEO4J_URI).toBe("neo4j://localhost:7687");
    });

    it("should accept neo4j+s URI for secure connections", () => {
      processEnv.NEO4J_URI = "neo4j+s://example.com:7687";
      const result = ConfigSchema.parse(processEnv);
      expect(result.NEO4J_URI).toBe("neo4j+s://example.com:7687");
    });

    it("should reject missing NEO4J_URI", () => {
      processEnv = omit(processEnv, ["NEO4J_URI"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject invalid NEO4J_URI protocol", () => {
      processEnv.NEO4J_URI = "bolt://localhost:7687";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("S3 validation", () => {
    it("should apply default S3_VENDOR when missing", () => {
      processEnv = omit(processEnv, ["S3_VENDOR"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.S3_VENDOR).toBe("rustfs");
    });

    it("should transform S3_FORCE_PATH_STYLE 'true' to boolean true", () => {
      processEnv.S3_FORCE_PATH_STYLE = "true";
      const result = ConfigSchema.parse(processEnv);
      expect(result.S3_FORCE_PATH_STYLE).toBe(true);
    });

    it("should transform S3_FORCE_PATH_STYLE 'false' to boolean false", () => {
      processEnv.S3_FORCE_PATH_STYLE = "false";
      const result = ConfigSchema.parse(processEnv);
      expect(result.S3_FORCE_PATH_STYLE).toBe(false);
    });

    it("should apply default S3_FORCE_PATH_STYLE when missing", () => {
      processEnv = omit(processEnv, ["S3_FORCE_PATH_STYLE"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.S3_FORCE_PATH_STYLE).toBe(false);
    });
  });

  describe("RustFS validation", () => {
    it("should apply default RUSTFS_API_PORT when missing", () => {
      processEnv = omit(processEnv, ["RUSTFS_API_PORT"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.RUSTFS_API_PORT).toBe(9000);
    });

    it("should apply default RUSTFS_CONSOLE_PORT when missing", () => {
      processEnv = omit(processEnv, ["RUSTFS_CONSOLE_PORT"]);
      const result = ConfigSchema.parse(processEnv);
      expect(result.RUSTFS_CONSOLE_PORT).toBe(9001);
    });

    it("should reject missing RUSTFS_ACCESS_KEY", () => {
      processEnv = omit(processEnv, ["RUSTFS_ACCESS_KEY"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject empty RUSTFS_ACCESS_KEY", () => {
      processEnv.RUSTFS_ACCESS_KEY = "";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject missing RUSTFS_SECRET_KEY", () => {
      processEnv = omit(processEnv, ["RUSTFS_SECRET_KEY"]);
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });

    it("should reject empty RUSTFS_SECRET_KEY", () => {
      processEnv.RUSTFS_SECRET_KEY = "";
      try {
        ConfigSchema.parse(processEnv);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ZodError);
    });
  });

  describe("Complete validation scenarios", () => {
    it("should accept valid configuration with all fields", () => {
      const result = ConfigSchema.parse(processEnv);
      expect(result).toEqual({
        // server
        NODE_ENV: "development",
        PORT: 10001,
        CORS_ALLOWED_ORIGINS: ["http://localhost:3000", "http://localhost:3001"],
        LOCALE: "en-US",
        TZ: "America/Los_Angeles",

        // postgres
        POSTGRES_PORT: 5432,
        POSTGRES_HOST: "localhost",
        POSTGRES_DB: "graph-mind",
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "mypassword",
        DATABASE_URL: "postgres://postgres:mypassword@localhost:5432/graph-mind",

        // redis
        REDIS_PORT: 6379,
        REDIS_HOST: "localhost",
        REDIS_DB: 0,
        REDIS_PASSWORD: "mypassword",
        REDIS_URL: "redis://:mypassword@localhost:6379/0",

        // neo4j
        NEO4J_HTTP_PORT: 7474,
        NEO4J_BOLT_PORT: 7687,
        NEO4J_HOST: "localhost",
        NEO4J_USER: "neo4j",
        NEO4J_PASSWORD: "mypassword",
        NEO4J_DATABASE: "graph-mind",
        NEO4J_MAX_CONNECTION_POOL_SIZE: 50,
        NEO4J_CONNECTION_TIMEOUT: 30000,
        NEO4J_URI: "neo4j://localhost:7687",

        // s3
        S3_VENDOR: "rustfs",
        S3_FORCE_PATH_STYLE: true,

        // rustfs
        RUSTFS_API_PORT: 9000,
        RUSTFS_CONSOLE_PORT: 9001,
        RUSTFS_ACCESS_KEY: "rustfsadmin",
        RUSTFS_SECRET_KEY: "mypassword",

        // better-auth
        BETTER_AUTH_SECRET: "a7081891386aea621b1c766c07f2186b573fbe5f8497c5243801565683d039d9",
        BETTER_AUTH_URL: "http://localhost:10001",
      });
    });

    it("should accept valid configuration with only required fields", () => {
      const minimalConfig = {
        // required fields (no defaults)
        POSTGRES_PASSWORD: "pgpass",
        DATABASE_URL: "postgresql://user:password@localhost:5432/dbname",
        REDIS_PASSWORD: "redispass",
        REDIS_URL: "redis://localhost:6379",
        NEO4J_PASSWORD: "neo4jpass",
        NEO4J_URI: "neo4j://localhost:7687",
        RUSTFS_ACCESS_KEY: "accesskey",
        RUSTFS_SECRET_KEY: "secretkey",
        BETTER_AUTH_SECRET: "secret-key",
        BETTER_AUTH_URL: "http://localhost:3000",
      };
      const result = ConfigSchema.parse(minimalConfig);

      // required fields
      expect(result.POSTGRES_PASSWORD).toBe(minimalConfig.POSTGRES_PASSWORD);
      expect(result.DATABASE_URL).toBe(minimalConfig.DATABASE_URL);
      expect(result.REDIS_PASSWORD).toBe(minimalConfig.REDIS_PASSWORD);
      expect(result.REDIS_URL).toBe(minimalConfig.REDIS_URL);
      expect(result.NEO4J_PASSWORD).toBe(minimalConfig.NEO4J_PASSWORD);
      expect(result.NEO4J_URI).toBe(minimalConfig.NEO4J_URI);
      expect(result.RUSTFS_ACCESS_KEY).toBe(minimalConfig.RUSTFS_ACCESS_KEY);
      expect(result.RUSTFS_SECRET_KEY).toBe(minimalConfig.RUSTFS_SECRET_KEY);
      expect(result.BETTER_AUTH_SECRET).toBe(minimalConfig.BETTER_AUTH_SECRET);
      expect(result.BETTER_AUTH_URL).toBe(minimalConfig.BETTER_AUTH_URL);

      // defaults
      expect(result.PORT).toBe(10001);
      expect(result.LOCALE).toBe("zh-CN");
      expect(result.TZ).toBe("Asia/Shanghai");
      expect(result.CORS_ALLOWED_ORIGINS).toEqual([]);
      expect(result.POSTGRES_PORT).toBe(5432);
      expect(result.POSTGRES_HOST).toBe("localhost");
      expect(result.POSTGRES_DB).toBe("graph-mind");
      expect(result.POSTGRES_USER).toBe("postgres");
      expect(result.REDIS_PORT).toBe(6379);
      expect(result.REDIS_HOST).toBe("localhost");
      expect(result.REDIS_DB).toBe(0);
      expect(result.NEO4J_HTTP_PORT).toBe(7474);
      expect(result.NEO4J_BOLT_PORT).toBe(7687);
      expect(result.NEO4J_HOST).toBe("localhost");
      expect(result.NEO4J_USER).toBe("neo4j");
      expect(result.NEO4J_DATABASE).toBe("graph-mind");
      expect(result.NEO4J_MAX_CONNECTION_POOL_SIZE).toBe(50);
      expect(result.NEO4J_CONNECTION_TIMEOUT).toBe(30000);
      expect(result.S3_VENDOR).toBe("rustfs");
      expect(result.S3_FORCE_PATH_STYLE).toBe(false);
      expect(result.RUSTFS_API_PORT).toBe(9000);
      expect(result.RUSTFS_CONSOLE_PORT).toBe(9001);
    });
  });
});
