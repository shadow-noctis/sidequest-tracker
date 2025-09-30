import React, { useState, useEffect, useContext, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import DeleteModal from '../DeleteModal'
import ConfirmModal from '../ConfirmModal'
import EditAchievement from '../edit/EditAchievements';

function AchievementManager() {

    //User token
    const { user } = useContext(AuthContext)
    const token = localStorage.getItem('token');

    //Toast
    const navigate = useNavigate();
    const hasShown = useRef(false)
    const location = useLocation();

    const [achievements, setAchievements] = useState([]);
    const [allPlatforms, setAllPlatforms] = useState([]);
    const [games, setGames] = useState([])

    // Achievement values
    const initialForm = {
        name: "",
        description: "",
        warning: "",
        requires: "",
        gameId: null,
        platforms: []
    }
    const [achievementForm, setAchievementForm] = useState(initialForm)

    // Selected for delete
    const [selectedDelete, setSelectedDelete] = useState(null)

    // Delete warning
    const [confirmModal, setConfirmModal] = useState(false);


    // Add new Achievement
    const addAchievement = async (e) => {
        e.preventDefault();
        if (!achievementForm.platforms || achievementForm.platforms.length === 0) {
            alert("Please select at least one platform")
            return;
        }
        try{
            const res = await fetch('http://localhost:3001/api/achievements', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(achievementForm),
            });

            if (!res.ok) {
                throw new Error(`Server error ${res.status}`)
            }
            const data = await res.json();
            console.log('Achievement added:', data);
            toast(`Achievement "${achievementForm.name}" added`);
            fetchAchievements();
            resetForm();

        } catch (err) {
            console.error('Failed to add achievement', err)
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAchievementForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setAchievementForm(initialForm)
        };

    
    const handleChecked = (e) => {
        const { name, value, checked } = e.target;
        const id = Number(value);

        setAchievementForm((prev) => {
            if (checked) {
            return {
                ...prev,
                [name]: [...prev[name], id]
            };
            } else {
            return {
                ...prev,
                [name]: prev[name].filter((p) => p !== id)
            };
            }
        });
    };

    // Get existing games
    const fetchAchievements = () => {
        const res =  fetch('http://localhost:3001/api/achievements')
        .then(res => res.json())
        .then(data => {
            console.log("Achievements: ", data)
            setAchievements(data)
        });
    };

    const fetchGames = () => {
        const gameres =  fetch('http://localhost:3001/api/games')
        .then(gameres => gameres.json())
        .then(data => {
            setGames(data)
        });
    };

    // Get all platforms
    const fetchPlatforms = () => {
        const res = fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setAllPlatforms(data)
        });
    };

    // Get existing games
    useEffect(() => {
        fetchGames();
        fetchAchievements();
        fetchPlatforms();
    }, [])

    return(
        <div id='achievement-manager'>
            <h2>Achievements</h2>
            
            {/* List existing platforms*/}
            <h4>Existing Achievements</h4>
            <ul>
                {achievements.map(a => (
                        <li
                            key={a.id}>{a.name}
                            {user?.role === 'admin' && (<Link to={`/achievements/${a.id}`}>Edit</Link>)}
                        </li>
                ))}
            </ul>
            <div>
                <form onSubmit={addAchievement}>
                    <h3>Add Achievement</h3>
                    <label>
                        Name:
                        <input name='name' placeholder='Name' value={achievementForm.name} onChange={handleChange} />
                    </label><br />
                    <label>
                        requires:
                        <input name='requires' placeholder='Requires' value={achievementForm.requires} onChange={handleChange} />
                    </label><br />
                    <label>
                        Description:
                        <input name='description' placeholder='Description' value={achievementForm.description} onChange={handleChange} />
                    </label><br />
                    <label>
                        Warning:
                        <input name='warning' placeholder='Warning' value={achievementForm.warning} onChange={handleChange} />
                    </label><br />
                    <label>
                        Game:
                        <select name='gameId' value={achievementForm.gameId || ""} onChange={handleChange}>
                        <option value="">
                            -- Select a Game --
                        </option>
                        {games.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                        </select>
                    </label><br />
                    <label>
                        <ul>
                            {allPlatforms.map(p => (
                                    <li key={p.id}>
                                        <input type='checkbox' value={p.id} name='platforms' onChange={handleChecked} checked={achievementForm.platforms.includes(p.id)}/>
                                        <label>{p.name}</label>
                                    </li>
                            ))}
                        </ ul>
                    </label>
                    <button type='submit'>Add Achievement</button>
                </form>
                <p>
                    Name: {achievementForm.name}<br />Requries: {achievementForm.requires}<br />Description: {achievementForm.description}<br />
                    Warning: {achievementForm.warning}<br />GameId: {achievementForm.gameId}<br />Platforms: {achievementForm.platforms}<br />
                </p>
            </div>
        </div>
    )



};
export default AchievementManager;