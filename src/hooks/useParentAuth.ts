import { useAuth } from '@/context/AuthContext';

export interface ParentAuthData {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    tenantId: string;
    tenantName?: string;
    branchId: string;
  };
}

export function useParentAuth() {
  const { token, user, isReady } = useAuth();
  return {
    authData: token && user ? { token, user } : null,
    isLoading: !isReady,
  };
}
