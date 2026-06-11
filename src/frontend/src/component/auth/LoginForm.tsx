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
			setError("Login failed");
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
			<h2 className="auth-title">LOG IN</h2>
			<input className="auth-input"
				type="text"
				placeholder="Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				required
			/>
			<input className="auth-input"
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>
			{error && <p className="error-msg">{error}</p>}
			<button type="submit" className="auth-submit-btn" disabled={submitting}>
				{submitting ? "Connexion..." : "LOG IN"}
			</button>
			<p className="auth-switch">
				Don't have an account ?{' '}
				<button type="button" className="auth-switch-btn" onClick={onSwitchToRegister}>Sign up</button>
			</p>
			<div className="auth-divider">OR</div>
			<div className="oauth-logos">
				<img src="/42.png" alt="Connect with 42" onClick={handle42Submit} className="oauth-logo" />
				<img src="/google.png" alt="Connect with Google" onClick={handleGoogleSubmit} className="oauth-logo" />
			</div>
		</form>
	);
}