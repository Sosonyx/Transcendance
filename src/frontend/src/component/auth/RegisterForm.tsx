import { useState } from "react";
import { register } from "../../services/api.js"; // Assure-toi d'avoir une fonction register dans ton api.js

interface RegisterFormProps {
  onSuccess?: () => void | Promise<void>;
  onSwitchToLogin: () => void; // La prop pour re-basculer sur le login
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !username || !password) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await register(email, username, password);
      
      if (onSuccess)
        await onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };
    const handleGoogleSubmit = async () => {
      window.location.href = `/api/auth/google`
    };
  
      const handle42Submit = async () => {
      window.location.href = `/api/auth/42`
    };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="title">Subscribe</h2>
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="auth-button">
      <button className="button" type="submit" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Signing up..." : "Sign up"}
      </button>
      
      
      <button className="button" type="button" onClick={onSwitchToLogin}>
        Already signed up ? Connect
      </button>
      </div>
      <div className="oAuthButton">
				<button type="button" className="button" onClick={handle42Submit} > Connect with 42 </button>
				<button type="button" className="button" onClick={handleGoogleSubmit}> Connect with Google</button>
			</div>
    </form>
  );
}