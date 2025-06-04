import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function useAuthUser() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const localToken = localStorage.getItem("userToken");
    if (session?.user) {
      // Usuario autenticado vía NextAuth
      setUser(session.user);
      setReady(true);
    } else if (localToken) {
      // Usuario autenticado vía enlace (JWT en localStorage)
      try {
        const payload = JSON.parse(atob(localToken.split(".")[1]));
        setUser({ id: payload.sub, role: "empleado" }); // Ajusta según tu payload
        setToken(localToken);
        setReady(true);
      } catch (e) {
        console.warn("Token inválido", e);
        setReady(true);
      }
    } else {
      setReady(true);
    }
  }, [session]);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  return { user, role: user?.role, token, authHeader, ready, sessionStatus: status };
}
