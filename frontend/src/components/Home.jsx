import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function Home() {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.toastMessage) {
            toast.success(location.state.toastMessage);
        }
    }, [location.state]);

    return (
        <div>
            <h1>Side Quest Tracker</h1>
        </div>
    );
}

export default Home;