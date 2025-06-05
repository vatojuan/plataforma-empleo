// hooks/useAuthUser.js

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export default function useAuthUser() {
  const { data: session, status: sessionStatus } = useSession();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Este hook solo corre en cliente
    if (typeof window === "undefined") return;

    // 1) Si NextAuth ha terminado y tenemos session.user.token (JWT de FastAPI)
    if (sessionStatus === "authenticated" && session?.user?.token) {
      setUser({ id: session.user.id, role: session.user.role });
      setToken(session.user.token);
      setReady(true);
      return;
    }

    // 2) Si NextAuth no está autenticado, intentar recuperar JWT de localStorage (enlaces de confirmación)
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

    // 3) Marcamos ready (quizá el usuario no esté autenticado)
    setReady(true);
  }, [session, sessionStatus]);

  // Memoizar cabecera de autenticación
  const authHeader = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  return { user, role: user?.role, token, authHeader, ready, sessionStatus };
}
