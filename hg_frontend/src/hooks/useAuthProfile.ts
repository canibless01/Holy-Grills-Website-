import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AuthProfileUpdatePayload,
  updateAuthProfile,
} from "@/lib/api/auth";

export function useUpdateAuthProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthProfileUpdatePayload) => updateAuthProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "profile"], data);
    },
  });
}
