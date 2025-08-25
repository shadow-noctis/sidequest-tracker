import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function EditQuest() {
    const token = localStorage.getItem('token');

    const [quest, setQuest] = useState(null);
    const { questId } = useParams();
    const navigate = useNavigate();
    const [questForm, setQuestForm] = useState({
        title: "",
        description: "",
        location: "",
        requirement: "",
        missable: "",
        hint: ""
    })

    useEffect(() => {
        fetch(`http://localhost:3001/api/quests/${questId}`)
        .then((res) => res.json())
        .then((data) => {
            setQuest(data);
            setQuestForm({
                title: data.title,
                description: data.description,
                location: data.location,
                requirement: data.requirement,
                missable: data.missable === 1,
                hint: data.hint,
                id: data.id
            });
        })
        .catch((err) => console.error("Error fetching quest:", err))
    }, [questId])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setQuestForm((prev) =>({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
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

    //Fetch info on mount
    
    useEffect(() => {
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
                    <li>Name: {quest.title}</li>
                    <li>Description: {quest.description}</li>
                    <li>Location: {quest.location}</li>
                    <li>Requirements: {quest.requirement}</li>
                    <li>Missable: {quest.missable}</li>
                    <li>Hint: {quest.hint}</li>
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
                        <input type="checkbox" name="missable" value={questForm.missable || false} onChange={handleChange} />
                    </label>
                    <label>
                        Hint:
                        <textarea name="hint" value={questForm.hint} onChange={handleChange} />
                    </label>
                    <button type='submit'>Save Changes</button>
                    <button><Link to={`/games/${quest.game_id}/quests`}>Return</Link></button>

                </form>
            </div>
        </>


    )
}

export default EditQuest;