import type { UserService } from "./UserService";
import { apiClient } from "../api";
import type { UserItem } from "../mocks/users";

export const restUserService: UserService = {
  getAll: () => apiClient.get<UserItem[]>("/api/users"),
  toggleStatus: (id) => apiClient.put<UserItem>(`/api/users/${id}/toggle-status`),
};
