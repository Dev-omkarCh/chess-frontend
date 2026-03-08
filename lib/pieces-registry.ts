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

export const getPieceSet = (id: string): PieceSetData => {
    // Fallback to 'standard' if ID doesn't exist
    return PIECE_REGISTRY[id] || PIECE_REGISTRY.standard;
};