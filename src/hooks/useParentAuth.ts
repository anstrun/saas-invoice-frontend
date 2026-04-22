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

// Cambia '*' por la URL real de tu aplicación padre en producción
const PARENT_ORIGIN = window.location.hostname === 'localhost' ? '*' : 'https://main.d24ga17w1vxa5z.amplifyapp.com/facturacion';

export function useParentAuth() {
  // Inicializamos con el valor de localStorage para evitar el flash de "loading" si ya existe
  const [authData, setAuthData] = useState<ParentAuthData | null>(() => {
    const saved = localStorage.getItem('_at');
    const user = localStorage.getItem('_user');
    return (saved && user) ? { token: saved, user: JSON.parse(user) } : null;
  });
  
  // Si ya tenemos datos previos, no empezamos en "loading"
  const [isLoading, setIsLoading] = useState(!authData);
  
  // Usamos una referencia para evitar procesar el mismo token dos veces
  const lastTokenRef = useRef<string | null>(authData?.token || null);

  const handleMessage = useCallback((event: MessageEvent<AuthMessage>) => {
    const { data } = event;
    if (data?.type === 'AUTH_DATA' && data.token && data.user) {
      
      // ⚡ CLAVE: Solo actualizar si el token es diferente al que ya tenemos
      if (data.token !== lastTokenRef.current) {
        console.log('🔄 Actualizando sesión con nuevo token');
        lastTokenRef.current = data.token;
        
        localStorage.setItem('_at', data.token);
        localStorage.setItem('_user', JSON.stringify(data.user));
        
        setAuthData({ token: data.token, user: data.user });
      }
      
      setIsLoading(false);
    } else if (data?.type === 'AUTH_LOGOUT') {
      localStorage.removeItem('_at');
      localStorage.removeItem('_user');
      setAuthData(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    
    // Pedir datos frescos
    window.parent.postMessage({ type: 'REQUEST_AUTH' }, '*');

    // Si después de 2 segundos no hay respuesta del padre, dejamos de cargar
    const timeout = setTimeout(() => setIsLoading(false), 2000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [handleMessage]);

  return { authData, isLoading };
}
