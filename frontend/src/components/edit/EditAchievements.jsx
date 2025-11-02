import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function EditAchievement() {
    const token = localStorage.getItem('token');
    const [achievement, setAchievement] = useState(null);

    const [platforms, setPlatforms] = useState([])
    const [versions, setVersions] = useState([])

    const { achievementId } = useParams();
    const navigate = useNavigate();
    const [achievementForm, setAchievementForm] = useState({
        name: "",
        description: "",
        warning: "",
        requries: "",
        gameId: "",
        platforms: [],
        versions: []
    });

    useEffect(() => {
        fetchPlatforms()
        console.log("AchievementId: ", achievementId)
        fetch(`http://localhost:3001/api/achievements/${achievementId}`)
            .then((res) => res.json())
            .then((data) => {
                setAchievement(data);
                console.log("Achievements: ", data)
                setAchievementForm({
                    id: data.id,
                    name: data.name,
                    warning: data.warning,
                    requires: data.requires,
                    gameId: data.game_id,
                    platforms: data.platforms ? data.platforms.map(p => p.id) : [],
                    versions: data.versions ? data.versions.map(v => v.id) : []
                });
            });
    }, [achievementId]);

    useEffect(() => {
        if (achievementForm.gameId) {
            fetch(`http://localhost:3001/api/versions/${achievementForm.gameId}`)
                .then((res) => res.json())
                .then((data) => {
                    setVersions(data)
                });
        }
    }, [achievementForm.gameId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "gameId") {
            setAchievementForm((prev) => ({
                ...prev,
                [name]: value ? Number(value) : null,
                versions: [] // Reset versions when game changes
            }));
        } else {
            setAchievementForm((prev) =>({
                ...prev,
                [name]: value,
            }));
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3001/api/achievements/${achievementId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(achievementForm),
            });
            if (!res.ok) throw new Error("Failed to update game")
                navigate(`/game-setup`, { state: {toastMessage: 'Achievement updated!', openSection: 'achievements' }});
        } catch (err) {
            console.error("Error updating achievement:", err);
        }
    };

    const fetchPlatforms = async () => {
        const res = await fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setPlatforms(data)
            console.log("Platforms :", data)
        });
    };

    if (!achievement || !platforms) return <p>Loading quest...</p>;

    return(
        <>
            <div>
                <h2>Edit Achievement:</h2>
                <h3>{achievement.name}</h3>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input name="name" value={achievementForm.name} onChange={handleChange} />
                    </label>
                    <label>
                        Requires:
                        <input name="requires" value={achievementForm.requires} onChange={handleChange} />
                    </label>
                    {achievement.description && (
                        <label>
                            Description:
                            <input name="description" value={achievementForm.description} onChange={handleChange} />    
                        </label>)}
                    {achievement.warning && (
                        <label>
                            Warning:
                            <input name="warning" value={achievementForm.warning} onChange={handleChange} />    
                        </label>)}
                    <label>
                        Platforms:
                        <ul>
                            {platforms.map(p => (
                                <li key={p.id}>
                                    <label>
                                        <input name='platforms' type='checkbox' value={p.id} onChange={handleChecked} checked={achievementForm.platforms.includes(p.id)} />
                                        {p.name}</label>
                                </li>
                            ))}
                        </ul>
                    </label>
                    {achievementForm.gameId && (
                        <label>
                            Versions:
                            <ul>
                                {versions.map(v => (
                                    <li key={v.id}>
                                        <label>
                                            <input name='versions' type='checkbox' value={v.id} onChange={handleChecked} checked={achievementForm.versions.includes(v.id)} />
                                            {v.name}</label>
                                    </li>
                                ))}
                            </ul>
                        </label>
                    )}
                    <p>Name: {achievementForm.name}<br />Platforms:{achievementForm.platforms}<br />Versions:{achievementForm.versions}</p>
                    <button type='submit'>Save Changes</button>
                    <button type='button'><Link to={`/game-setup`} state={{ openSection: 'achievements'}}>Return</Link></button>

                </form>
            </div>
        </>

    )
}

export default EditAchievement;