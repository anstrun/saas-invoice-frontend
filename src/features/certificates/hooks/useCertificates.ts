import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificateService } from "../services/certificate.service";

const CERTIFICATES_KEY = ["certificates"];

export const useCertificateStatus = () => {
  return useQuery({
    queryKey: [...CERTIFICATES_KEY, "status"],
    queryFn: () => certificateService.getStatus(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCertificates = () => {
  return useQuery({
    queryKey: [...CERTIFICATES_KEY, "list"],
    queryFn: () => certificateService.list(),
  });
};

export const useUploadCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, password }: { file: File; password: string }) =>
      certificateService.upload(file, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_KEY });
    },
  });
};
