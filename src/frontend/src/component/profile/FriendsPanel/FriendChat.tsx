import { useEffect, useRef, useState } from "react";
import type { User } from "../../../types/types";
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface FriendChatProps {
  user: User;
  friendId: string;
  friendUsername?: string;
}

function FriendChat({ user, friendId, friendUsername }: FriendChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (message.trim().length > 0) {
      socket?.emit('friend:message', friendId, message.trim());
      setMessage('');
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleMessage = (msg: ChatMessage) => {
    setMessages((msgs) => [...msgs, msg]);
  };

  // Charge l'historique des messages quand on ouvre une conversation
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/messages/${friendId}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          console.error('Erreur historique messages :', res.status);
          return;
        }
        const data: ChatMessage[] = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Erreur réseau :', err);
      }
    };
    fetchHistory();
  }, [friendId]);

  // Connexion socket pour le temps réel
  useEffect(() => {
    const s: Socket = io(undefined, {
      auth: {
        user: {
          id: user.id,
          username: user.username
        },
      }
    });
    setSocket(s);
    s.emit('friend:join', friendId);
    s.on('friend:message', handleMessage);
    return () => { s.disconnect(); };
  }, [friendId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="friendchat-layout">
      {friendUsername && <h3>{friendUsername}</h3>}
      <ul id="friend-messages">
        {messages.map((msg) => (
          <li key={msg.id} className={msg.senderId === user.id ? 'sent' : 'received'}>
            {msg.content}
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>
      <form id="friend-chatform" onSubmit={handleSubmit}>
        <input id="friend-input" type="text" placeholder="Message..." autoComplete="off" onChange={handleChange} value={message} />
        <button id="friend-send-btn" type="submit">Envoyer</button>
      </form>
    </div>
  );
}

export default FriendChat;