import { useState } from "react";
import { Socket } from "socket.io-client";

interface Action2PanelProps {
	socket: Socket | null;
	prompt: string | null;
}

function Action2Panel({ socket, prompt }: Action2PanelProps) {
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

	return (
		<div className="centered">
			<form id="form" onSubmit={handleSubmit}>
				{
					input ?
					(<><p id="prompt-label" className="label"> {prompt || "Waiting for prompt..."} </p>
					<input id="prompt-input" type="text" placeholder="Your response..." autoComplete="off" onChange={handleChange} value={response ?? ''} />
					<button id="send-btn">Send</button></>) :
					(<p id="prompt-label" className="label"> Waiting for other players </p>)
				}
			</form>
		</div>
	);
};

export default Action2Panel;