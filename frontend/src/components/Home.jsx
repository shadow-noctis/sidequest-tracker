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

    useEffect(() => {
        fetch('http://localhost:3001/api/dummytest')
    }, [])

    return (
        <div>
            <h1>Side Quest Tracker</h1>
        </div>
    );
}

export default Home;
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
        <div>
            <h1>Side Quest Tracker</h1>
        </div>
    );
}

export default Home;