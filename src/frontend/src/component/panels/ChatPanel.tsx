import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import type { Message, AnswersType } from "../../types/types";
import './ChatPanel.css';

interface ChatPanelProps {
	socket: Socket | null;
	question: string | undefined;
	answers: AnswersType;
	eliminated: boolean;
}

function ChatPanel({ socket, question, answers, eliminated }: ChatPanelProps) {
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

	return (
		<div className="chat-layout">
			<div id="chat-context">
				<p id="chat-question" className="game-label">{question}</p>
				<ul id="chat-answers">
					{answers.map(([playerName, answer], id) => (<li key={id}>{playerName} : {answer}</li>))}
				</ul>
			</div>
			<ul id="messages" className={eliminated ? 'eliminated' : ''}>
				{messages.map((msg, i) => (
					<li key={i}>
						<span style={{ color: 'var(--twitch)', fontWeight: 700 }}>{msg.senderId}</span>
						{': '}{msg.content}
					</li>
				))}
				<div ref={messagesEndRef} />
			</ul>
			{eliminated ||
				<div className="bottom-bar">
					<form id="chatform" onSubmit={handleSubmit}>
						<input id="input" type="text" placeholder="Message..." autoComplete="off" onChange={handleChange} value={message ?? ''} />
						<button id="send-btn" className="game-button" type="submit">Envoyer</button>
					</form>
				</div>
			}
		</div>
	);
};

export default ChatPanel;