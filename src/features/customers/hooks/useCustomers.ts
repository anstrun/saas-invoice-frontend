import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "../services/customer.service";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../types/customer.types";

const CUSTOMERS_KEY = ["customers"];

export const useCustomers = (
  search?: string,
  page: number = 1,
  limit: number = 20
) => {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, search, page, limit],
    queryFn: () => customerService.search(search, page, limit),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, id],
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });
};

export const useCustomerByIdNumber = (identification: string) => {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, "byIdNumber", identification],
    queryFn: () => customerService.getByIdNumber(identification),
    enabled: !!identification,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customerService.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      return result;
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      customerService.update(id, data),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...CUSTOMERS_KEY, id] });
      return result;
    },
  });
};
