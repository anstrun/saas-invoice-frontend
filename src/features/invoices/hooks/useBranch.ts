import { useQuery } from "@tanstack/react-query";
import { branchService } from "../services/branch.service";

export const useCurrentBranch = () => {
  return useQuery({
    queryKey: ["branch", "current"],
    queryFn: () => branchService.getCurrent(),
    staleTime: 1000 * 60 * 10,
  });
};
