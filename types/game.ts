export interface MatchPreferences {
    timeControl: string;
    isChatEnabled: boolean;
    type: "ranked" | "casual";
    color: "white" | "black" | "random";
}