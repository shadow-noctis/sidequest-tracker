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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-black text-gray-100 px-6 py-10">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(140,90,255,0.4)] p-8 border border-indigo-700/40">
                <h2 className="text-4xl font-bold text-center text-indigo-300 mb-6 tracking-wide drop-shadow-[0_0_10px_rgba(180,120,255,0.6)]">
                    ✧ Game Setup ✧
                </h2>
                <div className="flex justify-center gap-2 mb-4">
                    <button
                        className={`
                            flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
                            border transition-all duration-200
                            ${openSection === 'games'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-[0_0_15px_rgba(140,90,255,0.4)]'
                            : 'bg-gray-800/50 text-indigo-100 border-indigo-700/40 hover:border-indigo-600/60 hover:bg-indigo-900/40'}
                        `}  
                        onClick={() => setOpenSection("games")}>
                            Games
                    </button>
                    <button
                        onClick={() => setOpenSection("achievements")}
                        className={`
                            flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
                            border transition-all duration-200
                            ${openSection === 'achievements'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-[0_0_15px_rgba(140,90,255,0.4)]'
                            : 'bg-gray-800/50 text-indigo-100 border-indigo-700/40 hover:border-indigo-600/60 hover:bg-indigo-900/40'}
                        `}>
                            Achievements
                    </button>
                    <button
                        className={`
                            flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
                            border transition-all duration-200
                            ${openSection === 'versions'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-[0_0_15px_rgba(140,90,255,0.4)]'
                            : 'bg-gray-800/50 text-indigo-100 border-indigo-700/40 hover:border-indigo-600/60 hover:bg-indigo-900/40'}
                        `}  
                        onClick={() => setOpenSection("versions")}>
                            Versions
                    </button>
                    <button
                        className={`
                            flex-1 px-3 py-2 text-sm sm:text-base tracking-wide font-bold rounded-lg
                            border transition-all duration-200
                            ${openSection === 'platforms'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-[0_0_15px_rgba(140,90,255,0.4)]'
                            : 'bg-gray-800/50 text-indigo-100 border-indigo-700/40 hover:border-indigo-600/60 hover:bg-indigo-900/40'}
                        `}  
                        onClick={() => setOpenSection("platforms")}>
                            Platforms
                    </button>
                </div>
            {renderSection()}
            </div>
        </div>
    )

};
export default GameSetup;