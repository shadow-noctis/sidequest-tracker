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
    const [publisher, setPublisher] = useState("");
    const [platforms, setPlatforms] = useState([]);
    const [year, setYear] = useState("");

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

    // Add new Game
    const addGame = async () => {
        try{
            const gameRes = await fetch('http://localhost:3001/api/games', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    'name': gameName,
                    'publisher': publisher,
                    'release_date': year,
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
        type === 'game' ? deleteGame(to_delete) : setPlatformModal(true)

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
            const data = await res.json()
            if (res.status == 409) {
                console.log(`Requires confirmation: ${data.requireConfirmation}, questCount: ${data.questCount}`)
                setQuestCount(data.questCount)
                setConfirmModal(true)
                return;
            }
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
                console.log(`${selectedDelete.name} and ${questCount} related quests deleted`)
                toast(`Game deleted succesfully!`)
                fetchGames();
                setConfirmModal(false);
            } catch (err) {
                console.log(`Error deleting game:`, err)
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
    
    
    //Reset forms
    const resetGame = () => {
        setGameName("")
        setPublisher("")
        setYear("")
        };

    const resetPlatform = () => {
        setPlatformName("")
        setManufacturer("")
        };


    // Get platforms:
    const fetchPlatforms = async () => {
        const res = await fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            setAllPlatforms(data)
        });
    };

    const fetchGames = async () => {
        const gameres =  await fetch('http://localhost:3001/api/games')
        .then(gameres => gameres.json())
        .then(data => {
            setGames(data)
        });
    }

    useEffect(() => {
        fetchPlatforms();
        fetchGames();
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
            <div>
                <h4>Existing games</h4>
                <ul>
                    {games.map(game => (
                        <ul>
                            <li key={game.name}>{game.name}
                            {user?.role === 'admin' && (<button onClick={() => handleDeleteClick(game, 'game')}>Delete</button>)}
                            {user?.role === 'admin' && (<Link to={`/games/${game.id}`}>Edit</Link>)}
                            </li>
                        </ul>
                    ))}
                </ul>
                <h3>Add New Game</h3>
                <input 
                    type='text'
                    placeholder='Name'
                    value={gameName}
                    onChange={(g) => setGameName(g.target.value)}                
                />
                <input 
                    type='text'
                    placeholder='Publisher'
                    value={publisher}
                    onChange={(g) => setPublisher(g.target.value)}                
                />
                <input 
                    type='text'
                    placeholder='Release year'
                    value={year}
                    onChange={(g) => setYear(g.target.value)}                
                />
                {allPlatforms.map(platform => (
                    <ul>
                        <li key={platform.id}>
                            <input type='checkbox' value={platform.name} onChange={handleChecked} />
                            <label>{platform.name}</label>
                        </li>
                    </ ul>
                ))}
                <p>Selected: {platforms.join(", ")}</p>
                <button onClick={addGame}>Add Game</button>
            </div>
            <div>
                <h3>Add New Platform</h3>
                <h4>Existing Platforms</h4>
                <ul>
                    {allPlatforms.map(platform => (
                        <ul>
                            <li key={platform.id}>{platform.name}
                                {user?.role === 'admin' && (<button onClick={() => handleDeleteClick(platform, 'platform')}>Delete</button>)}
                            </li>
                        </ul>
                        
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
                )},

                {confirmModal && (
                    <ConfirmModal
                    itemName={selectedDelete.name}
                    onConfirm={forceDeleteGame}
                    onCancel={() => setConfirmModal(false)}
                    questCount={questCount}
                    />
                )}

            </div>
        </>

    )
}

export default AddGamePlatform