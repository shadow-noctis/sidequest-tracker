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
        versions: [],
        extras: {}
    };

    const [questForm, setQuestForm] = useState(initialFormState);

    const [allGames, setAllGames] = useState([]);
    const [gameId, setGameId] = useState(null);
    const [selectedVer, setSelectedVer] = useState(null)
    const [allVersions, setVersions] = useState([]);

    const token = localStorage.getItem('token');
    
    const addNewQuest = async (e) => {
        e.preventDefault();
        console.log(questForm)
        if (!questForm.versions || questForm.versions.length === 0) {
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
            resetForm();
            toast("Quest added!");

            } catch (error) {
                console.error('Failed to add quest:', error)
            }
        };

    //Handle change missable + radiobuttons
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "gameId") {
            setGameId(value)
        }

        setQuestForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };

    const handleExtraChange = (e) => {
        const { name, value } = e.target;

        // Handle extras
        if (selectedVer?.extras.includes(name)) {
            setQuestForm((prev) => ({
            ...prev,
            extras: {
                ...(prev.extras || {}), // ensure it's an object
                [name]: value,
            },
            }));
            return;
            }
        };


    // Handle checked versions
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

    // Get games
    useEffect(() => {
        fetch('http://localhost:3001/api/games')
        .then(res => res.json())
        .then(data => {
            setAllGames(data)
        })
    }, [])

    useEffect(() => {
        fetch(`http://localhost:3001/api/versions/${gameId}`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            setVersions(data)
        })
    }, [gameId])

    useEffect(() => {
    if (questForm.versions.length > 0) {
        const firstSelected = allVersions.find(v => questForm.versions.includes(v.id));
        if (firstSelected) {
        // Ensure extras is an array of strings (field names)
        setSelectedVer({
            ...firstSelected,
            extras: Array.isArray(firstSelected.extras) ? firstSelected.extras : [],
        });
        }
    }
    }, [questForm.versions]);

    return(
        <div>
            <h1>Add New Quest</h1>
                {/* 1. Select game */}
                    <h3>Game:</h3>
                    <ul>
                    {allGames.map(g => (
                            <li key={g.id}>
                                <label>
                                    <input name='gameId' type='radio' value={g.id} onChange={handleChange} checked={questForm.gameId == g.id}/>
                                    {g.name}
                                </label>
                            </li>     
                    ))}
                    </ul>

                {/* 2. Select versions */}
                {questForm.gameId && (               
                    <label>
                        <h3>Versions: </h3>
                        <ul>
                        {allVersions.map(v => (
                            <li key={v.id}>
                                <label>
                                    <input name="versions" type="checkbox" value={v.id} onChange={handleChecked} checked={questForm.versions.includes(v.id)} />
                                    {v.name}
                                </label>
                            </li>
                        ))}
                        </ul>
                    </label>)}
                {/* 3. Fill out necessary fields */}
                {questForm.versions.length > 0 ? (
                    <form onSubmit={addNewQuest}>
                    <h3>Info</h3>
                <label>
                    Title:
                    <input name="title" value={questForm.title} onChange={handleChange} />
                </label><br />
                <label>
                    Description:
                    <input name="description" value={questForm.description} onChange={handleChange} />
                </label><br />
                <label>
                    Location:
                    <input name="location" value={questForm.location} onChange={handleChange} />
                </label><br />
                <label>
                    Requirement:
                    <input name="requirement" value={questForm.requirement} onChange={handleChange} />
                </label><br />
                <label>
                    Missable:
                    <input type="checkbox" name="missable" value={questForm.missable || false} onChange={handleChange} />
                </label><br />
                <label>
                    Hint:
                    <input name="hint" value={questForm.hint} onChange={handleChange} />
                </label><br />
                    {selectedVer && selectedVer.extras.map(extraName => (
                    <label key={extraName}>
                        {extraName}:
                        <input
                        name={extraName}
                        value={questForm.extras?.[extraName] || ""}
                        onChange={handleExtraChange}
                        />
                    </label>
                    ))}

                <button type='submit'>Add Quest</button>
                <button type="button" onClick={resetForm}>Clear</button>


            </form>
                ) : ("Select game and version")}

            <p>Current choices: <br /> title: {questForm.title}<br /> description {questForm.description}<br /> location: {questForm.location}<br />
                requirement: {questForm.requirement}<br /> missable:{questForm.missable}<br /> hint: {questForm.hint}<br /> game ID:{questForm.gameId}<br />
                versions: {questForm.versions}<br />
            </p>
        </div>
    );
    }

    export default AddQuest;