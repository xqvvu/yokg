import { users } from "@graph-mind/shared/schemas";
import type { nil } from "@graph-mind/shared/types/utils";
import type { IUser } from "@graph-mind/shared/validate/users";
import { eq } from "drizzle-orm";
import { isNil, isNotNil } from "es-toolkit";
import type { DB } from "@/infra/database";
import { getDb } from "@/infra/database";
import { getLogger, infra } from "@/infra/logger";
import type { RDB } from "@/infra/redis";
import { getRdb } from "@/infra/redis";
import { RedisKeyFactory } from "@/infra/redis/keys";
import { RedisTTLCalculator } from "@/infra/redis/ttl";
import type { IUserRepository } from "./users.repository.interface";

export class UserRepository implements IUserRepository {
  constructor(
    private db: DB,
    private rdb: RDB,
  ) {}

  async findById(id: string): Promise<IUser | null> {
    const dbLogger = getLogger(infra.database);
    const rdbLogger = getLogger(infra.redis);
    const factory = new RedisKeyFactory();
    const key = factory.users.byId(id);

    const cache = (await this.rdb.json.get(key)) as IUser | nil;
    if (isNotNil(cache)) {
      rdbLogger.debug`Cache hit for user ${id}`;
      return cache;
    }

    rdbLogger.debug`Cache miss for user ${id}`;

    dbLogger.debug`Query user by id ${id}`;
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (isNotNil(user)) {
      rdbLogger.debug`Cache user ${id}`;
      const ttl = new RedisTTLCalculator();
      this.rdb
        .multi()
        .json.set(key, "$", user)
        .expire(key, ttl.$1_hour)
        .exec()
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : "unknown error";
          rdbLogger.warn`Cache write failed for user ${id}: ${message}`;
        });
    }

    return isNotNil(user) ? user : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const dbLogger = getLogger(infra.database);
    dbLogger.debug`Query user by email`;
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user || null;
  }

  async findMany(): Promise<IUser[]> {
    const dbLogger = getLogger(infra.database);
    dbLogger.debug`Query all users`;
    return await this.db.query.users.findMany();
  }

  async delete(id: string): Promise<void> {
    const dbLogger = getLogger(infra.database);
    dbLogger.info`Delete user ${id}`;
    await this.db.delete(users).where(eq(users.id, id));

    const factory = new RedisKeyFactory();
    const rdbLogger = getLogger(infra.redis);
    rdbLogger.debug`Invalidate cache for user ${id}`;
    await this.rdb.del(factory.users.byId(id));
  }
}

let userRepository: IUserRepository | null = null;
export function getUserRepository(): IUserRepository {
  if (isNil(userRepository)) {
    userRepository = new UserRepository(getDb(), getRdb());
  }
  return userRepository;
}

export function destroyUserRepository() {
  if (isNotNil(userRepository)) {
    userRepository = null;
  }
}
