import { useState } from "react";
import { login } from "../../services/api.js";
import "./AuthModal.css" 

interface LoginFormProps {
	onSuccess?: () => void | Promise<void>;
	onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e : React.SyntheticEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);

		try {
			await login(username, password);
			if (onSuccess)
				await onSuccess();
		} catch (err) {
			setError("Pas de compte associé ou mot de passe invalide");
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
		<form className="auth-form" onSubmit={handleSubmit}>
			<h2 className="auth-title">CONNEXION</h2>
			<input className="auth-input"
				type="text"
				placeholder="Nom de compte"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				required
			/>
			<input className="auth-input"
				type="password"
				placeholder="Mot de passe"
				value={password}
				minLength={5}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>
			{error && <p className="error-msg">{error}</p>}
			<button type="submit" className="auth-submit-btn" disabled={submitting}>
				{submitting ? "Connexion..." : "CONNEXION"}
			</button>
			<p className="auth-switch">
				Vous n'avez pas de compte ?{' '}
				<button type="button" className="auth-switch-btn" onClick={onSwitchToRegister}>S'inscrire</button>
			</p>
			<div className="auth-divider">OU</div>
			<div className="oauth-logos">
				<img src="/42.png" alt="Se connecter avec 42" onClick={handle42Submit} className="oauth-logo" />
				<img src="/google.png" alt="Se connecter avec Google" onClick={handleGoogleSubmit} className="oauth-logo" />
			</div>
		</form>
	);
}