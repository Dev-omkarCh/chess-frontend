export type PieceColors = { black: string; white: string };

export type PieceSetData = {
    bishop: PieceColors;
    knight: PieceColors;
    king: PieceColors;
    queen: PieceColors;
    pawn: PieceColors;
    rook: PieceColors;
};

export const PIECE_REGISTRY: Record<string, PieceSetData> = {
    standard: {
        bishop: { black: "/assets/pieces/standard/bb.png", white: "/assets/pieces/standard/wb.png" },
        knight: { black: "/assets/pieces/standard/bn.png", white: "/assets/pieces/standard/wn.png" },
        king: { black: "/assets/pieces/standard/bk.png", white: "/assets/pieces/standard/wk.png" },
        queen: { black: "/assets/pieces/standard/bq.png", white: "/assets/pieces/standard/wq.png" },
        pawn: { black: "/assets/pieces/standard/bp.png", white: "/assets/pieces/standard/wp.png" },
        rook: { black: "/assets/pieces/standard/br.png", white: "/assets/pieces/standard/wr.png" },
    },
    classic: {
        bishop: { black: "/assets/pieces/classic/bb.png", white: "/assets/pieces/classic/wb.png" },
        knight: { black: "/assets/pieces/classic/bn.png", white: "/assets/pieces/classic/wn.png" },
        king: { black: "/assets/pieces/classic/bk.png", white: "/assets/pieces/classic/wk.png" },
        queen: { black: "/assets/pieces/classic/bq.png", white: "/assets/pieces/classic/wq.png" },
        pawn: { black: "/assets/pieces/classic/bp.png", white: "/assets/pieces/classic/wp.png" },
        rook: { black: "/assets/pieces/classic/br.png", white: "/assets/pieces/classic/wr.png" },
    },
    space: {
        bishop: { black: "/assets/pieces/space/bb.png", white: "/assets/pieces/space/wb.png" },
        knight: { black: "/assets/pieces/space/bn.png", white: "/assets/pieces/space/wn.png" },
        king: { black: "/assets/pieces/space/bk.png", white: "/assets/pieces/space/wk.png" },
        queen: { black: "/assets/pieces/space/bq.png", white: "/assets/pieces/space/wq.png" },
        pawn: { black: "/assets/pieces/space/bp.png", white: "/assets/pieces/space/wp.png" },
        rook: { black: "/assets/pieces/space/br.png", white: "/assets/pieces/space/wr.png" },
    },
    neo: {
        bishop: { black: "/assets/pieces/neo/bb.png", white: "/assets/pieces/neo/wb.png" },
        knight: { black: "/assets/pieces/neo/bn.png", white: "/assets/pieces/neo/wn.png" },
        king: { black: "/assets/pieces/neo/bk.png", white: "/assets/pieces/neo/wk.png" },
        queen: { black: "/assets/pieces/neo/bq.png", white: "/assets/pieces/neo/wq.png" },
        pawn: { black: "/assets/pieces/neo/bp.png", white: "/assets/pieces/neo/wp.png" },
        rook: { black: "/assets/pieces/neo/br.png", white: "/assets/pieces/neo/wr.png" },
    }
};

type peiceType = "k" | "q" | "r" | "n" | "b" | "p" | "K" | "Q" | "R" | "B" | "N" | "P" | string
type pieceColor = "w" | "b"
export type pieceStyleType = "standard" | "classic" | "neo" | "space"

export const getPieceStyle = (piece: peiceType, color: pieceColor, pieceStyle: pieceStyleType) => {
    switch (color) {
        case "w":
            switch (piece) {
                case "p":
                    return getPieceSet(pieceStyle).pawn.white;
                case "n":
                    return getPieceSet(pieceStyle).knight.white;
                case "b":
                    return getPieceSet(pieceStyle).bishop.white;
                case "r":
                    return getPieceSet(pieceStyle).rook.white;
                case "q":
                    return getPieceSet(pieceStyle).queen.white;
                case "k":
                    return getPieceSet(pieceStyle).king.white;
            }
        case "b":
            switch (piece) {
                case "p":
                    return getPieceSet(pieceStyle).pawn.black;
                case "n":
                    return getPieceSet(pieceStyle).knight.black;
                case "b":
                    return getPieceSet(pieceStyle).bishop.black;
                case "r":
                    return getPieceSet(pieceStyle).rook.black;
                case "q":
                    return getPieceSet(pieceStyle).queen.black;
                case "k":
                    return getPieceSet(pieceStyle).king.black;
            }
    }
}

