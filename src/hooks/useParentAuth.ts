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
}

export function useParentAuth() {
  const [authData, setAuthData] = useState<ParentAuthData | null>(() => {
    const saved = localStorage.getItem('_at');
    const user = localStorage.getItem('_user');
    try {
      return (saved && user) ? { token: saved, user: JSON.parse(user) } : null;
    } catch (e) {
      return null;
    }
  });
  
  const [isLoading, setIsLoading] = useState(!authData);
  const lastTokenRef = useRef<string | null>(authData?.token || null);

  const handleMessage = useCallback((event: MessageEvent<AuthMessage>) => {
    const { data } = event;

    // Validación básica: Solo procesar si el mensaje viene de la ventana padre
    if (event.source !== window.parent) return;

    if (data?.type === 'AUTH_DATA' && data.token && data.user) {
      if (data.token !== lastTokenRef.current) {
        lastTokenRef.current = data.token;
        localStorage.setItem('_at', data.token);
        localStorage.setItem('_user', JSON.stringify(data.user));
        setAuthData({ token: data.token, user: data.user });
      }
      setIsLoading(false);
    } 
    
    else if (data?.type === 'AUTH_LOGOUT') {
      // Limpieza total de sesión
      localStorage.clear(); // Esto limpia _at, _user y cualquier otra basura
      setAuthData(null);
      setIsLoading(false);
      console.log('⟲ Sesión limpiada localmente');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    
    // REQUEST_AUTH: Enviamos '*' para que sea el Padre quien valide nuestro origen
    // Esto hace que el microfrontend sea agnóstico a la URL del host.
    window.parent.postMessage({ type: 'REQUEST_AUTH' }, '*');

    const timeout = setTimeout(() => setIsLoading(false), 2500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [handleMessage]);

  return { authData, isLoading };
}
