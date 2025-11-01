import React, { useState, useEffect } from 'react';
import PlatformManager from './managers/PlatformManager';
import GameManager from './managers/GameManager';
import AchievementManager from './managers/AchievementManager';
import VersionManager from './managers/VersionManager';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function GameSetup() {
    const [openSection, setOpenSection] = useState("games");
    const location = useLocation();

    useEffect(() => {
        if (location.state?.openSection) {
            setOpenSection(location.state.openSection);
        }
    }, [location.state]);

    const renderSection = () => {
        switch (openSection) {
            case "platforms":
                return <PlatformManager />;
            case "games":
                return <GameManager />;
            case "versions":
                return<VersionManager />;
            case "achievements":
                return<AchievementManager />;
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
                <button
                    onClick={() => setOpenSection("achievements")} style={{
                    fontWeight: openSection === "achievements" ? "bold" : "normal"
                    }}>
                        Achievements
                </button>
            </div>
            {renderSection()}
        </div>
    )

};
export default GameSetup;