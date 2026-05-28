import { useState, useEffect } from "react";
import { getProfile } from "../services/api.js";
import type { User } from "../types/types.js";

function hasTokenCookie(): boolean {
  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith('token='));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null); //useState(InitialValue) -> creer une variable readOnly, modifiable avec la fct setState, React rerender lors que cest modifier
  const [loading, setLoading] = useState(true); //Loading/Submitting dans toutes les fct front qui font des calls API (Pas rerender avec des etats intermediaire)

  const refreshAuth = async () => {
    setLoading(true);
    const tokenPresent = hasTokenCookie();

    if (!tokenPresent) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAuth();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: user ? true : false,
    refreshAuth,
  };
}