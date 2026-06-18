import type { User } from "../../../types/types";
import FriendChat from "./FriendChat";
import './FriendsPanel.css';

interface Friend {
  id: string;
  username: string;
  avatar?: string | null;
  online?: boolean;
}

interface FriendsPanelProps {
  user: User;
  friendList: Friend[];
  selectedFriend: Friend | null;
  onSelectFriend: (friend: Friend | null) => void;
}

function FriendsPanel({ user, friendList, selectedFriend, onSelectFriend }: FriendsPanelProps) {
  return (
    <div className="friends-container">
      <div className="friends-card">
        <h2 className="friends-title">Mes amis</h2>

        {friendList.length === 0 ? (
          <p className="empty-state">
            Vous n'avez pas encore d'amis. Recherchez un joueur pour en ajouter !
          </p>
        ) : (
          <ul className="friends-list">
            {friendList.map((friend) => (
              <li
                key={friend.id}
                className={`friend-item ${selectedFriend?.id === friend.id ? "active" : ""}`}
                onClick={() => onSelectFriend(friend)}
              >
                <img
                  className="friend-avatar"
                  src={friend.avatar && friend.avatar.trim() !== "" ? friend.avatar : "./profile-avatar.png"}
                  alt="Avatar"
                />
                <span className="friend-username">{friend.username}</span>
                <span className={`status-dot ${friend.online ? 'online' : 'offline'}`} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedFriend !== null && (
        <div className="chat-card">
          <button
            className="chat-close-btn"
            onClick={() => onSelectFriend(null)}
            aria-label="Fermer la discussion"
          >
            ✕
          </button>
          <FriendChat
            user={user}
            friendId={selectedFriend.id}
            friendUsername={selectedFriend.username}
          />
        </div>
      )}
    </div>
  );
}

export default FriendsPanel;