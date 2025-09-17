import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function EditQuest() {
    const token = localStorage.getItem('token');

    const [editQuest, setEditQuest] = useState(null);
    const { questId } = useParams();
    const navigate = useNavigate();

    const [versions, setVersions] = useState([]);
    const [initialVersions, setInitialVersions] = useState([])
    const [questForm, setQuestForm] = useState({
        title: "",
        description: "",
        location: "",
        requirement: "",
        missable: 0,
        hint: "",
        gameId: null,
        versions: [],
        extras: {}
    });

    useEffect(() => {
        fetch(`http://localhost:3001/api/quests/${questId}`)
            .then((res) => res.json())
            .then((data) => {
                setEditQuest(data);
                console.log(data)
                setQuestForm({
                    title: data.title,
                    description: data.description,
                    location: data.location,
                    requirement: data.requirement,
                    missable: data.missable === 1,
                    hint: data.hint,
                    gameId: data.game_id,
                    id: data.id,
                    versions: data.versions.map(v => v.id),
                    extras: data.extras
                });
                setInitialVersions(data.versions.map(ver => ver.id))
            });
    }, [questId]);

    useEffect(() => {
        if (editQuest) {
        console.log("Edit quest:", editQuest)
        fetch(`http://localhost:3001/api/versions/${editQuest.game_id}`)
        .then((res) => res.json())
        .then((data) => {
            setVersions(data)
        })}
    }, [editQuest])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "missable") {
            setQuestForm((prev) => ({
                ...prev,
                missable: checked ? 1 : 0
            }));
            return;
        }
        if (name === "gameId") {
            setQuestForm((prev) => ({
                ...prev,
                gameId: Number(value)
            }));
            return;
        }

        if (name === "versions") {
            const id = Number(value);
            setQuestForm((prev) => {
                if (checked) {
                    return {
                        ...prev,
                        [name]: [...prev[name], id]
                    }
                } else {
                    return {
                        ...prev,
                        [name]: prev[name].filter((p) => p !== id)
                    };
                }
            });
        }

        if (Object.keys(editQuest?.extras)?.includes(name)) {
            setQuestForm((prev) => ({
                ...prev,
                extras: {
                    ...prev.extras,
                    [name]: value
                }
            }));
            return
        }

        setQuestForm((prev) =>({...prev, [name]: value}));
        };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3001/api/quests/${questId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...questForm,
                    extras: JSON.stringify(questForm.extras)
                }),
            });
            if (!res.ok) throw new Error("Failed to update quest")
                navigate(`/games/${editQuest.game_id}/quests`, { state: {toastMessage: 'Quest updated!'}});
        } catch (err) {
            console.error("Error updating quest:", err);
        }
    };

    if (!editQuest || !versions) return <p>Loading quest...</p>;

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
                    {editQuest.extras && Object.entries(editQuest.extras).map(([key, value]) =>
                    <li key={key}>{key}: {value}</li>
                    )}
                </ul>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Title:
                        <input name="title" value={questForm.title} onChange={handleChange} />
                    </label><br />
                    <label>
                        Description:
                        <textarea name="description" value={questForm.description} onChange={handleChange} />
                    </label><br />
                    <label>
                        Location:
                        <input name="location" value={questForm.location} onChange={handleChange} />
                    </label><br />
                    <label>
                        Requirements:
                        <input name="requirement" value={questForm.requirement} onChange={handleChange} />
                    </label><br />
                    <label>
                        Missable:
                        <input type="checkbox" name="missable" value={questForm.missable === 1} onChange={handleChange} />
                    </label><br />
                    <label>
                        Hint:
                        <textarea name="hint" value={questForm.hint} onChange={handleChange} />
                    </label><br />
                    <label>
                    <div id='extras'>
                        {questForm.extras && Object.entries(questForm.extras).map(([key, value]) =>
                        <label key={key}>
                            {key}:
                            <input name={key} value={value} onChange={handleChange}></input>
                        </label>)}
                    </div>

                        Game: <br />
                        <input name='gameId' value={questForm.gameId} type='radio' disabled={true} checked={true}/>
                        {editQuest.gameName}
                    </label><br />
                    <label>
                        Versions:
                        <ul>
                            {versions.map(v => {
                                const vExtras = Array.isArray(v.extras) ? [...v.extras].slice().sort() : [];
                                const questExtras = editQuest.extras ? Object.keys(editQuest.extras).slice().sort() : []
                                return (
                                <li key={v.id}>
                                    <label key={v.name}>
                                        <input name='versions' type='checkbox' value={v.id} onChange={handleChange} checked={questForm.versions.includes(v.id)}
                                            disabled={initialVersions.includes(v.id) || JSON.stringify(vExtras) !== JSON.stringify(questExtras)
                                            }
                                        />
                                        {v.name}
                                    </label>
                                </li>
                                );
                            })}
                        </ul>
                    </label><br />
                    <p>Title: {questForm.title}<br />Description: {questForm.description}<br />Location {questForm.location}<br />
                    Requirements {questForm.requirement}<br />Missable {questForm.missable}<br />
                    Hint {questForm.hint}<br />Game: {questForm.gameId}<br /><br /> Quest Id: {editQuest.id}</p>
                    <br />Extras: {questForm.extras && Object.entries(questForm.extras).map(([key, value]) => <p>{key}: {value}</p>)}

                    <button type='submit'>Save Changes</button>
                    <button type='button'><Link to={`/games/${editQuest.game_id}/quests`}>Return</Link></button>

                </form>
            </div>
        </>


    )
}

export default EditQuest;