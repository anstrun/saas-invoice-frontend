import { useState, useEffect, useCallback, useRef } from 'react';
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

interface AuthMessage {
  type: 'AUTH_DATA' | 'AUTH_LOGOUT';
  token?: string;
  user?: ParentAuthData['user'];
}

export function useParentAuth() {
  const { token, user, isReady } = useAuth();
  return { 
    authData: token && user ? { token, user } : null, 
    isLoading: !isReady 
  };
}

  const handleMessage = useCallback((event: MessageEvent<AuthMessage>) => {
    if (!event.data?.type) return;

    if (event.data.type === 'AUTH_DATA') {
      if (event.data.token && event.data.user) {
        // Limpiar sesión anterior
        localStorage.removeItem('_at');
        localStorage.removeItem('_rt');

        // Guardar nueva sesión
        localStorage.setItem('_at', event.data.token);
        tokenReceived.current = true;

        setAuthData({
          token: event.data.token,
          user:  event.data.user,
        });
      }
      setIsLoading(false);

    } else if (event.data.type === 'AUTH_LOGOUT') {
      localStorage.removeItem('_at');
      localStorage.removeItem('_rt');
      tokenReceived.current = false;
      setAuthData(null);
      setIsLoading(false);
      window.parent.postMessage({ type: 'LOGOUT_CONFIRMED' }, '*');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    // Siempre pedir token fresco al padre — nunca confiar en localStorage
    if (!authRequested.current) {
      authRequested.current = true;
      window.parent.postMessage({ type: 'REQUEST_AUTH' }, '*');
    }

    // Timeout de seguridad — si el padre no responde en 4s, desbloquear UI
    const timeout = setTimeout(() => {
      if (!tokenReceived.current) {
        console.warn('useParentAuth: timeout esperando token del padre');
        setIsLoading(false);
      }
    }, 4000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [handleMessage]);

  return { authData, isLoading, requestTokenRefresh };
}
