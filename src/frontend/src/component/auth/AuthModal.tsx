import { useEffect, useState } from 'react'
import { LoginForm } from './LoginForm.js'
import { RegisterForm } from './RegisterForm.js'

interface Props {
	onClose: () => void,
	onSuccess: () => void,
}

export function AuthModal({ onClose, onSuccess }: Props) {
	const [isLogin, setIsLogin] = useState(true)

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape')
				onClose();
		}
		window.addEventListener('keydown', handleEscape)
		return () => {
			window.removeEventListener('keydown', handleEscape)
		}
	}, [onClose])

	return (
		<div className='auth-overlay'>
			<div className='auth-modal' >
				<button className='modal-close-btn' onClick={onClose}>
					✕
				</button>

				{isLogin ? (
					<>
						<LoginForm onSuccess={onSuccess} onSwitchToRegister={() => setIsLogin(false)} />
					</>
				) : (
					<>
						<RegisterForm onSuccess={onSuccess} onSwitchToLogin={() => setIsLogin(true)} />
					</>
				)}
			</div>
		</div>
	)
}