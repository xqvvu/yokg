import { ErrorCode } from "@yokg/shared/lib/error-codes";
import { uuidv7 } from "@yokg/shared/lib/uuid";
import type { Mocked } from "vitest";
import { beforeEach, describe, expect, it } from "vitest";
import { mockUsers, mockUserWithId } from "#test/fixtures/users.fixture";
import { createMockedUserRepository } from "#test/mocks/users.repository.mock";
import { BusinessError } from "@/errors/business-error";
import { UserService } from "@/modules/users/users.service";
import type { IUserRepository } from "@/repositories/users.repository.interface";

describe("UserService", () => {
  let userRepository: Mocked<IUserRepository>;
  let userService: UserService;

  beforeEach(() => {
    userRepository = createMockedUserRepository();
    userService = new UserService(userRepository);
  });

  describe("selectAllUsers", () => {
    it("should return all users from repository", async () => {
      const users = mockUsers();
      userRepository.findMany.mockResolvedValue(users);
      const result = await userService.selectAllUsers();

      expect(result).toEqual(users);
      expect(userRepository.findMany).toHaveBeenCalledTimes(1);
      expect(userRepository.findMany).toHaveBeenCalledWith();
    });

    it("should return empty array when no users exist", async () => {
      userRepository.findMany.mockResolvedValue([]);
      const result = await userService.selectAllUsers();

      expect(result).toEqual([]);
      expect(userRepository.findMany).toHaveBeenCalledTimes(1);
      expect(userRepository.findMany).toHaveBeenCalledWith();
    });
  });

  describe("selectUserById", () => {
    it("should throw error when user not found", async () => {
      userRepository.findById.mockResolvedValue(null);
      const userId = uuidv7();

      const action = userService.selectUserById(userId);

      await expect(action).rejects.toBeInstanceOf(BusinessError);
      await expect(action).rejects.toMatchObject({
        errcode: ErrorCode.USER.NOT_FOUND,
      });
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it("should return user when user found", async () => {
      const userId = uuidv7();
      const user = mockUserWithId(userId);
      userRepository.findById.mockResolvedValue(user);
      const result = await userService.selectUserById(userId);

      expect(result).toEqual(user);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });
});
