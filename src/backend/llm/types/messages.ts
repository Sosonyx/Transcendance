// A mettre du cotee game pour les messages de chat entre joueurs
export interface RoomChatMessages 
{
    senderId: string;
    content: string;
    timestamp: number;
}