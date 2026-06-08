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
		<form onSubmit={handleSubmit}>
			<h2>Se connecter</h2>
			<input
				type="text"
				placeholder="Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				required
			/>
			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>
			{error && <p className="error-msg">{error}</p>}
			<div className='auth-button'>
				<button type="submit" className="button" disabled={submitting}>{submitting ? "Connection..." : "Connection"}</button>
				<button type="button" className="button" onClick={onSwitchToRegister}>Subscribe</button>
			</div>
			<div className="oAuthButton">
				<button type="button" className="button" onClick={handle42Submit} > Connect with 42 </button>
				<button type="button" className="button" onClick={handleGoogleSubmit}> Connect with Google</button>
			</div>


		</form>
	);
}