export const getPiece = (piece: peiceType, color: pieceColor, pieceStyle: pieceStyleType) => {
    switch (color) {
        case "w":
            switch (piece) {
                case "p":
                    return getPieceStyle(piece, color, pieceStyle);
                case "n":
                    return getPieceStyle(piece, color, pieceStyle);
                case "b":
                    return getPieceStyle(piece, color, pieceStyle);
                case "r":
                    return getPieceStyle(piece, color, pieceStyle);
                case "q":
                    return getPieceStyle(piece, color, pieceStyle);
                case "k":
                    return getPieceStyle(piece, color, pieceStyle);
            }
        case "b":
            switch (piece) {
                case "p":
                    return getPieceStyle(piece, color, pieceStyle);
                case "n":
                    return getPieceStyle(piece, color, pieceStyle);
                case "b":
                    return getPieceStyle(piece, color, pieceStyle);
                case "r":
                    return getPieceStyle(piece, color, pieceStyle);
                case "q":
                    return getPieceStyle(piece, color, pieceStyle);
                case "k":
                    return getPieceStyle(piece, color, pieceStyle);
            }
    }
    throw new Error("Invalid Piece Type");
}

export const getPieceSet = (id: string): PieceSetData => {
    // Fallback to 'standard' if ID doesn't exist
    return PIECE_REGISTRY[id] || PIECE_REGISTRY.standard;
};

//     { id: "green", label: "Green", light: "#EEEED2", dark: "#769656" },
//     { id: "wood", label: "Wood", light: "#F0D9B5", dark: "#B58863" },
//     { id: "blue", label: "Blue", light: "#DEE3E6", dark: "#8CA2AD" },
//     { id: "tan", label: "Tan", light: "#F0D9B5", dark: "#B58863" },
//     { id: "classic", label: "Classic", light: "#F5F5DC", dark: "#8B6914" },
//     { id: "slate", label: "Slate", light: "#C9D8D8", dark: "#6B8E8E" },
//     { id: "marble", label: "Marble", light: "#E8E8E8", dark: "#9E9E9E" },
//     { id: "walnut", label: "Walnut", light: "#D4A96A", dark: "#7B4D2E" },
//     { id: "linen", label: "Linen", light: "#F0EAD6", dark: "#A0785A" },
//     { id: "orange", label: "Orange", light: "#F4A261", dark: "#E76F51" },
//     { id: "emerald", label: "Emerald", light: "#A8D5A2", dark: "#2D6A4F" },
//     { id: "steel", label: "Steel", light: "#D0D0D0", dark: "#707070" },
//     { id: "purple", label: "Purple", light: "#D8C7F0", dark: "#7B5EA7" },
//     { id: "gray", label: "Gray", light: "#CCCCCC", dark: "#888888" },
//     { id: "coral", label: "Coral", light: "#FFB5B5", dark: "#C0392B" },
//     { id: "sand", label: "Sand", light: "#F5DEB3", dark: "#C8A45A" },
//     { id: "midnight", label: "Midnight", light: "#B0C4DE", dark: "#1C3A5E" },
//     { id: "forest", label: "Forest", light: "#C8DEB0", dark: "#2D5016" },
//     { id: "wine", label: "Wine", light: "#D4A0A0", dark: "#722F37" },
//     { id: "bluewhite", label: "Blue-White", light: "#FFFFFF", dark: "#4169E1" },
//     { id: "pink", label: "Pink", light: "#FFB6C1", dark: "#FF69B4" },
//     { id: "crimson", label: "Crimson", light: "#F5A0A0", dark: "#8B0000" },
//     { id: "birch", label: "Birch", light: "#E8D8C0", dark: "#C8A870" },
//     { id: "silver", label: "Silver", light: "#E8E8E8", dark: "#A8A8A8" },
//     { id: "charcoal", label: "Charcoal", light: "#C0C0C0", dark: "#404040" },

export type BoardTheme = "green" | "wood" | "blue" | "tan" |
    "classic" | "slate" | "marble" | "walnut" | "linen" | "orange" |
    "emerald" | "steel" | "purple" | "gray" | "coral" | "sand" | "midnight" |
    "forest" | "wine" | "bluewhite" | "pink" | "crimson" | "birch" |
    "silver" | "charcoal";

export const getColor = (id: BoardTheme) => {
    switch (id) {
        case "green":
            return { id: "green", label: "Green", light: "#EEEED2", dark: "#769656" }

        case "wood":
            return { id: "wood", label: "Wood", light: "#F0D9B5", dark: "#B58863" }

        case "blue":
            return { id: "blue", label: "Blue", light: "#DEE3E6", dark: "#8CA2AD" }

        case "tan":
            return { id: "tan", label: "Tan", light: "#F0D9B5", dark: "#B58863" }

        case "classic":
            return { id: "classic", label: "Classic", light: "#F5F5DC", dark: "#8B6914" }

        case "slate":
            return { id: "slate", label: "Slate", light: "#C9D8D8", dark: "#6B8E8E" }

        case "marble":
            return { id: "marble", label: "Marble", light: "#E8E8E8", dark: "#9E9E9E" }

        case "walnut":
            return { id: "walnut", label: "Walnut", light: "#D4A96A", dark: "#7B4D2E" }

        default:
            return { id: "walnut", label: "Walnut", light: "#D4A96A", dark: "#7B4D2E" }

    }
};

export interface BoardSettings {
    pieceStyle: pieceStyleType
    boardTheme: BoardTheme,
}