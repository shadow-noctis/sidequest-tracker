import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function EditQuest() {
    const token = localStorage.getItem('token');

    const [games, setGames] = useState(null);
    const [game, setGame] = useState(null)
    const [editQuest, setEditQuest] = useState(null);
    const { questId } = useParams();
    const navigate = useNavigate();
    const [questForm, setQuestForm] = useState({
        title: "",
        description: "",
        location: "",
        requirement: "",
        missable: 0,
        hint: "",
        gameName: "",
        gameId: 0
    });

    useEffect(() => {
        fetch(`http://localhost:3001/api/quests/${questId}`)
            .then((res) => res.json())
            .then((data) => {
                setEditQuest(data.quest);
                setGame(data.game)
                setQuestForm({
                    title: data.quest.title,
                    description: data.quest.description,
                    location: data.quest.location,
                    requirement: data.quest.requirement,
                    missable: data.quest.missable === 1,
                    hint: data.quest.hint,
                    gameId: data.game.gameId,
                    id: data.quest.id
                });
            });
    }, [questId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setQuestForm((prev) =>({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : (name === "gameId" ? Number(value) : value),
        }));
    };

    useEffect(() => {
        console.log(game)
    }, [game])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3001/api/quests/${questId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(questForm),
            });
            if (!res.ok) throw new Error("Failed to update quest")
                navigate(`/games/${editQuest.game_id}/quests`, { state: {toastMessage: 'Quest updated!'}});
        } catch (err) {
            console.error("Error updating quest:", err);
        }
    };

    //Fetch info on mount
    useEffect(() => {
        fetchGames();
        fetch(`http://localhost:3001/api/quests/${questId}`)
        .then(res => res.json())
        .then(data => {
            setEditQuest(data.quest);
        })
        .catch(err => {
            console.error('Error fetching quest:', err);
        });
    }, []);

    //Fetch all games
    const fetchGames = async () => {
        const gameres =  await fetch('http://localhost:3001/api/games')
        const gameData = await gameres.json();
        setGames(gameData);
    }

    useEffect(() => {
        console.log("Set game updated: ", game)
    }, [game])

    if (!editQuest || !games) return <p>Loading quest...</p>;

    return(
        <>
            <div>
                <h2>Edit quest:</h2>
                <h3>{editQuest.title}</h3>
                <ul>
                    <li>Name: {editQuest.title}</li>
                    <li>Description: {editQuest.description}</li>
                    <li>Location: {editQuest.location}</li>
                    <li>Requirements: {editQuest.requirement}</li>
                    <li>Missable: {editQuest.missable === 1 ? "✓" : ""}</li>
                    <li>Hint: {editQuest.hint}</li>
                    <li>Game: {game.gameName}</li>
                </ul>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Title:
                        <input name="title" value={questForm.title} onChange={handleChange} />
                    </label>
                    <label>
                        Description:
                        <textarea name="description" value={questForm.description} onChange={handleChange} />
                    </label>
                    <label>
                        Location:
                        <input name="location" value={questForm.location} onChange={handleChange} />
                    </label>
                    <label>
                        Requirements:
                        <input name="requirement" value={questForm.requirement} onChange={handleChange} />
                    </label>
                    <label>
                        Missable:
                        <input type="checkbox" name="missable" value={questForm.missable === 1} onChange={handleChange} />
                    </label>
                    <label>
                        Hint:
                        <textarea name="hint" value={questForm.hint} onChange={handleChange} />
                    </label>
                    <label>
                        Games:
                        <ul>
                        {games.map(g => (
                                <li key={g.id}>
                                    <input name='gameId' type='radio' value={g.id} checked={questForm.gameId === g.id} onChange={handleChange} />
                                    <label>{g.name}</label>
                                </li>
                                ))}
                        </ul>
                    </label>
                    <p>Title: {questForm.title}<br />Description: {questForm.description}<br />Location {questForm.location}<br />
                    Requirements {questForm.requirement}<br />Missable {questForm.missable}<br />
                    Hint {questForm.hint}<br />Game: {questForm.gameId}</p>
                    <button type='submit'>Save Changes</button>
                    <button><Link to={`/games/${editQuest.game_id}/quests`}>Return</Link></button>

                </form>
            </div>
        </>


    )
}

export default EditQuest;