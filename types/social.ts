export interface UserProfile {
    _id: string;
    username: string;
    fullName: string;
    elo: number;
    avatarLetter: string;
    avatarColor: string;
    isOnline: boolean;
}


export interface Notification {
    _id: string;
    type: NotificationType;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    fromUser?: Pick<UserProfile, "_id" | "username" | "avatarLetter" | "avatarColor">;
}

export interface Friend extends UserProfile {
    friendSince: string;
}

export interface InboxMessage {
    _id: string;
    subject: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    category: "system" | "announcement" | "support";
}

export interface IFriendship {
    _id: string;
    sender: string;
    recipient: string;
    status: FriendStatus;
    createdAt: string;
    updatedAt: string;
}

export interface INotification {
    _id: string;
    type: 'FRIEND_REQUEST' | 'GAME_INVITE' | 'SYSTEM_ALERT';
    message: string;
    senderName?: string;
    payload?: any; // For redirecting to gameId or profile
    timestamp: number;
}

export type NotificationType =
    | "friend_request" | "game_invite" | "game_result"
    | "system" | "achievement";

export type FriendStatus =
    | "not_friend" | "request_sent" | "friend" | "request_received";

export interface SearchResult {
    _id: string;
    username: string;
    fullName: string;
    elo: number;
    status: FriendStatus; // "not_friend" | "request_sent" | "friend" | "request_received"
    sendByMe?: boolean; // Only relevant for "request_sent" and "request_received"
}
