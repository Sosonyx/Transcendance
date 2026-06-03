import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import type { Message } from "../types";

interface ChatPanelProps {
	socket: Socket | null;
}

function ChatPanel({ socket }: ChatPanelProps) {
	const [message, setMessage] = useState<string | null>(null);
	const [messages, setMessages] = useState<string[]>([]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value: string = event.target.value;
		setMessage(value.length > 0 ? value : null);
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (message)
		{
			socket?.emit('message', message);
			setMessage('');
		}
	};

	const handleMessage = (msg: Message) => {
		setMessages((msgs) => ([...msgs, `${msg.senderId}: ${msg.content}`]));
	};

	useEffect(() => {
		if (!socket) return;

		socket?.on('message', handleMessage);

		return () => { socket?.off('message', handleMessage); };
	}, [socket]);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	return (
	<div>
		<ul id="messages">
			{messages.map((msg, i) => (<li key={i}>{msg}</li>))}
			<div ref={messagesEndRef} />
		</ul>
		<div className="bottom-bar">
			<form id="chatform" onSubmit={handleSubmit}>
				<input id="input" type="text" placeholder="Message..." autoComplete="off" onChange={handleChange} value={message ?? ''} />
				<button id="send-btn" type="submit">Send</button>
			</form>
		</div>
	</div>
	);
};

export default ChatPanel;