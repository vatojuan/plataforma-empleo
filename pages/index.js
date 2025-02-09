// pages/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "loading") {
      if (session && session.user.role) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [session, status, router]);

  return <p>Redirigiendo...</p>;
}
