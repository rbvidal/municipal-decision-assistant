import { useQuery } from "@tanstack/react-query";
import { userService } from "../services";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
    staleTime: 30_000,
  });
}
