import { useState, useEffect, useCallback } from 'react';
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
interface AuthMessage {
  type: 'AUTH_DATA' | 'AUTH_LOGOUT';
  token?: string;
  user?: ParentAuthData['user'];
}
interface OutgoingMessage {
  type: 'REQUEST_AUTH' | 'REQUEST_TOKEN_REFRESH' | 'LOGOUT_CONFIRMED';
}
const PARENT_ORIGIN = '*';
export function useParentAuth() {
  const [authData, setAuthData] = useState<ParentAuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestTokenRefresh = useCallback(() => {
    window.parent.postMessage({ type: 'REQUEST_TOKEN_REFRESH' }, PARENT_ORIGIN);
  }, []);
  const handleMessage = useCallback((event: MessageEvent<AuthMessage>) => {
    console.log('📩 PostMessage recibido:', event.data);
    if (event.data?.type === 'AUTH_DATA') {
      console.log('📩 AUTH_DATA recibido');
      if (event.data.token && event.data.user) {
        console.log('Token recibido via postMessage:', event.data.token);
        console.log('💾 Guardando token en localStorage:', event.data.token);
        localStorage.setItem('_at', event.data.token);
        setAuthData({
          token: event.data.token,
          user: event.data.user,
        });
      }
      setIsLoading(false);
    } else if (event.data?.type === 'AUTH_LOGOUT') {
      localStorage.removeItem('_at');
      localStorage.removeItem('_rt');
      setAuthData(null);
      window.parent.postMessage({ type: 'LOGOUT_CONFIRMED' }, '*');
    }
  }, []);
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    const existingToken = localStorage.getItem('_at');
    if (existingToken) {
      setIsLoading(false);
    } else {
      window.parent.postMessage({ type: 'REQUEST_AUTH' }, '*');
    }
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);
  return { authData, isLoading };
}
