// src/components/AuthButton.client.jsx
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  if (status === "loading") return <button disabled>Checking…</button>;
  return session ? (
    <div>
      <span>Hello, {session.user?.name || "Trainer"}!</span>    
      <button onClick={() => signOut()}>Sign out</button>       
    </div>
  ) : (
    <button onClick={() => signIn("google")}>Sign in with Google</button>
  );
}
