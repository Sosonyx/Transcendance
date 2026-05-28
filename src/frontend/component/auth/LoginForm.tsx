import { useState } from "react";
import { login } from "../../services/api.js";

interface LoginFormProps {
  onSuccess?: () => void | Promise<void>;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await login(username, password);
      if (onSuccess)
        await onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Se connecter</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="button" onClick={handleSubmit} disabled={submitting}>Connexion</button>
      {error && <p>{error}</p>}
    </div>
  );
}