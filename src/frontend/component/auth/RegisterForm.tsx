import { useState } from "react";
import { register } from "../../services/api.js";

interface RegisterFormProps {
  onSuccess?: () => void | Promise<void>;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false); // Si le buttun a ete cliquer le disable le temps du call api

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      await register(email, username, password);
      if (onSuccess) 
		await onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div>
      <h2>S'inscrire</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(input) => setEmail(input.target.value)}
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(input) => setUsername(input.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(input) => setPassword(input.target.value)}
      />
      <button type="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Inscription..." : "S'inscrire"}
      </button>
    	{error && <p>{error}</p>}
    </div>
  );
}