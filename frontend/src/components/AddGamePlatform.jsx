import React, { useState, useEffect, useContext, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import DeleteModal from './DeleteModal'
import ConfirmModal from './ConfirmModal'

function AddGamePlatform() {

    //User token
    const { user } = useContext(AuthContext)
    const token = localStorage.getItem('token');

    //Toast
    const navigate = useNavigate();
    const hasShown = useRef(false)
    const location = useLocation();

    const [allPlatforms, setAllPlatforms] = useState([]);
    const [games, setGames] = useState([]);
    
    // Game values
    const [gameName, setGameName] = useState("");
    const [platforms, setPlatforms] = useState([]);

    //Platform values
    const [platformName, setPlatformName] = useState("");
    const [manufacturer, setManufacturer] = useState("");

    //Selected Game / Platform
    const [selectedDelete, setSelectedDelete] = useState(null);

    // Modals
    const [platformModal, setPlatformModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    // Quest count for confirmModal:
    const [questCount, setQuestCount] = useState(0);

    // Version values:
    const [versions, setVersions] = useState([])
    const initialVersionForm = {
        name: "",
        year: "",
        publisher: "",
        gameId: null
    }

    const [versionForm, setVersionForm] = useState(initialVersionForm);
    const [confirmVerModal, setConfirmVerModal] = useState(false);

    // Add new Game
    const addGame = async () => {
        if (!platforms) {
            alert("Please select at least one platform")
        }
        try{
            const gameRes = await fetch('http://localhost:3001/api/games', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    'name': gameName,
                    'platforms': platforms
                }),
            });

            if (!gameRes.ok) {
                throw new Error(`Server error ${gameRes.status}`)
            }
            const gameData = await gameRes.json();
            console.log('Game added:', gameData);
            toast(`Game "${gameName}" added`);
            fetchGames();
            resetGame();

        } catch (err) {
            console.error('Failed to add game', err)
        }
    };

    // Add Version
    const addVersion = async (e) => {
        e.preventDefault();
        if (!versionForm.gameId) {
            alert("Please select at least one game.")
            return;
        }
        try{
            const res = await fetch('http://localhost:3001/api/versions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(versionForm),
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`)
            }
            const data = await res.json();
            console.log('Version added:', data);
            resetVersion();
            fetchVersions();
            toast("Version added")
        } catch (err) {
            console.error('Failed to add version: ', err)
        }
    };

    // Add new Platform
    const addPlatform = async () => {
        try{
            const platformRes = await fetch('http://localhost:3001/api/platforms', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    'name': platformName,
                    'manufacturer': manufacturer
                }),
            });
            if (!platformRes.ok) {
                throw new Error (`Server error ${platformRes.status}`)
            }

            const platformData = await platformRes.json();
            console.log('Platform added:', platformData);
            toast(`Platform "${platformName}" added`);
            fetchPlatforms();
            resetPlatform();

        } catch (err) {
            console.error('Failed to add platform', err)
        }
    };

    const handleDeleteClick = (to_delete, type) => {
        setSelectedDelete(to_delete)
        console.log("About to delete: ", to_delete)

        switch(type) {
            case 'game':
                return deleteGame(to_delete)
            case 'platform':
                return setPlatformModal(true)
            case 'version':
                return deleteVersion(to_delete)
        }
    }
    
    const deleteGame = async (game) => {
        try{
            const res = await fetch(`http://localhost:3001/api/games/${game.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer: ${token}`
                }
            })
            if (res.status == 409) {
                const data = await res.json()
                console.log(`Requires confirmation: ${data.requireConfirmation}, questCount: ${data.questCount}`)
                setQuestCount(data.questCount)
                setConfirmModal(true)
                return;
            }

            if (!res.ok) {
                throw new Error(`Server error ${res.status}`)
            }

            const data = await res.json()
            console.log(`${game.name} deleted.`);
            toast(`${game.name} deleted!`);
            fetchGames();
            setConfirmModal(false);
            return;
        } catch (err) {
            console.error('Failed to delete game:', err)
        }
    };

    const forceDeleteGame = async () => {
        try{
            const res = await fetch(`http://localhost:3001/api/games/${selectedDelete.id}?force=true`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer: ${token}`
                    }
                });
                console.log(`${selectedDelete.name} and ${questCount} quests deleted`)
                toast(`Game deleted succesfully!`)
                fetchGames();
                fetchVersions();
                setConfirmModal(false);
            } catch (err) {
                console.log(`Error deleting game:`, err)
            }
        }


const deleteVersion = async (ver) => {
        try{
            const res = await fetch(`http://localhost:3001/api/versions/${ver.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer: ${token}`
                }
            })
            if (res.status == 409) {
                const data = await res.json();
                console.log(`Requires confirmation: ${data.requireConfirmation}, questCount: ${data.questCount}`)
                setQuestCount(data.questCount)
                setConfirmVerModal(true)
                return;
            }

            if (!res.ok) {
                throw new Error(`Server error ${res.status}`)
            }

            const data = await res.json()
            console.log(`${ver.name} deleted.`);
            toast(`${ver.name} deleted!`);
            fetchVersions();
            setConfirmVerModal(false);
            return;
        } catch (err) {
            console.error('Failed to delete version:', err)
        }
    };

    const forceDeleteVersion = async () => {
        try{
            const res = await fetch(`http://localhost:3001/api/versions/${selectedDelete.id}?force=true`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer: ${token}`
                    }
                });
                console.log(`${selectedDelete.name} and ${questCount} related quests deleted`)
                toast(`Version deleted succesfully!`)
                fetchVersions();
                setConfirmVerModal(false);
            } catch (err) {
                console.log(`Error deleting version:`, err)
            }
        }

    const deletePlatform = () => {
        fetch(`http://localhost:3001/api/platforms/${selectedDelete.id}`, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer: ${token}`
            }
        })
        .then(() => {
            console.log(`${selectedDelete.name} deleted.`)
            toast(`${selectedDelete.name} deleted!`)
            fetchPlatforms();
        })
        .catch(err => {
            console.error('Error deleting platform:', err);
            toast("Failed to delete platform")
        })
        .finally(() => {
            setPlatformModal(false);
        })
    };

    const handleChecked = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setPlatforms((prev) => [...prev, value]);
        } else {
            setPlatforms((prev) => prev.filter((p) => p !== value));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setVersionForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    
    //Reset forms
    const resetGame = () => {
        setGameName("")
        setPlatforms([])
        };

    const resetPlatform = () => {
        setPlatformName("")
        setManufacturer("")
        };

    const resetVersion = () => {
        setVersionForm(initialVersionForm)
    }


    // Get platforms:
    const fetchPlatforms = () => {
        const res = fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setAllPlatforms(data)
        });
    };

    const fetchGames = () => {
        const gameres =  fetch('http://localhost:3001/api/games')
        .then(gameres => gameres.json())
        .then(data => {
            setGames(data)
        });
    }

    const fetchVersions = async () => {
        const verRes = fetch('http://localhost:3001/api/versions')
        .then(verRes => verRes.json())
        .then(data => {
            setVersions(data)
            console.log(data)
        })
    }

    useEffect(() => {
        fetchPlatforms();
        fetchGames();
        fetchVersions();
    }, [])

    // Show toast when returning from successful add/edit/delete
    useEffect(() => {
        if (location.state?.toastMessage && !hasShown.current) {
            toast(location.state.toastMessage);
            hasShown.current = true;
            navigate(location.pathname, {replace: true})
        }
    }, [location, navigate]);

    return(
        <>
        {/* Add Game*/} 
            <div>
                <h4>Existing games</h4>
                <ul>
                    {games.map(game => (
                            <li key={game.id}>{game.name}
                            {user?.role === 'admin' && (<button onClick={() => handleDeleteClick(game, 'game')}>Delete</button>)}
                            {user?.role === 'admin' && (<Link to={`/games/${game.id}`}>Edit</Link>)}
                            </li>
                    ))}
                </ul>
                <h3>Add New Game</h3>
                <input 
                    type='text'
                    placeholder='Name'
                    value={gameName}
                    onChange={(g) => setGameName(g.target.value)}                
                />
                <ul>
                    {allPlatforms.map(platform => (
                            <li key={platform.id}>
                                <input type='checkbox' value={platform.name} onChange={handleChecked} checked={platforms.includes(platform.name)}/>
                                <label>{platform.name}</label>
                            </li>
                    
                    ))}
                </ ul>
                <p>Selected: {platforms.join(", ")}</p>
                <button onClick={addGame}>Add Game</button>
            </div>

            {/* Add Version*/}
            <h3>Versions:</h3>
            <h4>Existing versions: </h4>
            {versions.map(ver => (
                <div key={ver.gameName}>
                    <h5>{ver.gameName}</h5>
                    <ul>
                        {ver.version.map(v => (
                            <li key={v.id}>
                                {v.name}
                                {user?.role === 'admin' && (<button onClick={() => handleDeleteClick(v, 'version')}>Delete</button>)}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            <div>
                <form onSubmit={addVersion}>
                    <h3>Add version</h3>
                    <label>
                        Name:
                        <input name='name' placeholder='Name' value={versionForm.name} onChange={handleChange}/>
                    </label>
                    <label>
                        Year:
                        <input name='year' placeholder='Release Year' value={versionForm.year} onChange={handleChange} />
                    </label>
                    <label>
                        Developer:
                        <input name='publisher' placeholder='Developer' value={versionForm.publisher} onChange={handleChange} />
                    </label>
                    <label>
                        Game:
                        <ul>
                        {games.map(g => (
                            <li key={g.id}>
                                <label>
                                    <input name='gameId' type='radio' value={g.id} onChange={handleChange} checked={versionForm.gameId == g.id} />
                                    {g.name}
                                </label>
                            </li>
                        ))}
                        </ul>
                    </label>
                    <p>game id: {versionForm.gameId}</p>
                    <button type='submit'>Add Version</button>
                    <button type='button' onClick={resetVersion}>Clear</button>
                </form>
            </div>

            {/* Add Game*/} 
            <div>
                <h3>Add New Platform</h3>
                <h4>Existing Platforms</h4>
                <ul>
                    {allPlatforms.map(platform => (
                            <li key={platform.id}>{platform.name}
                                {user?.role === 'admin' && (<button onClick={() => handleDeleteClick(platform, 'platform')}>Delete</button>)}
                            </li>
                        
                    ))}
                </ul>
                <input 
                    type='text'
                    placeholder='Name'
                    value={platformName}
                    onChange={(p) => setPlatformName(p.target.value)}            
                />
                <input 
                    type='text'
                    placeholder='Manufacturer'
                    value={manufacturer}
                    onChange={(p) => setManufacturer(p.target.value)}      
                />
                <button onClick={addPlatform}>Add Platform</button>

                {platformModal && (
                    <DeleteModal
                    itemName={selectedDelete.name}
                    onConfirm={deletePlatform}
                    onCancel={() => setPlatformModal(false)}
                    />
                )}

                {confirmModal && (
                    <ConfirmModal
                    itemName={selectedDelete.name}
                    onConfirm={forceDeleteGame}
                    onCancel={() => setConfirmModal(false)}
                    questCount={questCount}
                    />
                )}

                {confirmVerModal && (
                    <ConfirmModal
                    itemName={selectedDelete.name}
                    onConfirm={forceDeleteVersion}
                    onCancel={() => setConfirmVerModal(false)}
                    questCount={questCount}
                    />
                )}

            </div>
        </>

    )
}

export default AddGamePlatform