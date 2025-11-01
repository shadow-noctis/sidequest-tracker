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

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-black text-gray-100 px-6 py-10">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(140,90,255,0.4)] p-8 border border-indigo-700/40">
            <h1 className="text-4xl font-bold text-center text-indigo-300 mb-8 tracking-wide drop-shadow-[0_0_10px_rgba(180,120,255,0.6)]">
              ✧ Add New Quest ✧
            </h1>
    
            {/* 1. Select game */}
            <section className="mb-6">
              <h3 className="text-2xl text-indigo-200 font-semibold mb-3">Game</h3>
              <ul className="space-y-2">
                {allGames.map((g) => (
                  <li
                    key={g.id}
                    className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-indigo-700/40 hover:bg-indigo-900/40 transition"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        name="gameId"
                        type="radio"
                        value={g.id}
                        onChange={handleChange}
                        checked={questForm.gameId == g.id}
                        className="accent-indigo-500"
                      />
                      <span className="text-indigo-100 font-medium">{g.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
    
            {/* 2. Select versions */}
            {questForm.gameId && (
              <section className="mb-6">
                <h3 className="text-2xl text-indigo-200 font-semibold mb-3">
                  Versions
                </h3>
                <ul className="space-y-2">
                  {allVersions.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-indigo-700/40 hover:bg-indigo-900/40 transition"
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          name="versions"
                          type="checkbox"
                          value={v.id}
                          onChange={handleChecked}
                          checked={questForm.versions.includes(v.id)}
                          className="accent-indigo-500"
                        />
                        <span className="text-indigo-100 font-medium">{v.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            )}
    
            {/* 3. Quest info form */}
            {questForm.versions.length > 0 ? (
              <form onSubmit={addNewQuest} className="space-y-4">
                <h3 className="text-2xl text-indigo-200 font-semibold mb-3">
                  Quest Info
                </h3>
    
                {[
                  "title",
                  "description",
                  "location",
                  "requirement",
                  "hint",
                ].map((field) => (
                  <label key={field} className="block">
                    <span className="text-indigo-100 capitalize">{field}:</span>
                    <input
                      name={field}
                      value={questForm[field]}
                      onChange={handleChange}
                      className="w-full mt-1 bg-gray-900/70 border border-indigo-700/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </label>
                ))}
    
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    name="missable"
                    checked={questForm.missable || false}
                    onChange={handleChange}
                    className="accent-indigo-500"
                  />
                  <span className="text-indigo-100">Missable</span>
                </label>
    
                {selectedVer?.extras?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xl text-indigo-200 font-semibold mb-2">
                      Extras
                    </h4>
                    {selectedVer.extras.map((extraName) => (
                      <label key={extraName} className="block mb-2">
                        <span className="text-indigo-100">{extraName}:</span>
                        <input
                          name={extraName}
                          value={questForm.extras?.[extraName] || ""}
                          onChange={handleExtraChange}
                          className="w-full mt-1 bg-gray-900/70 border border-indigo-700/40 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                      </label>
                    ))}
                  </div>
                )}
    
                <div className="flex justify-between mt-8">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-[0_0_15px_rgba(140,90,255,0.4)] transition"
                  >
                    Add Quest
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-gray-200 font-semibold transition"
                  >
                    Clear
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-indigo-300 italic text-center mt-6">
                ✦ Select a game and version to add new quest for QuestLedger ✦
              </p>
            )}
          </div>
        </div>
      );
    }

    export default AddQuest;