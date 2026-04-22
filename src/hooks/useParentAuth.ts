import { useState, useEffect, useCallback, useRef } from 'react';

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
  requestId?: string;
}

const ALLOWED_ORIGIN = 'https://tu-dominio-padre.com';

export function useParentAuth() {
  const [authData, setAuthData] = useState<ParentAuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentRequestId = useRef<string | null>(null);
  const isMounted = useRef(true);

  const generateRequestId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const requestAuth = useCallback(() => {
    const requestId = generateRequestId();
    currentRequestId.current = requestId;

    console.log('📤 Solicitando AUTH con requestId:', requestId);

    window.parent.postMessage(
      { type: 'REQUEST_AUTH', requestId },
      ALLOWED_ORIGIN
    );
  }, []);

  const requestTokenRefresh = useCallback(() => {
    if (!currentRequestId.current) return;

    window.parent.postMessage(
      {
        type: 'REQUEST_TOKEN_REFRESH',
        requestId: currentRequestId.current,
      },
      ALLOWED_ORIGIN
    );
  }, []);

  const handleMessage = useCallback((event: MessageEvent<AuthMessage>) => {
    if (event.origin !== ALLOWED_ORIGIN) return;
    if (!event.data || typeof event.data !== 'object') return;

    const { type, token, user, requestId } = event.data;

    console.log('📩 Mensaje recibido:', event.data);

    // 🔒 Ignorar respuestas que no corresponden a la request actual
    if (type === 'AUTH_DATA') {
      if (!requestId || requestId !== currentRequestId.current) {
        console.warn('⛔ AUTH_DATA ignorado (requestId no coincide)');
        return;
      }

      if (token && user) {
        console.log('✅ AUTH_DATA válido, actualizando sesión');

        // Evitar re-render innecesario si es el mismo usuario
        if (authData?.user?.id === user.id) {
          console.log('ℹ️ Mismo usuario, no se actualiza');
          setIsLoading(false);
          return;
        }

        // 🧹 Limpiar completamente estado previo
        localStorage.clear();

        localStorage.setItem('_at', token);

        if (!isMounted.current) return;

        setAuthData({
          token,
          user,
        });
      }

      setIsLoading(false);
    }

    if (type === 'AUTH_LOGOUT') {
      console.log('🚪 Logout recibido');

      localStorage.clear();

      if (!isMounted.current) return;

      setAuthData(null);

      window.parent.postMessage(
        { type: 'LOGOUT_CONFIRMED' },
        ALLOWED_ORIGIN
      );
    }
  }, [authData]);

  useEffect(() => {
    isMounted.current = true;

    window.addEventListener('message', handleMessage);

    // 🚨 SIEMPRE iniciar flujo limpio
    localStorage.clear();
    setAuthData(null);
    setIsLoading(true);

    requestAuth();

    const timeout = setTimeout(() => {
      console.warn('⏳ Timeout esperando AUTH_DATA');
      if (isMounted.current) setIsLoading(false);
    }, 4000);

    return () => {
      isMounted.current = false;
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [handleMessage, requestAuth]);

  return { authData, isLoading, requestTokenRefresh };
}
