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

export interface Friend {
    username: string;
    email: string;
    avatar: string;
    elo: number;
    fullName: string;
    isOnline: boolean;
    isPlaying: boolean;
    isVerified: boolean;
    lastOnline: string;
    _id: string; // Assuming the ID is passed for keying
}

export interface FriendOnlineStatus {
    _id: string,
    isOnline: boolean,
    isPlaying: boolean,
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

interface Sender {
    _id: string;
    username: string;
    avatar: string;
    elo: string;
}

export interface INotification {
    _id: string;
    sender: Sender;
    isRead: boolean;
    message: string;
    type: 'FRIEND_REQUEST' | "FRIEND_REQUEST_ACCEPTED" | "FRIEND_REQUEST_REJECTED" | 'GAME_INVITE' | 'SYSTEM_ALERT';
    timestamp: string;
    payload?: any;
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
    avatar: string;
    elo: number;
    status: FriendStatus; // "not_friend" | "request_sent" | "friend" | "request_received"
    sendByMe?: boolean; // Only relevant for "request_sent" and "request_received"
}
