import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function useAuthUser() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Sólo correr en cliente
    if (typeof window === "undefined") return;

    // 1) Si NextAuth ya pasó su estado 'authenticated' y session.user.token existe:
    if (status === "authenticated" && session?.user?.token) {
      setUser({ id: session.user.id, role: session.user.role });
      setToken(session.user.token);
      setReady(true);
      return;
    }

    // 2) Si NextAuth no está autenticado, revisamos localStorage (para enlaces)
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

    // 3) Listo para uso (aunque user/token puedan ser null)
    setReady(true);
  }, [session, status]);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  return { user, role: user?.role, token, authHeader, ready, sessionStatus: status };
}
