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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-indigo-950 to-black text-gray-100 relative overflow-hidden px-6 py-10">
          {/* Decorative floating particles */}
          <div className="absolute inset-0 pointer-events-none animate-pulse bg-[radial-gradient(circle_at_20%_30%,rgba(140,90,255,0.1)_0%,transparent_70%)]"></div>
      
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(140,90,255,0.4)] p-8 border border-indigo-700/40 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-300 drop-shadow-[0_0_10px_rgba(180,120,255,0.6)] tracking-wide mb-4">
              ✧ QuestLedger ✧
            </h1>
      
            <p className="italic text-indigo-200 text-lg md:text-xl mb-6">
              Track your sidequests to forge your own story...
            </p>
      
            <p className="max-w-2xl mx-auto text-center text-base md:text-lg leading-relaxed text-gray-100">
              Welcome, adventurer! <br />
              Before setting off on your journey, take with you the <span className="text-indigo-300 font-semibold">QuestLedger</span> — your faithful companion for progress, discovery, and reflection. <br />
              Record your deeds, revisit your triumphs, and shape your legend.
            </p>
      
            {/* Call-to-action buttons */}
            <div className="mt-10 flex justify-center space-x-4">
              <button
                onClick={() => navigate("/games(quest)")}
                className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-[0_0_15px_rgba(140,90,255,0.4)] transition"
              >
                View Quests
              </button>
            </div>
          </div>
        </div>
      );
      
}

export default Home;