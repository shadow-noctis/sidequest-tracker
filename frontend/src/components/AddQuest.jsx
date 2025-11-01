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
                    body: JSON.stringify({
                        ...questForm,
                        extras: JSON.stringify(questForm.extras)}),
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

    // Get versions
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
        <div className="px-8 py-6 text-text">
            <h2 className="text-4xl font-bold text-accent mb-6 text-center">Add New Quest</h2>
            
            {/* Game Selection */}
            <section className="bg-surface p-6 rounded-2xl shadow-xl mb-6">
                <h3 className="text-2xl text-accentAlt font-semibold mb-4">Game</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allGames.map(g => (
                        <li key={g.id}>
                            <label className="flex items-center bg-[#0d0b1e] px-4 py-3 rounded-lg hover:bg-accent/10 transition cursor-pointer">
                                <input 
                                    name='gameId' 
                                    type='radio' 
                                    value={g.id} 
                                    onChange={handleChange} 
                                    checked={questForm.gameId == g.id}
                                    style={{ accentColor: '#8e7cc3' }}
                                    className="mr-3 cursor-pointer"
                                />
                                <span className="text-text font-medium">{g.name}</span>
                            </label>
                        </li>     
                    ))}
                </ul>
            </section>

            {/* Version Selection */}
            {questForm.gameId && (
                <section className="bg-surface p-6 rounded-2xl shadow-xl mb-6">
                    <h3 className="text-2xl text-accentAlt font-semibold mb-4">Versions</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allVersions.map(v => (
                            <li key={v.id}>
                                <label className="flex items-center bg-[#0d0b1e] px-4 py-3 rounded-lg hover:bg-accent/10 transition cursor-pointer">
                                    <input 
                                        name="versions" 
                                        type="checkbox" 
                                        value={v.id} 
                                        onChange={handleChecked} 
                                        checked={questForm.versions.includes(v.id)}
                                        style={{ accentColor: '#8e7cc3' }}
                                        className="mr-3 cursor-pointer"
                                    />
                                    <span className="text-text font-medium">{v.name}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Quest Form */}
            {questForm.versions.length > 0 ? (
                <section className="bg-surface p-6 rounded-2xl shadow-xl">
                    <h3 className="text-2xl text-accentAlt font-semibold mb-4">Quest Information</h3>
                    <form onSubmit={addNewQuest} className="space-y-4">
                        <label className="block">
                            <span className="text-muted block mb-1">Title</span>
                            <input 
                                name="title" 
                                value={questForm.title} 
                                onChange={handleChange}
                                className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                            />
                        </label>
                        
                        <label className="block">
                            <span className="text-muted block mb-1">Description</span>
                            <input 
                                name="description" 
                                value={questForm.description} 
                                onChange={handleChange}
                                className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                            />
                        </label>
                        
                        <label className="block">
                            <span className="text-muted block mb-1">Location</span>
                            <input 
                                name="location" 
                                value={questForm.location} 
                                onChange={handleChange}
                                className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                            />
                        </label>
                        
                        <label className="block">
                            <span className="text-muted block mb-1">Requirement</span>
                            <input 
                                name="requirement" 
                                value={questForm.requirement} 
                                onChange={handleChange}
                                className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                            />
                        </label>
                        
                        <label className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                name="missable" 
                                value={questForm.missable || false} 
                                onChange={handleChange}
                                checked={questForm.missable === 1}
                                style={{ accentColor: '#8e7cc3' }}
                                className="w-5 h-5 cursor-pointer"
                            />
                            <span className="text-text font-medium">Missable</span>
                        </label>
                        
                        <label className="block">
                            <span className="text-muted block mb-1">Hint</span>
                            <input 
                                name="hint" 
                                value={questForm.hint} 
                                onChange={handleChange}
                                className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                            />
                        </label>

                        {selectedVer && selectedVer.extras.map(extraName => (
                            <label key={extraName} className="block">
                                <span className="text-muted block mb-1">{extraName}</span>
                                <input
                                    name={extraName}
                                    value={questForm.extras?.[extraName] || ""}
                                    onChange={handleExtraChange}
                                    className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                                />
                            </label>
                        ))}

                        <div className="flex gap-4 mt-6">
                            <button 
                                type='submit'
                                className="bg-accent hover:bg-accentAlt text-[#0d0b1e] font-semibold px-6 py-2 rounded-xl shadow-lg transition"
                            >
                                Add Quest
                            </button>
                            <button 
                                type="button" 
                                onClick={resetForm}
                                className="bg-surface hover:bg-accent/10 text-accent border border-accent/30 font-semibold px-6 py-2 rounded-xl transition"
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </section>
            ) : (
                <div className="bg-surface/60 p-8 rounded-2xl shadow-xl text-center">
                    <p className="text-muted text-lg">Please select a game and version to continue</p>
                </div>
            )}
        </div>
    );
    }

    export default AddQuest;