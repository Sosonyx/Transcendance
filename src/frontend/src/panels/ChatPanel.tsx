import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import type { Message, AnswersType } from "../types";

interface ChatPanelProps {
	socket: Socket | null;
	question: string | undefined;
	answers: AnswersType;
}

function ChatPanel({ socket, question, answers }: ChatPanelProps) {
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

	// Assign a color to each user based on their ID
	//! to change
	const colors = ['#ffff00','#ff0000','#0000ff','#ff8800','#00ff00','#ff0088','#ffffff','#000000'];
	const possibleNames : string[] = ['YELLOW', 'RED', 'BLUE', 'ORANGE', 'GREEN', 'PINK', 'WHITE', 'BLACK'];

	const getColor = (id: string) => {
		return colors[possibleNames.indexOf(id)] ?? '#efeff1';
	};

	return (
	<div>
		<div id="chat-context">
			<p id="chat-question" className="label">{question}</p>
			<ul id="chat-answers">
				{answers.map(([playerName, answer], id) => (<li key={id}>{playerName} : {answer}</li>))}
			</ul>
		</div>
		<ul id="messages">
			{messages.map((msg, i) => (
				<li key={i}>
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