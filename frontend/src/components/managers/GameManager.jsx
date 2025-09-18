import React, { useState, useEffect, useContext, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import DeleteModal from '../DeleteModal'
import ConfirmModal from '../ConfirmModal'

function GameManager() {

    //User token
    const { user } = useContext(AuthContext)
    const token = localStorage.getItem('token');

    //Toast
    const navigate = useNavigate();
    const hasShown = useRef(false)
    const location = useLocation();

    const [games, setGames] = useState([]);
    const [allPlatforms, setAllPlatforms] = useState([])
    
    // Values to backend
    const [gameName, setGameName] = useState("");
    const [platforms, setPlatforms] = useState([]);

    // Selected for delete
    const [selectedDelete, setSelectedDelete] = useState(null)

    // Delete warning
    const [confirmModal, setConfirmModal] = useState(false);

    // Quest count for confirmModal:
    const [questCount, setQuestCount] = useState(0);
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
                setConfirmModal(false);
            } catch (err) {
                console.log(`Error deleting game:`, err)
            }
        }

    const resetGame = () => {
        setGameName("")
        setPlatforms([])
        };


    const handleChecked = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setPlatforms((prev) => [...prev, value]);
        } else {
            setPlatforms((prev) => prev.filter((p) => p !== value));
        }
    };

    const handleDeleteClick = (to_delete) => {
        setSelectedDelete(to_delete);
        deleteGame(to_delete)
    }

    // Get existing games
    const fetchGames = () => {
        const gameres =  fetch('http://localhost:3001/api/games')
        .then(gameres => gameres.json())
        .then(data => {
            setGames(data)
        });
    }

    // Get all platforms
    const fetchPlatforms = () => {
        const res = fetch('http://localhost:3001/api/platforms')
        .then(res => res.json())
        .then(data => {
            console.log(data)
            setAllPlatforms(data)
        });
    };

    // Get existing games
    useEffect(() => {
        fetchGames();
        fetchPlatforms();
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
        <div id='game-manager'>
            <h2>Games</h2>
            
            {/* List existing platforms*/}
            <h4>Existing games</h4>
            <ul>
                {games.map(game => (
                        <li key={game.id}>{game.name}
                        {user?.role === 'admin' && (<button onClick={() => handleDeleteClick(game)}>Delete</button>)}
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

            {confirmModal && (
                <ConfirmModal
                itemName={selectedDelete.name}
                onConfirm={forceDeleteGame}
                onCancel={() => setConfirmModal(false)}
                questCount={questCount}
                />
            )}
        </div>
    )



};
export default GameManager;