import type { UserItem } from "../mocks/users";
import { mockUsers } from "../mocks/users";

export interface UserService {
  getAll(): Promise<UserItem[]>;
  toggleStatus(id: string): Promise<UserItem | null>;
}

export const mockUserService: UserService = {
  getAll: async () => mockUsers,
  toggleStatus: async (_id: string) => null,
};
