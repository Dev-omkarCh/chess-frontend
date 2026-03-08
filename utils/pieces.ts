// lib/pieces.ts

// Define the structure
export interface PiecePreview {
    src: string; // Path to the image
    color: "white" | "black"; // Color of the piece
    type: "pawn" | "knight" | "bishop" | "rook" | "queen" | "king"; // Type of the piece
}

export interface PieceSet {
    id: string;
    label: string;
    // Use a relative path to the public folder
    preview: [] | PiecePreview[]; // Array of piece previews
}

const StandardPreview: PiecePreview[] = [
    { src: "/images/pieces/standard/wp.png", color: "white", type: "pawn" },
    { src: "/images/pieces/standard/bp.png", color: "black", type: "pawn" },
    { src: "/images/pieces/standard/wk.png", color: "white", type: "king" },
    { src: "/images/pieces/standard/bk.png", color: "black", type: "king" },
    { src: "/images/pieces/standard/wq.png", color: "white", type: "queen" },
    { src: "/images/pieces/standard/bq.png", color: "black", type: "queen" },
    { src: "/images/pieces/standard/wr.png", color: "white", type: "rook" },
    { src: "/images/pieces/standard/br.png", color: "black", type: "rook" },
    { src: "/images/pieces/standard/wn.png", color: "white", type: "knight" },
    { src: "/images/pieces/standard/bn.png", color: "black", type: "knight" },
    { src: "/images/pieces/standard/wb.png", color: "white", type: "bishop" },
    { src: "/images/pieces/standard/bb.png", color: "black", type: "bishop" },
];



const PIECE_SETS: PieceSet[] = [
    {
        id: "standard",
        label: "Standard",
        preview: StandardPreview
    },
    {
        id: "classic",
        label: "Classic",
        preview: []
    },
];

/**
 * Utility function to get the image path for a given ID.
 * This keeps your component logic clean.
 */
export const getPieceSetById = (id: string): PieceSet | undefined => {
    return PIECE_SETS.find((set) => set.id === id);
};