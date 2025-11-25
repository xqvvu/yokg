import type { Mocked } from "vitest";
import { vi } from "vitest";
import type { IUserRepository } from "@/repositories/users.repository.interface";

export function createMockedUserRepository(): Mocked<IUserRepository> {
  return {
    delete: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findMany: vi.fn(),
  };
}
