import React, { useState, useEffect} from 'react'
import { toast } from 'react-toastify'

function AddQuest() {
    const [newTitle, setNewTitle] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [gameName, setGameName] = useState("")
    const [platforms, setGamePlatform] = useState([])
    const [newLocation, setNewLocation] = useState("")
    const [newHint, setNewHint] = useState("")
    const [newRequirement, setNewRequirement] = useState("")

    const token = localStorage.getItem('token');

    const addNewQuest = async () => {
        try{
            const res = await fetch('http://localhost:3001/api/quests', {
                    method: 'POST',
                    headers: {
                        "Content-type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                    'title': newTitle,
                    'description': newDescription,
                    'gameName': gameName,
                    'platformName': platforms,
                    'location': newLocation,
                    'hint': newHint,
                    'requirement':newRequirement
                    }),
                });
            
            if (!res.ok) {
                throw new Error(`Server error ${res.status}`)
            } 
            const data = await res.json();
            console.log('Quest added:', data);
            toast("Quest added!")

            resetForm();

            } catch (error) {
                console.error('Failed to add quest:', error)
            }
        };

    const resetForm = ()  => {
        setNewTitle("");
        setNewDescription("");
        setGameName("");
        setGamePlatform("");
        setNewLocation("");
        setNewHint("");
        setNewRequirement("");
    };

    return(
        <div>
            <h1>Add New Quest</h1>
            <input
                type='text'
                placeholder="Title"
                value={newTitle}
                onChange={(q) => setNewTitle(q.target.value)}
            />
            <input
                type='text'
                placeholder="Description"
                value={newDescription}
                onChange={(q) => setNewDescription(q.target.value)}
            />
            <input
                type='text'
                placeholder="Game"
                value={gameName}
                onChange={(q) => setGameName(q.target.value)}
            />
            <input
                type='text'
                placeholder="Platforms"
                value={platforms}
                onChange={(q) => setGamePlatform(q.target.value)}
            />
            <input
                type='text'
                placeholder="Location"
                value={newLocation}
                onChange={(q) => setNewLocation(q.target.value)}
            />
            <input
                type='text'
                placeholder="Requirement"
                value={newRequirement}
                onChange={(q) => setNewRequirement(q.target.value)}
            />
            <input
                type='text'
                placeholder="Hint"
                value={newHint}
                onChange={(q) => setNewHint(q.target.value)}
            />
            <br />
            <button onClick={addNewQuest}>Submit</button>
            <button onClick={resetForm}>Cancel</button>
        </div>
    );
    }

    export default AddQuest;