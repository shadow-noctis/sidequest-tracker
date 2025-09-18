import React, { useState } from 'react';
import PlatformManager from './managers/PlatformManager';
import GameManager from './managers/GameManager';
import VersionManager from './managers/VersionManager';

function GameSetup() {
    const [openSection, setOpenSection] = useState("games");

    const renderSection = () => {
        switch (openSection) {
            case "platforms":
                return <PlatformManager />;
            case "games":
                return <GameManager />;
            case "versions":
                return<VersionManager />;
            default:
                return null;
            }
        };

    return(
        <div>
            <div>
                <button
                    onClick={() => setOpenSection("games")} style={{
                    fontWeight: openSection === "games" ? "bold" : "normal"
                    }}>
                        Games
                </button>
                <button
                    onClick={() => setOpenSection("versions")} style={{
                    fontWeight: openSection === "versions" ? "bold" : "normal"
                    }}>
                        Versions
                </button>
                <button
                    onClick={() => setOpenSection("platforms")} style={{
                    fontWeight: openSection === "platforms" ? "bold" : "normal"
                    }}>
                        Platforms
                </button>
            </div>
            {renderSection()}
        </div>
    )

};
export default GameSetup;