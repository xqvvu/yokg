import { users } from "@graph-mind/shared/schemas";
import type { nil } from "@graph-mind/shared/types/utils";
import type { IUser } from "@graph-mind/shared/validate/users";
import { eq } from "drizzle-orm";
import { isNil, isNotNil } from "es-toolkit";
import { getDb, getDbLogger } from "@/infra/database";
import { getRedis, getRedisLogger } from "@/infra/redis";
import { RedisKeyFactory } from "@/infra/redis/keys";
import { RedisTTLCalculator } from "@/infra/redis/ttl";
import type { IUserRepository } from "./users.repository.interface";

export class UserRepository implements IUserRepository {
  constructor(
    protected readonly db = getDb(),
    protected readonly redis = getRedis(),
  ) {}

  async findById(id: string): Promise<IUser | null> {
    const factory = new RedisKeyFactory();
    const dbLogger = getDbLogger();
    const redisLogger = getRedisLogger();

    const key = factory.users.byId(id);

    const cache = (await this.redis.json.get(key)) as IUser | nil;
    if (isNotNil(cache)) {
      redisLogger.debug(`Cache hit for user ${id}`);
      return cache;
    }

    redisLogger.debug(`Cache miss for user ${id}`);

    dbLogger.debug(`Query user by id ${id}`);
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (isNotNil(user)) {
      redisLogger.debug(`Cache user ${id}`);
      const ttl = new RedisTTLCalculator();
      this.redis
        .multi()
        .json.set(key, "$", user)
        .expire(key, ttl.$1_hour)
        .exec()
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : "unknown error";
          redisLogger.warn(`Cache write failed for user ${id}: ${message}`);
        });
    }

    return isNotNil(user) ? user : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const dbLogger = getDbLogger();

    dbLogger.debug("Query user by email");
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user || null;
  }

  async findMany(): Promise<IUser[]> {
    getDbLogger().debug("Query all users");
    return await this.db.query.users.findMany();
  }

  async delete(id: string): Promise<void> {
    getDbLogger().info(`Delete user ${id}`);
    await this.db.delete(users).where(eq(users.id, id));

    const factory = new RedisKeyFactory();
    getRedisLogger().debug(`Invalidate cache for user ${id}`);
    await this.redis.del(factory.users.byId(id));
  }
}

let userRepository: IUserRepository | null = null;
export function getUserRepository(): IUserRepository {
  if (isNil(userRepository)) {
    userRepository = new UserRepository();
  }
  return userRepository;
}

export function destroyUserRepository() {
  if (isNotNil(userRepository)) {
    userRepository = null;
  }
}
