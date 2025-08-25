import React, { useState, useEffect} from 'react'
import { toast } from 'react-toastify'

function AddQuest() {
    const [questForm, setQuestForm] = useState({
        title: "",
        description: "",
        location: "",
        requirement: "",
        missable: 0,
        hint: "",
        gameName: ""
    })

    const [allGames, setAllGames] = useState([])

    const token = localStorage.getItem('token');

    // Get games
    useEffect(() => {
        fetch('http://localhost:3001/api/games')
        .then(res => res.json())
        .then(data => {
            setAllGames(data)
        })
    }, [])
    
    const addNewQuest = async (e) => {
        e.preventDefault()
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

    const resetForm = () => {
        document.getElementById('add-quest-form').reset()
    }

    return(
        <div>
            <h1>Add New Quest</h1>
            <form onSubmit={addNewQuest} id='add-quest-form'>
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
                    {allGames.map(g => (
                        <ul>
                            <li key={g.id}>
                                <input name='gameName' type='radio' value={g.name} onChange={handleChange} />
                                <label>{g.name}</label>
                            </li>
                        </ul>
                    ))}
                </label>
                <button type='submit'>Add Quest</button>
                <button onClick={resetForm}>Clear</button>
            </form>
            <p>Current choices: <br /> title: {questForm.title}, description {questForm.description}, location: {questForm.location},
            requirement: {questForm.requirement}, missable:{questForm.missable}, hint: {questForm.hint}, game:{questForm.gameName}</p>
        </div>
    );
    }

    export default AddQuest;