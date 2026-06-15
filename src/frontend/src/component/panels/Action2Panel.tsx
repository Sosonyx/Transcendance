import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface Action2PanelProps {
	socket: Socket | null;
	prompt: string | null;
	eliminated: boolean;
}

function Action2Panel({ socket, prompt, eliminated }: Action2PanelProps) {
	const [response, setResponse] = useState<string | null>(null);
	const [input, setInput] = useState<boolean>(true);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value: string = event.target.value;
		setResponse(value.length > 0 ? value : null);
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (response)
		{
			socket?.emit('input', response);
			setResponse(null);
			setInput(false);
		}
	};

	useEffect(() => {
		if (eliminated) setInput(false);
	}, [eliminated])

	return (
		<div className="centered">
			<form id="form" className="game-form" onSubmit={handleSubmit}>
				{
					input ?
					(<>
						<p id="prompt-label" className="game-label"> {prompt || "Attente de la question..."} </p>
						<input id="prompt-input" type="text" placeholder="Ta réponse..." autoComplete="off" onChange={handleChange} value={response ?? ''} />
						<button id="send-btn" className="game-button">Envoyer</button>
					</>) : (
						<p id="prompt-label" className="game-label waiting"> En attente des autres joueurs... </p>
					)
				}
			</form>
		</div>
	);
};

export default Action2Panel;