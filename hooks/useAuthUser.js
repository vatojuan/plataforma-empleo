// hooks/useAuthUser.js
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export default function useAuthUser() {
  const { data: session, status: sessionStatus } = useSession();
  const [token, setToken]   = useState(null);
  const [user,  setUser]    = useState(null);
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    // Solo corre en cliente
    if (typeof window === "undefined") return;

    /* ——  ⛔  Mientras NextAuth esté en "loading" NO marcamos ready  —— */
    if (sessionStatus === "loading") return;

    // 1) Caso: NextAuth autenticado y tenemos el JWT de FastAPI
    if (sessionStatus === "authenticated" && session?.user?.token) {
      setUser({ id: session.user.id, role: session.user.role, name: session.user.name });
      setToken(session.user.token);
      setReady(true);
      return;
    }

    // 2) Caso: no autenticado — intentamos leer de localStorage
    const localToken = localStorage.getItem("userToken");
    if (localToken) {
      try {
        const payload = JSON.parse(atob(localToken.split(".")[1]));
        setUser({ id: payload.sub, role: payload.role || "empleado" });
        setToken(localToken);
      } catch (err) {
        console.warn("Token inválido en localStorage → lo elimino:", err);
        localStorage.removeItem("userToken");
      }
    }

    // 3) Ahora sí, listos (aunque quizá sin user)
    setReady(true);
  }, [session, sessionStatus]);

  const authHeader = useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  return { user, role: user?.role, token, authHeader, ready, sessionStatus };
}
