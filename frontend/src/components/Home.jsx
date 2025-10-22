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
        <div className="bg-background text-text text-center py-4">
            <h1 className="text-4xl font-bold px-4 py-6">QuestLedger</h1>
            <p className="py-6 md:py-4"><i>Track your sidequests to forge your own story...</i></p>
            <p className="text-center px-10">
                Welcome, adventurer!<br />
                Before setting off to your journey, take with you the QuestLedger and make the most of your path.
                QuestLedger has all the information you need but never forging your path or telling you what you shouldn't know.
                Set out for your journey and let QuestLedger make sure you don't stray from the fulfilling path.
            </p>
        </div>
    );
}

export default Home;