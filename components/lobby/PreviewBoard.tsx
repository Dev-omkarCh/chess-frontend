// components/LivePreviewBoard.tsx
export const LivePreviewBoard = ({ boardColor, pieceStyle }: { boardColor: string, pieceStyle: string }) => {
    // We use a light version of the selected color for the "white" squares
    // and a slightly darker version for the "black" squares to create the pattern
    return (
        <div className="w-full aspect-square border-4 border-card rounded-lg overflow-hidden shadow-2xl relative">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                {Array.from({ length: 64 }).map((_, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    const isDark = (row + col) % 2 !== 0;

                    return (
                        <div
                            key={i}
                            style={{
                                backgroundColor: isDark ? boardColor : `${boardColor}dd`,
                                filter: isDark ? 'brightness(0.9)' : 'brightness(1.1)'
                            }}
                            className="flex items-center justify-center"
                        >
                            {/* Optional: Render pieces here based on pieceStyle logic */}
                            {i === 27 && <span className="text-xl">♚</span>}
                            {i === 36 && <span className="text-xl">♛</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};