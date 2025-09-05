import React, { useState, useEffect} from 'react'
import { toast } from 'react-toastify'

function AddQuest() {

    const initialFormState = {
        title: "",
        description: "",
        location: "",
        requirement: "",
        missable: 0,
        hint: "",
        gameId: null,
        platforms: []
    };

    const [questForm, setQuestForm] = useState(initialFormState)

    const [allGames, setAllGames] = useState([])
    const [allPlatforms, setAllPlatforms] = useState([])

    const token = localStorage.getItem('token');

    // Get games
    useEffect(() => {
        fetchPlatforms();
        fetch('http://localhost:3001/api/games')
        .then(res => res.json())
        .then(data => {
            setAllGames(data)
        })
    }, [])
    
    const addNewQuest = async (e) => {
        e.preventDefault();
        console.log(questForm)
        if (!questForm.platforms || questForm.platforms.length === 0) {
            alert("Please select at least one platform.")
            return;
        }
        try{
            const res = await fetch('http://localhost:3001/api/quests', {
                    method: 'POST',
                    headers: {
                        "Content-type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(questForm),
                });
            
            if (!res.ok) {
                throw new Error(`Server error ${res.status}`)
            } 
            const data = await res.json();
            console.log('Quest added:', data);
            resetForm()
            toast("Quest added!");

            } catch (error) {
                console.error('Failed to add quest:', error)
            }
        };

    const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setQuestForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
    };

    const handleChecked = (e) => {
        const { name, value, checked } = e.target;
        const id = Number(value);

        setQuestForm((prev) => {
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


    const resetForm = () => {
        console.log("Resetting form...")
        setQuestForm(initialFormState)
    };

    const fetchPlatforms = async () => {
        const res = await fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setAllPlatforms(data)
        });
    };

    return(
        <div>
            <h1>Add New Quest</h1>
            <form onSubmit={addNewQuest}>
                <label>
                    Title:
                    <input name="title" value={questForm.title} onChange={handleChange} />
                </label>
                <label>
                    Description:
                    <input name="description" value={questForm.description} onChange={handleChange} />
                </label>
                <label>
                    Location:
                    <input name="location" value={questForm.location} onChange={handleChange} />
                </label>
                <label>
                    Requirement:
                    <input name="requirement" value={questForm.requirement} onChange={handleChange} />
                </label>
                <label>
                    Missable:
                    <input type="checkbox" name="missable" value={questForm.missable || false} onChange={handleChange} />
                </label>
                <label>
                    Hint:
                    <input name="hint" value={questForm.hint} onChange={handleChange} />
                </label>
                <label>
                    Game:
                    <ul>
                    {allGames.map(g => (
                            <li key={g.id}>
                                <input name='gameId' type='radio' value={g.id} onChange={handleChange} checked={questForm.gameId == g.id}/>
                                <label>{g.name}</label>
                            </li>     
                    ))}
                    </ul>
                </label>
                <label>
                    Platforms:
                    <ul>
                    {allPlatforms.map(p => (
                        <li key={p.id}>
                            <input name="platforms" type="checkbox" value={p.id} onChange={handleChecked} checked={questForm.platforms.includes(p.id)} />
                            <label>{p.name}</label>
                        </li>
                    ))}
                    </ul>
                </label>
                <button type='submit'>Add Quest</button>
                <button type="button" onClick={resetForm}>Clear</button>
            </form>
            <p>Current choices: <br /> title: {questForm.title}<br /> description {questForm.description}<br /> location: {questForm.location}<br />
                requirement: {questForm.requirement}<br /> missable:{questForm.missable}<br /> hint: {questForm.hint}<br /> game:{questForm.gameId}<br />
                platforms: {questForm.platforms}
            </p>
        </div>
    );
    }

    export default AddQuest;