import { useEffect, useState } from "react";
import type { User } from "../../../types/types";
import FriendChat from "./FriendChat";

interface Friend {
  id: string;
  username: string;
  avatar?: string | null;
}

interface FriendsPanelProps {
  user: User;
}

function FriendsPanel({ user }: FriendsPanelProps) {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendList, setFriendList] = useState<Friend[]>([]);

  const getFriendsList = async () => {
    try {
      const res = await fetch('/api/friends', {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        console.error('Error 1');
        return;
      }
      const data: Friend[] = await res.json();
      setFriendList(data);
    } catch (err) {
      console.error('Error 2', err);
    }
  };

  useEffect(() => {
    getFriendsList();
  }, []);

  return (
    <div className="friends-layout">
      <ul className="friends-list">
        {friendList.map((friend) => (
          <li
            key={friend.id}
            className="friend"
            onClick={() => setSelectedFriend(friend)}
          >
            {friend.username}
          </li>
        ))}
      </ul>
      {selectedFriend !== null && (
        <FriendChat user={user} friendId={selectedFriend.id} friendUsername={selectedFriend.username} />
      )}
    </div>
  );
}

export default FriendsPanel;