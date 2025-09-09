import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function EditGame() {
    const token = localStorage.getItem('token');

    const [platforms, setPlatforms] = useState([])

    const [editGame, setEditGame] = useState(null);
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [gameForm, setGameForm] = useState({
        name: "",
        publisher: "",
        year: "",
        platforms: []
    });

    useEffect(() => {
        fetchPlatforms()
        fetch(`http://localhost:3001/api/games/${gameId}`)
            .then((res) => res.json())
            .then((data) => {
                setEditGame(data);
                setGameForm({
                    name: data.name,
                    publisher: data.publisher,
                    id: data.id,
                    platforms: data.platforms.map(p => p.id)
                });
            });
    }, [gameId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGameForm((prev) =>({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };

    const handleChecked = (e) => {
        const { name, value, checked } = e.target;
        const id = Number(value);

        setGameForm((prev) => {
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
            const res = await fetch(`http://localhost:3001/api/games/${gameId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(gameForm),
            });
            if (!res.ok) throw new Error("Failed to update game")
                navigate(`/game-platform`, { state: {toastMessage: 'Game updated!'}});
        } catch (err) {
            console.error("Error updating game:", err);
        }
    };

    const fetchPlatforms = async () => {
        const res = await fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setPlatforms(data)
        });
    };

    if (!editGame || !platforms) return <p>Loading quest...</p>;

    return(
        <>
            <div>
                <h2>Edit Game:</h2>
                <h3>{editGame.name}</h3>
                <ul>
                    <li>Name: {editGame.name}</li>
                    <li>Publisher: {editGame.publisher}</li>
                </ul>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input name="name" value={gameForm.name} onChange={handleChange} />
                    </label>
                    <label>
                        Publisher:
                        <input name="publisher" value={gameForm.publisher} onChange={handleChange} />
                    </label>
                    <label>
                        Platforms:
                        <ul>
                            {platforms.map(p => (
                                <li key={p.id}>
                                    <label>
                                        <input name='platforms' type='checkbox' value={p.id} onChange={handleChecked} checked={gameForm.platforms.includes(p.id)} />
                                        {p.name}</label>
                                </li>
                            ))}
                        </ul>
                    </label>
                    <p>Name: {gameForm.name}<br />Publisher: {gameForm.publisher}<br />Platforms:{gameForm.platforms}</p>
                    <button type='submit'>Save Changes</button>
                    <button type='button'><Link to={`/game-platform`}>Return</Link></button>

                </form>
            </div>
        </>


    )
}

export default EditGame;