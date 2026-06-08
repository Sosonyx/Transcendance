import { type User } from "../../../types/types.js";
import { useEffect, useState, type ChangeEvent } from "react";
import './Profile.css'
import { modifyUser } from "../../../services/api.js";

interface ProfileProps {
  user: User;
    onUserUpdated?: () => Promise<void> | void;
}

export function Profile({user, onUserUpdated} : ProfileProps) {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [username, setUsername] = useState<string>(user.username);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [currentUser, setCurrentUser] = useState<User>(user);
	
    useEffect(() => {
        setCurrentUser(user);
        setUsername(user.username);
    }, [user]);

    const gamePlayed: number = currentUser.playedAs.length;
    let gameWon: number = currentUser.playedAs.filter((game) => game.won).length;

	const handleAvatarChange = (event : ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]){
			const file = event.target.files[0];
			setAvatarFile(file)
		}
	}

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
		try{
			const data = await modifyUser(username, avatarFile)
            setCurrentUser(data)
            setUsername(data.username)
            setIsEditing(false);
            setAvatarFile(null)
			await onUserUpdated?.();
		} catch (error) {
            alert("Impossible de mettre à jour le profil.");
        }
    }
	return (<>
	<div className="profile-page">
		<div className="profile-card">
            {currentUser.avatar && currentUser.avatar.trim() !== "" ? (
            <img className="avatar" src={currentUser.avatar} alt="Avatar" />
			) : (
			<img className="avatar" src="./defaultUser.png" alt="Avatar par défaut" />
			)}
			{!isEditing ? (
                <>
                    <br />
                    <button className="button" onClick={() => setIsEditing(true)}>Modify</button>
                </>
            ) : (
                <form onSubmit={handleSubmit} className="edit-form" acceptCharset="utf-8">
                    <div className="form-group">
                        <label htmlFor="text">New username :</label>
                        <input 
                            type="text" 
                            id="name" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>  

                    <div className="form-group">
                        <label htmlFor="avatar">New Avatar :</label>
                        <input 
                            type="file" 
                            id="avatar" 
                            accept="image/*" 
                            onChange={handleAvatarChange} 
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="modify-button">Save</button>
                        <button 
                            type="button" 
                            className="modify-button" 
                            onClick={() => {
                                setIsEditing(false);
                                setAvatarFile(null)
                                setUsername(currentUser.username);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
			<h2>{currentUser.username}'s Profile</h2>
            Email: {currentUser.email}<br/><br/>
			Games played : {gamePlayed}<br/><br/>
			Games won : {gameWon}<br/><br/>
			Games lose : {gamePlayed - gameWon}
		</div>
	</div>
	</>)
}