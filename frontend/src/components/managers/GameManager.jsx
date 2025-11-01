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

    return (
        <div id="game-manager" className="px-8 py-6 text-text">
          <h2 className="text-4xl font-bold text-accent mb-6 text-center">Games</h2>
    
          {/* Existing Games */}
          <section className="mb-8">
            <h3 className="text-2xl text-accentAlt font-semibold mb-4">
              Existing Games
            </h3>
            <ul className="space-y-2">
              {games.map((game) => (
                <li
                  key={game.id}
                  className="flex items-center justify-between bg-surface px-4 py-3 rounded-xl shadow-md border border-accent/30 hover:bg-accent/10 transition"
                >
                  <span className="text-lg font-medium">{game.name}</span>
                  <div className="flex gap-3">
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteClick(game)}
                        className="text-error hover:text-error/80 transition font-semibold"
                      >
                        Delete
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <Link
                        to={`/games/${game.id}`}
                        className="text-accentAlt hover:text-accent font-medium"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
    
          {/* Add New Game */}
          <section className="bg-surface p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl text-accentAlt font-semibold mb-4">
              Add New Game
            </h3>
    
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <label className="block">
                <span className="text-muted">Name</span>
                <input
                  type="text"
                  placeholder="Name"
                  value={gameName}
                  onChange={(g) => setGameName(g.target.value)}
                  className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition"
                />
              </label>
    
              {/* Platforms */}
              <div>
                <span className="text-muted block mb-2">Platforms</span>
                <ul className="grid grid-cols-2 gap-2">
                  {allPlatforms.map((platform) => (
                    <li
                      key={platform.id}
                      className="flex items-center bg-[#1a1633] px-3 py-2 rounded-lg hover:bg-accent/10 transition"
                    >
                      <input
                        type="checkbox"
                        value={platform.name}
                        onChange={handleChecked}
                        checked={platforms.includes(platform.name)}
                        style={{ accentColor: '#8e7cc3' }}
                        className="mr-2 cursor-pointer transition"
                      />
                      <label>{platform.name}</label>
                    </li>
                  ))}
                </ul>
              </div>
    
              <button
                onClick={addGame}
                className="bg-accent hover:bg-accentAlt text-[#0d0b1e] font-semibold px-6 py-2 rounded-xl shadow-lg transition"
              >
                Add Game
              </button>
            </form>
          </section>
    
          {/* Confirm Modal */}
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