import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import type { Message } from "../types";

interface ChatPanelProps {
	socket: Socket | null;
}

function ChatPanel({ socket }: ChatPanelProps) {
	const [message, setMessage] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);

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
		setMessages((msgs) => ([...msgs, msg]));
	};

	useEffect(() => {
		if (!socket) return;

		socket?.on('message', handleMessage);

		return () => { socket?.off('message', handleMessage); };
	}, [socket]);

	// Scroll to the bottom of the messages list when a new message is added
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// AI replica of twitch: Assign a color to each user based on their ID
	//! to erase
	const COLORS = ['#ff6905','#9147ff','#1e9eff','#e91916','#ff69b4','#00c8af'];

	const getColor = (id: string) => {
		const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
		return COLORS[hash % COLORS.length];
};

	return (
	<div>
		<ul id="messages">
			{messages.map((msg, i) => (
				<li key={i}>
					// AI replica of Twitch: Display the sender's ID in a color based on their ID
					//! to change
					<span style={{ color: getColor(msg.senderId), fontWeight: 700 }}>{msg.senderId}</span>
					{': '}{msg.content}
				</li>
			))}
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