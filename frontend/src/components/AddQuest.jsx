import React, { useState, useEffect} from 'react'

function AddQuest() {
    const [newTitle, setNewTitle] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [gameName, setGameName] = useState("")
    const [gamePlatform, setGamePlatform] = useState("")
    const [location, setLocation] = useState("")

    const addQuest = async () => {
        fetch('http://localhost:3001/api/quests',
            {
                method: 'POST',
                body: JSON.stringify({
                'Title': newTitle,
                'Description': newDescription,
                'Game': gameName,
                'Platform': gamePlatform,
                'Location': location
                }),
            })
        .then(response => response.json())
        resetForm();
    };

}

    const resetForm = ()  => {
        setNewTitle("");
        setNewDescription("");
        setGameName("");
        setGamePlatform("");
        setLocation("");
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
        </div>
    )