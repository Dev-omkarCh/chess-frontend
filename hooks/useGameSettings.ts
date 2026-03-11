// hooks/useGameSettings.ts
import { useState } from 'react';

export const useGameSettings = () => {
    const [settings, setSettings] = useState({
        boardColor: 'classic',
        pieceSet: 'staunton',
        soundEnabled: true,
        eloRange: 100,
    });

    const saveSettings = async () => {
        // Just pass the object to your endpoint
        await fetch('/api/game/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
        });
    };

    return { settings, setSettings, saveSettings };
};