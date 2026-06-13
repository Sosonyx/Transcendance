import { useState } from "react";
import { Socket } from "socket.io-client";

interface Action1PanelProps {
	socket: Socket | null;
}

function Action1Panel({ socket }: Action1PanelProps) {
	const [prompt, setPrompt] = useState<string | null>(null);
	const [input, setInput] = useState<boolean>(true);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value: string = event.target.value;
		setPrompt(value.length > 0 ? value : null);
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (prompt)
		{
			socket?.emit('input', prompt);
			setPrompt(null);
			setInput(false);
		}
	};

	return (
		<div className="centered">
			<form id="form" className="game-form" onSubmit={handleSubmit}>
				{
					input ?
					(<>
						<p id="prompt-label" className="game-label"> Pose une question ! </p>
						<input id="prompt-input" type="text" placeholder="Ta question..." autoComplete="off" onChange={handleChange} value={prompt ?? ''} />
						<button id="send-btn" className="game-button"> Envoyer </button>
					</>) : (
						<p id="prompt-label" className="game-label"> En attente des autres joueurs... </p>
					)
				}
			</form>
		</div>
	);
};

export default Action1Panel;