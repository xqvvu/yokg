import type { IUser } from "@yokg/shared/validate/users";

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;

  findByEmail(email: string): Promise<IUser | null>;

  findMany(): Promise<IUser[]>;

  delete(id: string): Promise<void>;
}
