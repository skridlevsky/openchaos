"use client";

import { useAuth } from "@/hooks/useAuth";

export function AuthButton() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <button disabled className="auth-button auth-button-disabled">
        <b>Loading...</b>
      </button>
    );
  }

  if (user) {
    return (
      <button onClick={logout} className="auth-button auth-button-logout">
        <b>[Logout]</b>
      </button>
    );
  }

  return (
    <button onClick={login} className="auth-button">
      <b>🔐 Login with GitHub</b>
    </button>
  );
}
