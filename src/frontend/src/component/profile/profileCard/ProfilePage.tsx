import { useEffect, useState } from "react";
import { type User } from "../../../types/types.js";
import { Leaderboard } from "../leaderboard/Leaderboard.js";
import { OtherProfileSearch } from "./FindProfile.js";
import { Profile } from "./ProfileCard.js";
import FriendsPanel from "../FriendsPanel/FriendsPanel.js";

// Un ami a un id, un username, et un avatar (optionnel)
interface Friend {
  id: string;
  username: string;
  avatar?: string | null;
  online?: boolean;
}

// Les props (paramètres) qu'on attend pour ce composant
interface ProfileProps {
  user: User;
  onUserUpdated?: () => Promise<void> | void;
}

export function ProfilePage(props: ProfileProps) {

  const user = props.user;
  const onUserUpdated = props.onUserUpdated;

  // useState : variable "friendList" qui garde sa valeur entre les rendus
  // "setFriendList" est la fonction pour la modifier
  // <Friend[]> indique que c'est un tableau d'objets Friend
  const [friendList, setFriendList] = useState<Friend[]>([]);

  // "selectedFriend" peut être un Friend OU null (aucun ami sélectionné)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  // Fonction qui va chercher la liste d'amis sur le serveur
  async function refreshFriends() {
    try {
      const res = await fetch("/api/friends", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        return;
      }

      const data: Friend[] = await res.json();
      setFriendList(data); // on met à jour l'état avec la nouvelle liste
    } catch (err) {
      console.error("Error friend request :", err);
    }
  }

  // useEffect avec [] vide = exécuté UNE SEULE FOIS,
  // juste après que le composant apparaisse à l'écran
  useEffect(() => {
    refreshFriends();
  }, []);

  useEffect(() => {
    const id = setInterval(refreshFriends, 30_000);
    return () => clearInterval(id);
  }, []);

  // Au lieu du spread conditionnel "{...(onUserUpdated ? {...} : {})}",
  // on prépare un objet de props simple avec un if/else classique
  let profileProps: any = { user: user };
  if (onUserUpdated) {
    profileProps.onUserUpdated = onUserUpdated;
  }

  return (
    <div className="profile-page">
      <Profile {...profileProps} />

      <Leaderboard />

      <OtherProfileSearch
        friendList={friendList}
        onFriendsChanged={refreshFriends}
        onSelectFriend={setSelectedFriend}
      />

      <FriendsPanel
        user={user}
        friendList={friendList}
        selectedFriend={selectedFriend}
        onSelectFriend={setSelectedFriend}
      />
    </div>
  );
}