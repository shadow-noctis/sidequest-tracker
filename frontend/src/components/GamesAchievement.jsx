import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function GamesAchievement() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        fetch('http://localhost:3001/api/games')
        .then(res => res.json())
        .then(data => {
            setGames(data)
            setLoading(false)
            console.log(data)
        })
        .catch(err => {
            console.error('Error fetching games:', err);
            setLoading(false);
        })
    }, []);

    if (loading) return <p>Loading games</p>;

    return (
        <>
            <h2 className="text-center text-4xl text-accent px-4 py-4">Games</h2>
            <div className='grid grid-cols-2 gap-6 px-4'>
                {games.map(game => (
                    <Link 
                        key={game.id}
                        to={`/games/${game.id}/achievements`}
                        state={{ gameName: game.name }}
                        className="rounded-2xl p-6 text-center cursor-pointer 
                            bg-surface/80 hover:bg-surface/100 
                            border border-accent/30 hover:border-accent/80 
                            shadow-md hover:shadow-accent/30 
                            text-accentAlt text-xl font-semibold tracking-wide 
                            transition-all duration-200 block"
                        >
                            {game.name}
                        </Link>
                ))}
            </div>
        </>
    )
}

export default GamesAchievement;