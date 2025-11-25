import { ConfigSchema } from "@graph-mind/shared/validate/config";
import { clone, omit } from "es-toolkit";
import { beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("ConfigSchema", () => {
  const validProcessEnv = {
    NODE_ENV: "development",
    PORT: "10001",
    DATABASE_URL: "postgres://postgres:mypassword@localhost:5432/postgres",
    REDIS_URL: "redis://localhost:6379",
    CORS_ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:3001",
    LOCALE: "en-US",
    TZ: "America/Los_Angeles",
    BETTER_AUTH_SECRET:
      "a7081891386aea621b1c766c07f2186b573fbe5f8497c5243801565683d039d9",
    BETTER_AUTH_URL: "http://localhost:3000",
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
      processEnv.CORS_ALLOWED_ORIGINS =
        "http://localhost:3000,https://example.com";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual([
        "http://localhost:3000",
        "https://example.com",
      ]);
    });

    it("should handle origins with spaces", () => {
      processEnv.CORS_ALLOWED_ORIGINS =
        " http://localhost:3000 , https://example.com ";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual([
        "http://localhost:3000",
        "https://example.com",
      ]);
    });

    it("should handle empty entries in comma-separated list", () => {
      processEnv.CORS_ALLOWED_ORIGINS =
        "http://localhost:3000,,https://example.com,";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual([
        "http://localhost:3000",
        "https://example.com",
      ]);
    });

    it("should allow wildcard origin", () => {
      processEnv.CORS_ALLOWED_ORIGINS = "*";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual(["*"]);
    });

    it("should allow mixed wildcard and URLs", () => {
      processEnv.CORS_ALLOWED_ORIGINS = "*,http://localhost:3000";
      const result = ConfigSchema.parse(processEnv);
      expect(result.CORS_ALLOWED_ORIGINS).toEqual([
        "*",
        "http://localhost:3000",
      ]);
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
      processEnv.DATABASE_URL =
        "postgresql://user:password@localhost:5432/dbname";
      const result = ConfigSchema.parse(processEnv);
      expect(result.DATABASE_URL).toBe(processEnv.DATABASE_URL);
    });

    it("should accept valid postgres URL", () => {
      processEnv.DATABASE_URL =
        "postgres://user:password@localhost:5432/dbname";
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
      const validNodeEnvValues = [
        "development",
        "production",
        "test",
        "staging",
        "custom",
      ];
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

  describe("Complete validation scenarios", () => {
    it("should accept valid configuration with all optional fields", () => {
      const result = ConfigSchema.parse(processEnv);
      expect(result).toEqual({
        NODE_ENV: "development",
        PORT: 10001,
        DATABASE_URL: "postgres://postgres:mypassword@localhost:5432/postgres",
        REDIS_URL: "redis://localhost:6379",
        CORS_ALLOWED_ORIGINS: [
          "http://localhost:3000",
          "http://localhost:3001",
        ],
        LOCALE: "en-US",
        TZ: "America/Los_Angeles",
        BETTER_AUTH_SECRET:
          "a7081891386aea621b1c766c07f2186b573fbe5f8497c5243801565683d039d9",
        BETTER_AUTH_URL: "http://localhost:3000",
      });
    });

    it("should accept valid configuration with only required fields", () => {
      const minimalConfig = {
        DATABASE_URL: "postgresql://user:password@localhost:5432/dbname",
        REDIS_URL: "redis://localhost:6379",
        BETTER_AUTH_SECRET: "secret-key",
        BETTER_AUTH_URL: "http://localhost:3000",
      };
      const result = ConfigSchema.parse(minimalConfig);
      expect(result.DATABASE_URL).toBe(minimalConfig.DATABASE_URL);
      expect(result.REDIS_URL).toBe(minimalConfig.REDIS_URL);
      expect(result.BETTER_AUTH_SECRET).toBe(minimalConfig.BETTER_AUTH_SECRET);
      expect(result.BETTER_AUTH_URL).toBe(minimalConfig.BETTER_AUTH_URL);
      expect(result.PORT).toBe(10001); // default
      expect(result.LOCALE).toBe("zh-CN"); // default
      expect(result.TZ).toBe("Asia/Shanghai"); // default
      expect(result.CORS_ALLOWED_ORIGINS).toEqual([]); // default
    });
  });
});
