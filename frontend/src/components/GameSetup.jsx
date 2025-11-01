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
        <div className="px-10">
            <div className="mx-auto mt-8 bg-surface/70 border border-accent/20 rounded-2xl shadow-lg shadow-accent/10 p-4">
            <h2 className="text-4xl font-bold text-accent mb-6 text-center">Game Setup</h2>
            
            {/* Navigation Tabs */}
            <div className="flex justify-center gap-2 mb-4">
                <button
                    onClick={() => setOpenSection("games")}
                    className={`
                        flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
                        border transition-all duration-200
                        ${openSection === "games"
                            ? 'bg-accentAlt text-background shadow-lg shadow-accentAlt/30 border-accentAlt'
                            : 'bg-surface text-accent border-accent/30 hover:border-accent/80 hover:bg-accent/10'}
                    `}
                >
                    Games
                </button>
                <button
                    onClick={() => setOpenSection("achievements")}
                    className={`
                        flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
                        border transition-all duration-200
                        ${openSection === "achievements"
                            ? 'bg-accentAlt text-background shadow-lg shadow-accentAlt/30 border-accentAlt'
                            : 'bg-surface text-accent border-accent/30 hover:border-accent/80 hover:bg-accent/10'}
                    `}
                >
                    Achievements
                </button>
                <button
                    onClick={() => setOpenSection("versions")}
                    className={`
                        flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
                        border transition-all duration-200
                        ${openSection === "versions"
                            ? 'bg-accentAlt text-background shadow-lg shadow-accentAlt/30 border-accentAlt'
                            : 'bg-surface text-accent border-accent/30 hover:border-accent/80 hover:bg-accent/10'}
                    `}
                >
                    Versions
                </button>
                <button
                    onClick={() => setOpenSection("platforms")}
                    className={`
                        flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
                        border transition-all duration-200
                        ${openSection === "platforms"
                            ? 'bg-accentAlt text-background shadow-lg shadow-accentAlt/30 border-accentAlt'
                            : 'bg-surface text-accent border-accent/30 hover:border-accent/80 hover:bg-accent/10'}
                    `}
                >
                    Platforms
                </button>
            </div>
            
            {/* Section Content */}
            <div className="mt-6">
                {renderSection()}
                </div>
            </div>
        </div>
    )

};
export default GameSetup;