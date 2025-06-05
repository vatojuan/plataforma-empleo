// hooks/useAuthUser.js

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export default function useAuthUser() {
  const { data: session, status: sessionStatus } = useSession();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Solo corre en el cliente
    if (typeof window === "undefined") return;

    // 1) Si NextAuth ya se autenticó y hay session.user.token
    if (sessionStatus === "authenticated" && session?.user?.token) {
      setUser({ id: session.user.id, role: session.user.role });
      setToken(session.user.token);
      setReady(true);
      return;
    }

    // 2) Si NextAuth no está autenticado, intentar recuperar de localStorage
    const localToken = localStorage.getItem("userToken");
    if (localToken) {
      try {
        const payload = JSON.parse(atob(localToken.split(".")[1]));
        setUser({ id: payload.sub, role: payload.role || "empleado" });
        setToken(localToken);
      } catch (e) {
        console.warn("Token inválido en localStorage:", e);
        localStorage.removeItem("userToken");
      }
    }

    // 3) Marcamos ready (aunque user/token puedan ser null)
    setReady(true);
  }, [session, sessionStatus]);

  // Cabecera de autenticación memoizada
  const authHeader = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  return { user, role: user?.role, token, authHeader, ready, sessionStatus };
}
