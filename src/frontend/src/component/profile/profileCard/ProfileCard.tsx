import { type User } from "../../../types/types.js";
import { useEffect, useState, type ChangeEvent } from "react";
import { modifyUser } from "../../../services/api.js";
import './Profile.css'
import './ProfileCard.css'


interface ProfileProps {
    user: User;
    onUserUpdated?: () => Promise<void> | void;
	readonly ?: boolean;
}

export function Profile({user, onUserUpdated, readonly = false} : ProfileProps) {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [username, setUsername] = useState<string>(user.username);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User>(user);

    useEffect(() => {
        setCurrentUser(user);
        setUsername(user.username);
    }, [user]);

    const gamePlayed: number = currentUser.playedAs.length;
    const gameWon: number = currentUser.playedAs.filter((game) => game.won).length;

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0])
            setAvatarFile(event.target.files[0]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setEditError(null);
        try {
            const data = await modifyUser(username, avatarFile)
            setCurrentUser(data)
            setUsername(data.username)
            setIsEditing(false);
            setAvatarFile(null)
            await onUserUpdated?.();
        } catch (error) {
            setEditError(error instanceof Error ? error.message : "Impossible de mettre à jour le profil.");
        }
    };

    return (
    <div className="profile-card">
        <div className="profile-avatar-section">
            {!readonly ? (
                <label htmlFor="avatar" className="avatar-wrapper">
                    <img
                        className="avatar"
                        src={currentUser.avatar && currentUser.avatar.trim() !== "" ? currentUser.avatar : "./username.png"}
                        alt="Avatar"
                    />
                    <span className="avatar-overlay">✎</span>
                    <input type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} style={{display: 'none'}} />
                </label>
            ) : (
                <img
                    className="avatar"
                    src={currentUser.avatar && currentUser.avatar.trim() !== "" ? currentUser.avatar : "./username.png"}
                    alt="Avatar"
                />
            )}
            <div className="profile-identity">
                <h2 className="profile-username">{currentUser.username}</h2>
                <p className="profile-email">{currentUser.email}</p>
            </div>
        </div>

        <div className="profile-stats">
            <div className="stat-item">
                <span className="stat-value">{gamePlayed}</span>
                <span className="stat-label">Parties jouées</span>
            </div>
            <div className="stat-item">
                <span className="stat-value">{gameWon}</span>
                <span className="stat-label">Parties gagnées</span>
            </div>
            <div className="stat-item">
                <span className="stat-value">{gamePlayed - gameWon}</span>
                <span className="stat-label">Parties perdues</span>
            </div>
        </div>

        {!readonly && (!isEditing ? (
            <button className="profile-modify-btn" onClick={() => setIsEditing(true)}>Modify Profile</button>
        ) : (
            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                    <label htmlFor="name">Nouveau nom d'utilisateur</label>
                    <input type="text" id="name" value={username} maxLength={20} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                {avatarFile && <p style={{fontSize: '12px', color: '#8a8a9a', margin: 0}}>{avatarFile.name}</p>}
                {editError && <p className="error-msg">{editError}</p>}
                <div className="form-actions">
                    <button type="submit" className="modify-button">Sauvegarder</button>
                    <button type="button" className="modify-button" onClick={() => { setIsEditing(false); setAvatarFile(null); setUsername(currentUser.username); }}>
                        Annuler
                    </button>
                </div>
            </form>
        ))}
    </div>
    );
}