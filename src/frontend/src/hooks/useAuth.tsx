import { useState, useEffect } from "react";
import { getProfile } from "../services/api.js";
import type { User } from "../types/types.js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null); //useState(InitialValue) -> creer une variable readOnly, modifiable avec la fct setState, React rerender lors que cest modifier
  const [loading, setLoading] = useState(false); //Loading/Submitting dans toutes les fct font qui font des calls API (Pas rerender avec des etats intermediaire)

  const refreshAuth = async () => {
    const token = document.cookie.split(";").find(row => row.startsWith("token"));
    if (!token)
        return ;
    setLoading(true);

    try {
      const profile : User = await getProfile();
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