import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Home() {
    const location = useLocation();
    const navigate = useNavigate();
    const hasShown = useRef(false)

    useEffect(() => {
        if (location.state?.toastMessage && !hasShown.current) {
            toast(location.state.toastMessage);
            hasShown.current = true;
            navigate(location.pathname, {replace: true})
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-[#0b0b15] to-background text-text relative overflow-hidden">
          {/* Decorative floating particles */}
          <div className="absolute inset-0 pointer-events-none animate-pulse bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.05)_0%,transparent_70%)]"></div>
      
          <h1 className="text-5xl md:text-6xl font-extrabold text-accent drop-shadow-lg tracking-wide mb-4">
            QuestLedger
          </h1>
      
          <p className="italic text-accentAlt text-lg md:text-xl mb-6">
            Track your sidequests to forge your own story...
          </p>
      
          <p className="max-w-2xl text-center text-base md:text-lg leading-relaxed px-6">
            Welcome, adventurer! <br />
            Before setting off on your journey, take with you the <span className="text-accentAlt font-semibold">QuestLedger</span> — your faithful companion for progress, discovery, and reflection. <br />
            Record your deeds, revisit your triumphs, and shape your legend.
          </p>
      
          {/* Call-to-action buttons */}
          <div className="mt-10 flex space-x-4">
            <button
              onClick={() => navigate("/games(quest)")}
              className="bg-accent text-background font-semibold px-6 py-3 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200"
            >
              View Quests
            </button>
          </div>
        </div>
      );
      
}

export default Home;