"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthUser } from "@/services/auth";
import { employeeApi } from "@/services/employee";
import type { EmployeeProfile } from "@/types/domain";
import { useRouter } from "next/navigation";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const authQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await authApi.me();
        return res.data;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const employeeQuery = useQuery({
    queryKey: ["employee", "me"],
    queryFn: async () => {
      if (!authQuery.data) return null;
      try {
        const res = await employeeApi.me();
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!authQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.setQueryData(["employee", "me"], null);
      queryClient.clear();
      router.push("/login");
    },
  });

  const user: AuthUser | null = authQuery.data ?? null;
  const profile: EmployeeProfile | null = employeeQuery.data ?? null;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  return {
    user,
    profile,
    isAuthenticated,
    isAdmin,
    isLoading: authQuery.isLoading,
    isProfileLoading: employeeQuery.isLoading,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
    refetchAuth: () => authQuery.refetch(),
    refetchProfile: () => employeeQuery.refetch(),
  };
}
