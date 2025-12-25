import { ErrorCode } from "@yokg/shared/lib/error-codes";
import type { IUser } from "@yokg/shared/validate/users";
import { isNil, isNotNil } from "es-toolkit";
import { BusinessError } from "@/errors/business-error";
import { getLogger, mod } from "@/infra/logger";
import { getUserRepository } from "@/repositories/users.repository";
import type { IUserRepository } from "@/repositories/users.repository.interface";

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async selectAllUsers(): Promise<IUser[]> {
    const logger = getLogger(mod.users);
    logger.debug`Fetching all users`;
    const users = await this.userRepo.findMany();
    logger.debug`Found ${users.length} users`;
    return users;
  }

  async selectUserById(id: string): Promise<IUser> {
    const logger = getLogger(mod.users);
    logger.debug`Fetch user by id ${id}`;
    const user = await this.userRepo.findById(id);

    if (isNil(user)) {
      logger.debug`User not found: ${id}`;
      throw new BusinessError(404, {
        errcode: ErrorCode.USER.NOT_FOUND,
        message: "User not found",
      });
    }

    logger.debug`User found: ${id}`;
    return user;
  }
}

let userService: UserService | null = null;
export function getUserService(): UserService {
  if (isNil(userService)) {
    userService = new UserService(getUserRepository());
  }
  return userService;
}

export function destroyUserService() {
  if (isNotNil(userService)) {
    userService = null;
  }
}
