import { useState } from "react";
import { register } from "../../services/api.js";

interface RegisterFormProps {
  onSuccess?: () => void | Promise<void>;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [legalContent, setLegalContent] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  const openLegal = async (file: string) => {
    const res = await fetch(file);
    const html = await res.text();
    setLegalContent(html);
  };

  const handleGoogleSubmit = () => { window.location.href = `/api/auth/google`; };
  const handle42Submit = () => { window.location.href = `/api/auth/42`; };

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">SIGN UP</h2>
        <input className="auth-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="auth-input" type="text" placeholder="Username" maxLength={20} value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="auth-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error-msg">{error}</p>}
        <button className="auth-submit-btn" type="submit" disabled={submitting}>
          {submitting ? "Inscription..." : "SIGN UP"}
        </button>
        <p className="auth-switch-tos-policy">
          En m'inscrivant, j'accepte les{' '}
          <button type="button" className="auth-tos-link" onClick={() => openLegal('policy/termes-of-services.html')}>CGU</button>
          {' '}et la{' '}
          <button type="button" className="auth-tos-link" onClick={() => openLegal('policy/privacy-policy.html')}>Politique de confidentialité</button>.
        </p>
        <p className="auth-switch">
          Already have an account ?{' '}
          <button type="button" className="auth-switch-btn" onClick={onSwitchToLogin}>Log in</button>
        </p>
        <div className="auth-divider">OR</div>
        <div className="oauth-logos">
          <img src="/42.png" alt="Connect with 42" onClick={handle42Submit} className="oauth-logo" />
          <img src="/google.png" alt="Connect with Google" onClick={handleGoogleSubmit} className="oauth-logo" />
        </div>
      </form>

      {legalContent && (
        <div className="legal-overlay" onClick={() => setLegalContent(null)}>
          <div className="legal-modal" onClick={e => e.stopPropagation()}>
            <button className="legal-close" onClick={() => setLegalContent(null)}>✕</button>
            <div className="legal-content" dangerouslySetInnerHTML={{ __html: legalContent }} />
          </div>
        </div>
      )}
    </>
  );
}
