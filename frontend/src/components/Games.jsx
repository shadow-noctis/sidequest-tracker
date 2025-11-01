import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function GamesList() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        fetch('http://localhost:3001/api/games')
        .then(res => res.json())
        .then(data => {
            setGames(data)
            setLoading(false)
        })
        .catch(err => {
            console.error('Error fetching games:', err);
            setLoading(false);
        })
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-black text-gray-100 px-6 py-10">
            <p className="text-center text-indigo-300">Loading games...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-black text-gray-100 px-6 py-10">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-2xl shadow-[0_0_25px_rgba(140,90,255,0.4)] p-8 border border-indigo-700/40">
                <h2 className="text-4xl font-bold text-center text-indigo-300 mb-8 tracking-wide drop-shadow-[0_0_10px_rgba(180,120,255,0.6)]">
                    ✧ Games ✧
                </h2>

                <div className='grid grid-cols-2 gap-6'>
                    {games.map(game => (
                        <Link 
                            key={game.id}
                            to={`/games/${game.id}/quests`}
                            state={{ gameName: game.name }}
                            className="rounded-2xl p-6 text-center cursor-pointer 
                                bg-gray-800/50 hover:bg-indigo-900/40 
                                border border-indigo-700/40 hover:border-indigo-600/60 
                                shadow-md hover:shadow-[0_0_15px_rgba(140,90,255,0.4)] 
                                text-indigo-100 text-xl font-semibold tracking-wide 
                                transition-all duration-200 block"
                            >
                                {game.name}
                            </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GamesList;