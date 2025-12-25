import { fakerZH_CN as faker } from "@faker-js/faker";
import { uuidv7 } from "@yokg/shared/lib/uuid";
import type { IUser } from "@yokg/shared/validate/users";

export function mockUser(): IUser {
  return {
    id: uuidv7(),
    name: faker.person.fullName(),
    image: null,
    email: faker.internet.email(),
    emailVerified: faker.datatype.boolean(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function mockUsers(amount: number = 3): IUser[] {
  const result: IUser[] = [];

  for (let i = 0; i < amount; i++) {
    result.push(mockUser());
  }

  return result;
}

export function mockUserWithId(id: string): IUser {
  const user = mockUser();
  user.id = id;
  return user;
}
