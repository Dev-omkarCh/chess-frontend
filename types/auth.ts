export interface User {
    _id: string;
    fullName: string,
    username: string;
    email: string;
    profilePicture: string,
    bio: string,
    role: string,
    gender: "male" | "female" | "other",
    friends: string[],
    isVerified: boolean,
    elo: number,
    lastLogin: string,
    createdAt: string,
    updatedAt: string,
    avatar?: string,
}