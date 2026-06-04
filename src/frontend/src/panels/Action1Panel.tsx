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
			<form id="form" onSubmit={handleSubmit}>
				{
					input ?
					(<><p id="prompt-label" className="label"> Ask a question ! </p>
					<input id="prompt-input" type="text" placeholder="Your question..." autoComplete="off" onChange={handleChange} value={prompt ?? ''} />
					<button id="send-btn">Send</button></>) :
					(<p id="prompt-label" className="label"> Waiting for other players </p>)
				}
			</form>
		</div>
	);
};

export default Action1Panel;