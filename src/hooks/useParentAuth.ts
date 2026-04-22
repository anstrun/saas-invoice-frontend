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

const ALLOWED_ORIGIN = 'https://tu-dominio-padre.com'; // ⚠️ cámbialo en prod

export function useParentAuth() {
  const [authData, setAuthData] = useState<ParentAuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestTokenRefresh = useCallback(() => {
    window.parent.postMessage(
      { type: 'REQUEST_TOKEN_REFRESH' },
      ALLOWED_ORIGIN
    );
  }, []);

  const handleMessage = useCallback((event: MessageEvent<AuthMessage>) => {
    // 🔒 Validar origen
    if (event.origin !== ALLOWED_ORIGIN) return;

    if (!event.data || typeof event.data !== 'object') return;

    console.log('📩 PostMessage recibido:', event.data);

    if (event.data.type === 'AUTH_DATA') {
      console.log('📩 AUTH_DATA recibido');

      if (event.data.token && event.data.user) {
        console.log('🔄 Nueva sesión recibida, limpiando anterior');

        // 🧹 Limpiar sesión anterior
        localStorage.removeItem('_at');
        localStorage.removeItem('_rt');

        // 💾 Guardar nuevo token
        localStorage.setItem('_at', event.data.token);

        setAuthData({
          token: event.data.token,
          user: event.data.user,
        });
      }

      setIsLoading(false);
    }

    if (event.data.type === 'AUTH_LOGOUT') {
      console.log('🚪 Logout recibido desde el padre');

      localStorage.removeItem('_at');
      localStorage.removeItem('_rt');

      setAuthData(null);

      window.parent.postMessage(
        { type: 'LOGOUT_CONFIRMED' },
        ALLOWED_ORIGIN
      );
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    // 🔑 SIEMPRE pedir token fresco
    window.parent.postMessage(
      { type: 'REQUEST_AUTH' },
      ALLOWED_ORIGIN
    );

    // ⏳ fallback si el padre no responde
    const timeout = setTimeout(() => {
      console.warn('⏳ Timeout esperando AUTH_DATA');
      setIsLoading(false);
    }, 3000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [handleMessage]);

  return { authData, isLoading, requestTokenRefresh };
}
