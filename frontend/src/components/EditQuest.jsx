import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function EditQuest() {
    const token = localStorage.getItem('token');
    const [test, setTest] = useState("")

    const [platforms, setPlatforms] = useState(null)

    const [quest, setQuest] = useState(null);
    const { questId } = useParams();
    const navigate = useNavigate();
    const [questForm, setQuestForm] = useState({
        title: "",
        description: "",
        location: "",
        requirement: "",
        missable: 0,
        hint: ""
    })

    useEffect(() => {
        fetch(`http://localhost:3001/api/quests/${questId}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Quest data:", data)
                setQuest(data);
                setQuestForm({
                    title: data.quest.title,
                    description: data.quest.description,
                    location: data.quest.location,
                    requirement: data.quest.requirement,
                    missable: data.quest.missable === 1,
                    hint: data.quest.hint,
                    id: data.quest.id
                });
            });
    }, [questId]);

    useEffect(() => {
        console.log("quest state updated:", quest);
        }, [quest]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setQuestForm((prev) =>({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
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
                body: JSON.stringify(questForm),
            });
            if (!res.ok) throw new Error("Failed to update quest")
                navigate(`/games/${quest.game_id}/quests`, { state: {toastMessage: 'Quest updated!'}});
        } catch (err) {
            console.error("Error updating quest:", err);
        }
    };

    const fetchPlatforms = async () => {
        const res = await fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setPlatforms(data)
        });
    };
    //Fetch info on mount
    useEffect(() => {
        fetchPlatforms();
        fetch(`http://localhost:3001/api/quests/${questId}`)
        .then(res => res.json())
        .then(data => {
            setQuest(data);
        })
        .catch(err => {
            console.error('Error fetching quest:', err);
        });
    }, []);

    if (!quest) return <p>Loading quest...</p>;

    return(
        <>
            <div>
                <h2>Edit quest:</h2>
                <h3>{quest.title}</h3>
                <ul>
                    <li>{test}</li>
                    <li>Name: {quest.quest.title}</li>
                    <li>Description: {quest.quest.description}</li>
                    <li>Location: {quest.quest.location}</li>
                    <li>Requirements: {quest.quest.requirement}</li>
                    <li>Missable: {quest.quest.missable === 1 ? "✓" : ""}</li>
                    <li>Hint: {quest.quest.hint}</li>
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
                        <input type="checkbox" value={questForm.platforms} onChange={handleChange}></input>
                    </label>
                    <p>Title: {questForm.title}<br />Description: {questForm.descrption}<br />Location {questForm.location}<br />
                    Requirements {questForm.requirement}<br />Missable {questForm.missable}<br />
                    Hint {questForm.hint}<br />Platforms {questForm.platforms}<br /></p>
                    <button type='submit'>Save Changes</button>
                    <button><Link to={`/games/${quest.game_id}/quests`}>Return</Link></button>

                </form>
            </div>
        </>


    )
}

export default EditQuest;